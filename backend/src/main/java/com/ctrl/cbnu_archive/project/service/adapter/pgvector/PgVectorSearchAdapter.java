package com.ctrl.cbnu_archive.project.service.adapter.pgvector;

import com.ctrl.cbnu_archive.project.service.port.VectorMatch;
import com.ctrl.cbnu_archive.project.service.port.VectorSearchPort;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "vector", havingValue = "pgvector")
public class PgVectorSearchAdapter implements VectorSearchPort {

    private static final Logger log = LoggerFactory.getLogger(PgVectorSearchAdapter.class);

    private static final String UPSERT_SQL =
            "INSERT INTO project_vectors (project_id, embedding, metadata) " +
            "VALUES (?, CAST(? AS vector), CAST(? AS jsonb)) " +
            "ON CONFLICT (project_id) DO UPDATE " +
            "SET embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata";

    private static final String SEARCH_SQL =
            "SELECT project_id, " +
            "       1 - (embedding <=> CAST(? AS vector)) AS score " +
            "FROM project_vectors " +
            "ORDER BY embedding <=> CAST(? AS vector) " +
            "LIMIT ?";

    private static final String DELETE_SQL =
            "DELETE FROM project_vectors WHERE project_id = ?";

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public PgVectorSearchAdapter(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void upsert(Long projectId, float[] embedding, Map<String, Object> metadata) {
        Objects.requireNonNull(projectId, "projectId must not be null");
        Objects.requireNonNull(embedding, "embedding must not be null");

        if (embedding.length == 0) {
            log.warn("[PGVECTOR] upsert 건너뜀: 빈 임베딩 벡터 projectId={}", projectId);
            return;
        }

        String vectorStr = toVectorString(embedding);
        String metadataJson = toJson(metadata);

        jdbcTemplate.update(UPSERT_SQL, projectId, vectorStr, metadataJson);
        log.info("[PGVECTOR] upsert 완료: projectId={}, dim={}", projectId, embedding.length);
    }

    @Override
    public List<VectorMatch> searchSimilar(float[] queryEmbedding, int topK) {
        Objects.requireNonNull(queryEmbedding, "queryEmbedding must not be null");

        if (queryEmbedding.length == 0) {
            log.warn("[PGVECTOR] searchSimilar 건너뜀: 빈 쿼리 벡터");
            return Collections.emptyList();
        }

        String vectorStr = toVectorString(queryEmbedding);

        List<VectorMatch> results = jdbcTemplate.query(
                SEARCH_SQL,
                (rs, rowNum) -> new VectorMatch(
                        rs.getLong("project_id"),
                        rs.getFloat("score"),
                        Map.of()
                ),
                vectorStr, vectorStr, topK
        );

        log.info("[PGVECTOR] searchSimilar 완료: topK={}, 결과={}건", topK, results.size());
        return results;
    }

    @Override
    public void delete(Long projectId) {
        Objects.requireNonNull(projectId, "projectId must not be null");
        int deleted = jdbcTemplate.update(DELETE_SQL, projectId);
        log.info("[PGVECTOR] delete 완료: projectId={}, deleted={}", projectId, deleted);
    }

    private String toVectorString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    private String toJson(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            log.warn("[PGVECTOR] metadata JSON 직렬화 실패: {}", e.getMessage());
            return "{}";
        }
    }
}
