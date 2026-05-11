package com.ctrl.cbnu_archive.project.dto;

import com.ctrl.cbnu_archive.auth.domain.User;
import com.ctrl.cbnu_archive.project.domain.Project;
import java.util.List;

public record ProjectCreateRequest(
        String title,
        String description,
        String readme,
        List<String> techStacks,
        Integer year,
        String semester,
        String difficulty,
        String domain,
        Boolean isTeam
) {
    public Project toEntity(User author) {
        return Project.create(
                title,
                null,
                description,
                readme,
                techStacks,
                year,
                semester,
                difficulty,
                domain,
                isTeam,
                author
        );
    }
}
