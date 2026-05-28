package com.ctrl.cbnu_archive.project.service.adapter.ai;

import com.ctrl.cbnu_archive.project.service.port.EmbeddingPort;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "embedding", havingValue = "ai")
public class AiServiceEmbeddingAdapter implements EmbeddingPort {

    private static final Logger log = LoggerFactory.getLogger(AiServiceEmbeddingAdapter.class);

    private final RestClient restClient;

    public AiServiceEmbeddingAdapter(
            @Value("${app.ai.base-url:http://localhost:8000}") String aiBaseUrl) {
        this.restClient = RestClient.builder().baseUrl(aiBaseUrl).build();
    }

    @Override
    public float[] embed(String text) {
        Objects.requireNonNull(text, "text must not be null");
        try {
            Map<?, ?> response = restClient.post()
                    .uri("/embed")
                    .body(Map.of("text", text))
                    .retrieve()
                    .body(Map.class);
            return parseEmbedding(response, "embedding");
        } catch (RestClientException e) {
            log.warn("[AI] embed 실패 - AI 서비스 연결 오류: {}", e.getMessage());
            return new float[0];
        }
    }

    @Override
    public List<float[]> embedBatch(List<String> texts) {
        Objects.requireNonNull(texts, "texts must not be null");
        if (texts.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            Map<?, ?> response = restClient.post()
                    .uri("/embed")
                    .body(Map.of("texts", texts))
                    .retrieve()
                    .body(Map.class);
            return parseBatchEmbeddings(response);
        } catch (RestClientException e) {
            log.warn("[AI] embedBatch 실패 - AI 서비스 연결 오류: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private float[] parseEmbedding(Map<?, ?> response, String key) {
        if (response == null) {
            return new float[0];
        }
        Object raw = response.get(key);
        if (!(raw instanceof List<?> list)) {
            log.warn("[AI] 응답에 '{}' 필드가 없거나 형식이 잘못되었습니다. response={}", key, response);
            return new float[0];
        }
        return toFloatArray(list);
    }

    private List<float[]> parseBatchEmbeddings(Map<?, ?> response) {
        if (response == null) {
            return Collections.emptyList();
        }
        Object raw = response.get("embeddings");
        if (!(raw instanceof List<?> outer)) {
            log.warn("[AI] 배치 응답에 'embeddings' 필드가 없거나 형식이 잘못되었습니다.");
            return Collections.emptyList();
        }
        List<float[]> result = new ArrayList<>(outer.size());
        for (Object item : outer) {
            if (item instanceof List<?> inner) {
                result.add(toFloatArray(inner));
            } else {
                result.add(new float[0]);
            }
        }
        return result;
    }

    private float[] toFloatArray(List<?> list) {
        float[] arr = new float[list.size()];
        for (int i = 0; i < list.size(); i++) {
            Object val = list.get(i);
            if (val instanceof Number n) {
                arr[i] = n.floatValue();
            }
        }
        return arr;
    }
}
