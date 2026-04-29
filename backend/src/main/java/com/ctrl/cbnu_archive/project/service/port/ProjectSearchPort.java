package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public interface ProjectSearchPort {
    void index(ProjectIndexDocument doc);
    void delete(Long projectId);
    List<ProjectSearchResult> search(SearchQuery query);
}
