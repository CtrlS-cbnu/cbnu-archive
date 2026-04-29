package com.ctrl.cbnu_archive.project.service.adapter.mock;

import com.ctrl.cbnu_archive.project.service.port.AiRecommendationPort;
import com.ctrl.cbnu_archive.project.service.port.AiRecommendationResult;
import com.ctrl.cbnu_archive.project.service.port.ProjectContext;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "ai-recommendation", havingValue = "mock", matchIfMissing = true)
public class MockAiRecommendationAdapter implements AiRecommendationPort {

    private static final Logger log = LoggerFactory.getLogger(MockAiRecommendationAdapter.class);

    @Override
    public AiRecommendationResult recommend(String userQuery, List<ProjectContext> retrievedDocs) {
        Objects.requireNonNull(userQuery, "userQuery must not be null");
        if (retrievedDocs == null) {
            retrievedDocs = List.of();
        }
        log.info("[MOCK] called recommend(userQuery={}, retrievedDocs={})", userQuery, retrievedDocs.size());

        List<Long> recommendedProjectIds = retrievedDocs.stream()
                .map(ProjectContext::projectId)
                .limit(3)
                .collect(Collectors.toList());

        String answer = String.format(
                "[MOCK] 질문에 대한 추천 결과입니다. 입력하신 질의: '%s'. 총 %d개 프로젝트에서 후보를 찾았습니다.",
                userQuery,
                retrievedDocs.size()
        );
        String reasoning = String.format(
                "문장에 포함된 키워드와 검색된 프로젝트의 제목/설명을 기반으로 추천 목록을 생성했습니다. 추천 프로젝트 개수: %d.",
                recommendedProjectIds.size()
        );

        return new AiRecommendationResult(answer, recommendedProjectIds, reasoning);
    }
}
