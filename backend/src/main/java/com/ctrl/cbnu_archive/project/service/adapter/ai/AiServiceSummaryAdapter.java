package com.ctrl.cbnu_archive.project.service.adapter.ai;

import com.ctrl.cbnu_archive.project.service.port.AiSummaryPort;
import com.ctrl.cbnu_archive.project.service.port.ExtractedMetadata;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "ai-summary", havingValue = "ai")
public class AiServiceSummaryAdapter implements AiSummaryPort {

    private static final Logger log = LoggerFactory.getLogger(AiServiceSummaryAdapter.class);
    private final RestClient restClient;

    public AiServiceSummaryAdapter(@Value("${app.ai.base-url:http://localhost:8000}") String aiBaseUrl) {
        this.restClient = RestClient.builder().baseUrl(aiBaseUrl).build();
    }

    @Override
    public String summarize(String readme, String description) {
        try {
            Map<String, Object> request = buildProjectInput(description, readme);
            Map<?, ?> response = restClient.post()
                    .uri("/metadata/analyze")
                    .body(request)
                    .retrieve()
                    .body(Map.class);
            if (response != null && response.get("passage_text") instanceof String passageText) {
                return passageText;
            }
        } catch (RestClientException e) {
            log.warn("[AI] summarize 실패 - AI 서비스 연결 오류: {}", e.getMessage());
        }
        return description != null ? description : "";
    }

    @Override
    public ExtractedMetadata extractMetadata(String text) {
        try {
            Map<String, Object> request = buildProjectInput(text, "");
            Map<?, ?> response = restClient.post()
                    .uri("/metadata/analyze")
                    .body(request)
                    .retrieve()
                    .body(Map.class);
            if (response != null) {
                List<String> techStacks = toStringList(response.get("tech_stack"));
                String domain = response.get("topic") instanceof String s ? s : null;
                String difficulty = response.get("difficulty") instanceof String s ? s : null;
                return new ExtractedMetadata(techStacks, domain, difficulty);
            }
        } catch (RestClientException e) {
            log.warn("[AI] extractMetadata 실패 - AI 서비스 연결 오류: {}", e.getMessage());
        }
        return new ExtractedMetadata(Collections.emptyList(), null, null);
    }

    private Map<String, Object> buildProjectInput(String description, String readme) {
        Map<String, Object> map = new HashMap<>();
        map.put("project_id", 0);
        map.put("title", "");
        map.put("short_summary", "");
        map.put("description", description != null ? description : "");
        map.put("readme", readme != null ? readme : "");
        map.put("report_text", "");
        map.put("file_names", Collections.emptyList());
        map.put("folder_paths", Collections.emptyList());
        map.put("config_texts", Collections.emptyMap());
        map.put("course_name", "");
        map.put("semester", "");
        return map;
    }

    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object value) {
        if (value instanceof List<?> list) {
            return (List<String>) list;
        }
        return Collections.emptyList();
    }
}
