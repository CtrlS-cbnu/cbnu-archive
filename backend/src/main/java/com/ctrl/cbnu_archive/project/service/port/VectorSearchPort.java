package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;
import java.util.Map;

public interface VectorSearchPort {
    void upsert(Long projectId, float[] embedding, Map<String, Object> metadata);
    List<VectorMatch> searchSimilar(float[] queryEmbedding, int topK);
    void delete(Long projectId);
}
