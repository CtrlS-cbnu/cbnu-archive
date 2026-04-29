package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public interface AiRecommendationPort {
    AiRecommendationResult recommend(String userQuery, List<ProjectContext> retrievedDocs);
}
