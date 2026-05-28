package com.ctrl.cbnu_archive.project.dto;

import java.util.List;

public record AdminStatsResponse(
        long totalProjects,
        long pendingCount,
        long rejectedCount,
        long totalDownloads,
        List<String> topTags
) {
}
