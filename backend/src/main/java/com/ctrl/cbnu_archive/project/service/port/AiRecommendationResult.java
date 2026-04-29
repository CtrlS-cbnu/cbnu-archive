package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public record AiRecommendationResult(
        String answer,
        List<Long> recommendedProjectIds,
        String reasoning
) {
}
