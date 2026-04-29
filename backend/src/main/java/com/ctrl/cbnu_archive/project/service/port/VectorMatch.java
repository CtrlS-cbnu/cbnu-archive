package com.ctrl.cbnu_archive.project.service.port;

import java.util.Map;

public record VectorMatch(
        Long projectId,
        float score,
        Map<String, Object> metadata
) {
}
