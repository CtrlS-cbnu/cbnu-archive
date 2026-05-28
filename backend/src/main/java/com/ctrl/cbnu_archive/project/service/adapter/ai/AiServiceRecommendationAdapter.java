package com.ctrl.cbnu_archive.project.service.adapter.ai;

import com.ctrl.cbnu_archive.project.service.port.AiRecommendationPort;
import com.ctrl.cbnu_archive.project.service.port.AiRecommendationResult;
import com.ctrl.cbnu_archive.project.service.port.ProjectContext;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "ai-recommendation", havingValue = "ai")
public class AiServiceRecommendationAdapter implements AiRecommendationPort {

    private static final Logger log = LoggerFactory.getLogger(AiServiceRecommendationAdapter.class);
    private final RestClient restClient;

    public AiServiceRecommendationAdapter(@Value("${app.ai.base-url:http://localhost:8000}") String aiBaseUrl) {
        this.restClient = RestClient.builder().baseUrl(aiBaseUrl).build();
    }

    @Override
    public AiRecommendationResult recommend(String userQuery, List<ProjectContext> retrievedDocs) {
        List<Long> projectIds = retrievedDocs == null ? Collections.emptyList()
                : retrievedDocs.stream().map(ProjectContext::projectId).collect(Collectors.toList());
        try {
            Map<String, Object> request = Map.of("query", userQuery, "top_k", 5);
            Map<?, ?> response = restClient.post()
                    .uri("/search")
                    .body(request)
                    .retrieve()
                    .body(Map.class);
            if (response != null) {
                String answer = response.get("answer") instanceof String s ? s : "";
                return new AiRecommendationResult(answer, projectIds, "벡터 유사도 기반 검색 결과");
            }
        } catch (RestClientException e) {
            log.warn("[AI] recommend 실패 - AI 서비스 연결 오류: {}", e.getMessage());
        }
        return new AiRecommendationResult("AI 검색 서비스를 일시적으로 이용할 수 없습니다.", projectIds, "");
    }
}
