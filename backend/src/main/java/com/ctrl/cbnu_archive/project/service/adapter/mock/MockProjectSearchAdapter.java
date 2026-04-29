package com.ctrl.cbnu_archive.project.service.adapter.mock;

import com.ctrl.cbnu_archive.project.service.port.ProjectIndexDocument;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchPort;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchResult;
import com.ctrl.cbnu_archive.project.service.port.SearchQuery;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "search", havingValue = "mock", matchIfMissing = true)
public class MockProjectSearchAdapter implements ProjectSearchPort {

    private static final Logger log = LoggerFactory.getLogger(MockProjectSearchAdapter.class);
    private final Map<Long, ProjectIndexDocument> indexStore = new ConcurrentHashMap<>();

    @Override
    public void index(ProjectIndexDocument doc) {
        Objects.requireNonNull(doc, "ProjectIndexDocument must not be null");
        log.info("[MOCK] called index(projectId={})", doc.projectId());
        indexStore.put(doc.projectId(), doc);
    }

    @Override
    public void delete(Long projectId) {
        log.info("[MOCK] called delete(projectId={})", projectId);
        indexStore.remove(projectId);
    }

    @Override
    public List<ProjectSearchResult> search(SearchQuery query) {
        log.info("[MOCK] called search(query={})", query);
        if (query == null) {
            return Collections.emptyList();
        }
        List<ProjectSearchResult> candidates = indexStore.values().stream()
                .filter(doc -> matchesKeyword(doc, query.keyword()))
                .filter(doc -> matchesListFilter(doc.techStacks(), query.techStacks()))
                .filter(doc -> matchesValue(doc.year(), query.year()))
                .filter(doc -> matchesValue(doc.semester(), query.semester()))
                .filter(doc -> matchesValue(doc.difficulty(), query.difficulty()))
                .map(doc -> new ProjectSearchResult(
                        doc.projectId(),
                        doc.title(),
                        doc.summary(),
                        doc.techStacks(),
                        doc.year(),
                        doc.semester(),
                        doc.difficulty(),
                        1.0f
                ))
                .collect(Collectors.toList());

        int from = Math.max(0, query.page() * query.size());
        int to = Math.min(candidates.size(), from + query.size());
        if (from >= to) {
            return Collections.emptyList();
        }
        return new ArrayList<>(candidates.subList(from, to));
    }

    private boolean matchesKeyword(ProjectIndexDocument doc, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lower = keyword.toLowerCase();
        return doc.title().toLowerCase().contains(lower)
                || doc.summary().toLowerCase().contains(lower)
                || doc.description().toLowerCase().contains(lower);
    }

    private boolean matchesListFilter(List<String> values, List<String> filter) {
        if (filter == null || filter.isEmpty()) {
            return true;
        }
        if (values == null || values.isEmpty()) {
            return false;
        }
        return values.stream().map(String::toLowerCase).collect(Collectors.toSet()).containsAll(
                filter.stream().map(String::toLowerCase).collect(Collectors.toSet())
        );
    }

    private boolean matchesValue(Object actual, Object expected) {
        if (expected == null) {
            return true;
        }
        return expected.equals(actual);
    }
}
