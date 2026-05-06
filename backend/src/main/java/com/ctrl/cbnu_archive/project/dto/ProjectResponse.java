package com.ctrl.cbnu_archive.project.dto;

import com.ctrl.cbnu_archive.project.domain.Project;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchResult;
import java.time.LocalDateTime;
import java.util.List;

public record ProjectResponse(
        Long id,
        String title,
        String summary,
        String description,
        String readme,
        List<String> techStacks,
        Integer year,
        String semester,
        String difficulty,
        String domain,
        Long authorId,
        String authorName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ProjectResponse fromEntity(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getSummary(),
                project.getDescription(),
                project.getReadme(),
                project.getTechStacks(),
                project.getYear(),
                project.getSemester(),
                project.getDifficulty(),
                project.getDomain(),
                project.getAuthorId(),
                project.getAuthorName(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    public static ProjectResponse fromSearchResult(ProjectSearchResult result) {
        return new ProjectResponse(
                result.projectId(),
                result.title(),
                result.summary(),
                null,
                null,
                result.techStacks(),
                result.year(),
                result.semester(),
                result.difficulty(),
                result.domain(),
                null,
                null,
                null,
                null
        );
    }
}
