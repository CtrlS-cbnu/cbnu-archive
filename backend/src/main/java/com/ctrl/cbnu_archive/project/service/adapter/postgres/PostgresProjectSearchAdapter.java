package com.ctrl.cbnu_archive.project.service.adapter.postgres;

import com.ctrl.cbnu_archive.project.domain.Project;
import com.ctrl.cbnu_archive.project.repository.ProjectRepository;
import com.ctrl.cbnu_archive.project.repository.ProjectSpecification;
import com.ctrl.cbnu_archive.project.service.port.ProjectIndexDocument;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchPort;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchResult;
import com.ctrl.cbnu_archive.project.service.port.SearchQuery;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "search", havingValue = "postgres")
public class PostgresProjectSearchAdapter implements ProjectSearchPort {

    private static final Logger log = LoggerFactory.getLogger(PostgresProjectSearchAdapter.class);

    private final ProjectRepository projectRepository;

    public PostgresProjectSearchAdapter(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public void index(ProjectIndexDocument doc) {
        // 데이터는 JPA를 통해 projects 테이블에 이미 저장되므로 별도 인덱싱 불필요
        log.debug("[POSTGRES] index 호출 (no-op): projectId={}", doc.projectId());
    }

    @Override
    public void delete(Long projectId) {
        // 삭제는 JPA가 처리하므로 별도 작업 불필요
        log.debug("[POSTGRES] delete 호출 (no-op): projectId={}", projectId);
    }

    @Override
    public List<ProjectSearchResult> search(SearchQuery query) {
        Specification<Project> spec = buildSpec(query);
        PageRequest pageable = PageRequest.of(query.page(), query.size());

        return projectRepository.findAll(spec, pageable).stream()
                .map(project -> new ProjectSearchResult(
                        project.getId(),
                        project.getTitle(),
                        project.getSummary(),
                        project.getTechStacks(),
                        project.getYear(),
                        project.getSemester(),
                        project.getDifficulty(),
                        project.getDomain(),
                        project.getIsTeam(),
                        1.0f
                ))
                .collect(Collectors.toList());
    }

    private Specification<Project> buildSpec(SearchQuery query) {
        Specification<Project> spec = ProjectSpecification.approved();
        spec = spec.and(ProjectSpecification.hasKeyword(query.keyword()));
        spec = spec.and(ProjectSpecification.hasAllTechStacks(query.techStacks()));
        spec = spec.and(ProjectSpecification.yearFrom(query.yearFrom()));
        spec = spec.and(ProjectSpecification.yearTo(query.yearTo()));
        spec = spec.and(ProjectSpecification.hasSemester(query.semester()));
        spec = spec.and(ProjectSpecification.hasDifficulty(query.difficulty()));
        spec = spec.and(ProjectSpecification.hasDomain(query.domain()));
        spec = spec.and(ProjectSpecification.isTeam(query.isTeam()));
        return spec;
    }
}
