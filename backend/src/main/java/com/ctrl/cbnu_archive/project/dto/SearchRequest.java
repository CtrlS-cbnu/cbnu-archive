package com.ctrl.cbnu_archive.project.dto;

import com.ctrl.cbnu_archive.project.service.port.SearchQuery;
import java.util.List;

public record SearchRequest(
        String keyword,
        List<String> techStacks,
        Integer year,
        String semester,
        String difficulty,
        String domain,
        int page,
        int size
) {
    public SearchQuery toSearchQuery() {
        return new SearchQuery(keyword, techStacks, year, semester, difficulty, domain, page, size);
    }
}
