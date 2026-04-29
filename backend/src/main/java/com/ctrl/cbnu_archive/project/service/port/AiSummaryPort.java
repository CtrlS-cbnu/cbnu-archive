package com.ctrl.cbnu_archive.project.service.port;

public interface AiSummaryPort {
    String summarize(String readme, String description);
    ExtractedMetadata extractMetadata(String text);
}
