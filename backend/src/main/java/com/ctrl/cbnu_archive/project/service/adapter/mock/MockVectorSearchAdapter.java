package com.ctrl.cbnu_archive.project.service.adapter.mock;

import com.ctrl.cbnu_archive.project.service.port.VectorMatch;
import com.ctrl.cbnu_archive.project.service.port.VectorSearchPort;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "vector", havingValue = "mock", matchIfMissing = true)
public class MockVectorSearchAdapter implements VectorSearchPort {

    private static final Logger log = LoggerFactory.getLogger(MockVectorSearchAdapter.class);
    private final Map<Long, float[]> embeddings = new ConcurrentHashMap<>();
    private final Map<Long, Map<String, Object>> metadata = new ConcurrentHashMap<>();

    @Override
    public void upsert(Long projectId, float[] embedding, Map<String, Object> metadata) {
        Objects.requireNonNull(projectId, "projectId must not be null");
        Objects.requireNonNull(embedding, "embedding must not be null");
        log.info("[MOCK] called upsert(projectId={}, embeddingLength={}, metadata={})", projectId, embedding.length, metadata);
        this.embeddings.put(projectId, embedding.clone());
        this.metadata.put(projectId, metadata == null ? Map.of() : Map.copyOf(metadata));
    }

    @Override
    public List<VectorMatch> searchSimilar(float[] queryEmbedding, int topK) {
        Objects.requireNonNull(queryEmbedding, "queryEmbedding must not be null");
        log.info("[MOCK] called searchSimilar(topK={}, queryEmbeddingLength={})", topK, queryEmbedding.length);
        List<VectorMatch> scored = new ArrayList<>();
        for (var entry : embeddings.entrySet()) {
            float score = cosineSimilarity(queryEmbedding, entry.getValue());
            scored.add(new VectorMatch(entry.getKey(), score, metadata.getOrDefault(entry.getKey(), Map.of())));
        }
        scored.sort(Comparator.comparing(VectorMatch::score).reversed());
        return scored.stream().limit(topK).toList();
    }

    @Override
    public void delete(Long projectId) {
        log.info("[MOCK] called delete(projectId={})", projectId);
        embeddings.remove(projectId);
        metadata.remove(projectId);
    }

    private float cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) {
            return 0f;
        }
        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) {
            return 0f;
        }
        return (float) (dot / (Math.sqrt(normA) * Math.sqrt(normB)));
    }
}
