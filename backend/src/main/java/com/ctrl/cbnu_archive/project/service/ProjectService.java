package com.ctrl.cbnu_archive.project.service;

import com.ctrl.cbnu_archive.auth.domain.User;
import com.ctrl.cbnu_archive.auth.repository.UserRepository;
import com.ctrl.cbnu_archive.project.domain.Project;
import com.ctrl.cbnu_archive.project.dto.AiRecommendResponse;
import com.ctrl.cbnu_archive.project.dto.ProjectCreateRequest;
import com.ctrl.cbnu_archive.project.dto.ProjectResponse;
import com.ctrl.cbnu_archive.project.dto.ProjectUpdateRequest;
import com.ctrl.cbnu_archive.project.dto.SearchRequest;
import com.ctrl.cbnu_archive.project.mapper.ProjectMapper;
import com.ctrl.cbnu_archive.project.repository.ProjectRepository;
import com.ctrl.cbnu_archive.project.service.event.ProjectDeleteEvent;
import com.ctrl.cbnu_archive.project.service.event.ProjectIndexEvent;
import com.ctrl.cbnu_archive.global.exception.ErrorCode;
import com.ctrl.cbnu_archive.project.exception.ProjectException;
import com.ctrl.cbnu_archive.project.service.exception.ProjectNotFoundException;
import com.ctrl.cbnu_archive.project.service.port.AiRecommendationPort;
import com.ctrl.cbnu_archive.project.service.port.AiSummaryPort;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchResult;
import com.ctrl.cbnu_archive.project.service.port.EmbeddingPort;
import com.ctrl.cbnu_archive.project.service.port.ProjectContext;
import com.ctrl.cbnu_archive.project.service.port.ProjectIndexDocument;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchPort;
import com.ctrl.cbnu_archive.project.service.port.VectorMatch;
import com.ctrl.cbnu_archive.project.service.port.VectorSearchPort;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository repository;
    private final UserRepository userRepository;
    private final ProjectSearchPort searchPort;
    private final VectorSearchPort vectorPort;
    private final EmbeddingPort embeddingPort;
    private final AiSummaryPort aiSummaryPort;
    private final AiRecommendationPort aiRecommendationPort;
    private final ApplicationEventPublisher eventPublisher;

    public ProjectService(
            ProjectRepository repository,
            UserRepository userRepository,
            ProjectSearchPort searchPort,
            VectorSearchPort vectorPort,
            EmbeddingPort embeddingPort,
            AiSummaryPort aiSummaryPort,
            AiRecommendationPort aiRecommendationPort,
            ApplicationEventPublisher eventPublisher
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.searchPort = searchPort;
        this.vectorPort = vectorPort;
        this.embeddingPort = embeddingPort;
        this.aiSummaryPort = aiSummaryPort;
        this.aiRecommendationPort = aiRecommendationPort;
        this.eventPublisher = eventPublisher;
    }

    public ProjectResponse createProject(ProjectCreateRequest request, Long authorId) {
        Objects.requireNonNull(request, "ProjectCreateRequest must not be null");
        Objects.requireNonNull(authorId, "authorId must not be null");
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ProjectException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));
        Project project = ProjectMapper.toEntity(request, author);
        if (project.getReadme() != null && !project.getReadme().isBlank()) {
            String summary = aiSummaryPort.summarize(project.getReadme(), project.getDescription());
            project.updateSummary(summary);
        }
        Project saved = repository.save(project);
        publishIndexEvent(saved);
        return ProjectMapper.toResponse(saved);
    }

    public Page<ProjectResponse> searchProjects(SearchRequest request) {
        Objects.requireNonNull(request, "SearchRequest must not be null");
        var searchResults = searchPort.search(request.toSearchQuery());
        var responses = searchResults.stream()
                .map(ProjectMapper::toResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, PageRequest.of(request.page(), request.size()), responses.size());
    }

    public AiRecommendResponse recommendByQuery(String naturalQuery) {
        Objects.requireNonNull(naturalQuery, "naturalQuery must not be null");
        float[] queryEmbedding = embeddingPort.embed(naturalQuery);
        List<VectorMatch> matches = vectorPort.searchSimilar(queryEmbedding, 5);
        List<Long> projectIds = matches.stream()
                .map(VectorMatch::projectId)
                .collect(Collectors.toList());
        List<ProjectContext> retrievedDocs = repository.findAllById(projectIds).stream()
                .map(project -> new ProjectContext(
                        project.getId(),
                        project.getTitle(),
                        project.getDescription(),
                        project.getReadme(),
                        project.getDifficulty(),
                        project.getDomain()
                ))
                .collect(Collectors.toList());
        var recommendation = aiRecommendationPort.recommend(naturalQuery, retrievedDocs);
        return new AiRecommendResponse(
                recommendation.answer(),
                recommendation.recommendedProjectIds(),
                recommendation.reasoning()
        );
    }

    public ProjectResponse getProject(Long id) {
        Project project = repository.findById(id).orElseThrow(() -> new ProjectNotFoundException(id));
        return ProjectMapper.toResponse(project);
    }

    public ProjectResponse updateProject(Long id, ProjectUpdateRequest request, Long currentUserId, boolean isAdmin) {
        Objects.requireNonNull(request, "ProjectUpdateRequest must not be null");
        Project project = repository.findById(id).orElseThrow(() -> new ProjectNotFoundException(id));
        User currentUser = getUserOrThrow(currentUserId);
        validateProjectOwnerOrAdmin(project, currentUser, isAdmin, "프로젝트 수정 권한이 없습니다.");
        ProjectMapper.applyUpdate(request, project);
        if (project.getReadme() != null && !project.getReadme().isBlank()) {
            String summary = aiSummaryPort.summarize(project.getReadme(), project.getDescription());
            project.updateSummary(summary);
        }
        Project updated = repository.save(project);
        publishIndexEvent(updated);
        return ProjectMapper.toResponse(updated);
    }

    public void deleteProject(Long id, Long currentUserId, boolean isAdmin) {
        Project project = repository.findById(id).orElseThrow(() -> new ProjectNotFoundException(id));
        User currentUser = getUserOrThrow(currentUserId);
        validateProjectOwnerOrAdmin(project, currentUser, isAdmin, "프로젝트 삭제 권한이 없습니다.");
        repository.deleteById(id);
        eventPublisher.publishEvent(new ProjectDeleteEvent(id));
    }

    private void publishIndexEvent(Project project) {
        ProjectIndexDocument indexDocument = new ProjectIndexDocument(
                project.getId(),
                project.getTitle(),
                project.getSummary(),
                project.getDescription(),
                project.getTechStacks(),
                project.getYear(),
                project.getSemester(),
                project.getDifficulty(),
                project.getDomain()
        );
        String embeddingText = buildEmbeddingText(project);
        eventPublisher.publishEvent(new ProjectIndexEvent(project.getId(), indexDocument, embeddingText));
    }

    private String buildEmbeddingText(Project project) {
        StringBuilder builder = new StringBuilder();
        builder.append(project.getTitle());
        if (project.getSummary() != null) {
            builder.append(" \n").append(project.getSummary());
        }
        if (project.getDescription() != null) {
            builder.append(" \n").append(project.getDescription());
        }
        if (project.getReadme() != null) {
            builder.append(" \n").append(project.getReadme());
        }
        return builder.toString();
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ProjectException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    private void validateProjectOwnerOrAdmin(Project project, User currentUser, boolean isAdmin, String message) {
        if (!isAdmin && !project.isAuthor(currentUser)) {
            throw new ProjectException(ErrorCode.NOT_PROJECT_OWNER, message);
        }
    }
}
