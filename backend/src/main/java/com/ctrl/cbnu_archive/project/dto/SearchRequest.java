package com.ctrl.cbnu_archive.project.dto;

import com.ctrl.cbnu_archive.project.service.port.SearchQuery;
import java.util.List;

public record SearchRequest(
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
    public SearchQuery toSearchQuery() {
        return new SearchQuery(keyword, techStacks, yearFrom, yearTo, semester, difficulty, domain, isTeam, page, size);
    }
}
