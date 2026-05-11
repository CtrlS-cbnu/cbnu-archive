package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public record ProjectSearchResult(
        Long projectId,
        String title,
        String summary,
        List<String> techStacks,
        Integer year,
        String semester,
        String difficulty,
        String domain,
        Boolean isTeam,
        float score
) {
}
