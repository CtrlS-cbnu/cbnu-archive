package com.ctrl.cbnu_archive.project.service.adapter.mock;

import com.ctrl.cbnu_archive.project.service.port.EmbeddingPort;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "embedding", havingValue = "mock", matchIfMissing = true)
public class MockEmbeddingAdapter implements EmbeddingPort {

    private static final Logger log = LoggerFactory.getLogger(MockEmbeddingAdapter.class);
    private static final int DIMENSION = 384;

    @Override
    public float[] embed(String text) {
        Objects.requireNonNull(text, "text must not be null");
        log.info("[MOCK] called embed(textLength={})", text.length());
        return buildFakeEmbedding(text);
    }

    @Override
    public List<float[]> embedBatch(List<String> texts) {
        Objects.requireNonNull(texts, "texts must not be null");
        log.info("[MOCK] called embedBatch(batchSize={})", texts.size());
        var results = new ArrayList<float[]>(texts.size());
        for (String text : texts) {
            results.add(buildFakeEmbedding(text));
        }
        return results;
    }

    private float[] buildFakeEmbedding(String text) {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        float[] embedding = new float[DIMENSION];
        int seed = Math.abs(text.hashCode());
        for (int i = 0; i < DIMENSION; i++) {
            int index = (seed + i) % bytes.length;
            embedding[i] = ((bytes[index] & 0xFF) / 255f) * ((i % 10 + 1) / 10f);
        }
        return embedding;
    }
}
