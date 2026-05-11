package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public record ProjectIndexDocument(
        Long projectId,
        String title,
        String summary,
        String description,
        List<String> techStacks,
        Integer year,
        String semester,
        String difficulty,
        String domain,
        Boolean isTeam
) {
}