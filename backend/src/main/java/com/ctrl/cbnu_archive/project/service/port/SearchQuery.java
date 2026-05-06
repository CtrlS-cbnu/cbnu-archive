package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public record SearchQuery(
        String keyword,
        List<String> techStacks,
        Integer year,
        String semester,
        String difficulty,
        String domain,
        int page,
        int size
) {
}
