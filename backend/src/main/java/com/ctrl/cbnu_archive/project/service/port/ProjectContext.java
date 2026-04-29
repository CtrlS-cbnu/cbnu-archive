package com.ctrl.cbnu_archive.project.service.port;

public record ProjectContext(
        Long projectId,
        String title,
        String description,
        String readme,
        String difficulty,
        String domain
) {
}
