package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public record SearchQuery(
        String keyword,
        List<String> techStacks,
        Integer yearFrom,
        Integer yearTo,
        String semester,
        String difficulty,
        String domain,
        Boolean isTeam,
        int page,
        int size
) {
}
