package com.ctrl.cbnu_archive.project.service.event;

import com.ctrl.cbnu_archive.project.service.port.EmbeddingPort;
import com.ctrl.cbnu_archive.project.service.port.ProjectIndexDocument;
import com.ctrl.cbnu_archive.project.service.port.ProjectSearchPort;
import com.ctrl.cbnu_archive.project.service.port.VectorSearchPort;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class ProjectIndexEventListener {

    private static final Logger log = LoggerFactory.getLogger(ProjectIndexEventListener.class);
    private final ProjectSearchPort searchPort;
    private final VectorSearchPort vectorPort;
    private final EmbeddingPort embeddingPort;

    public ProjectIndexEventListener(
            ProjectSearchPort searchPort,
            VectorSearchPort vectorPort,
            EmbeddingPort embeddingPort
    ) {
        this.searchPort = searchPort;
        this.vectorPort = vectorPort;
        this.embeddingPort = embeddingPort;
    }

    @Async
    @EventListener
    public void handleProjectIndexEvent(ProjectIndexEvent event) {
        ProjectIndexDocument document = event.indexDocument();
        log.info("[EVENT] ProjectIndexEvent handle projectId={}", event.projectId());
        searchPort.index(document);
        float[] embedding = embeddingPort.embed(event.embeddingText());
        Map<String, Object> metadata = Map.of(
                "title", document.title(),
                "difficulty", document.difficulty(),
                "domain", document.domain(),
                "year", document.year(),
                "semester", document.semester()
        );
        vectorPort.upsert(event.projectId(), embedding, metadata);
    }

    @Async
    @EventListener
    public void handleProjectDeleteEvent(ProjectDeleteEvent event) {
        log.info("[EVENT] ProjectDeleteEvent handle projectId={}", event.projectId());
        searchPort.delete(event.projectId());
        vectorPort.delete(event.projectId());
    }
}
