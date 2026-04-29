package com.ctrl.cbnu_archive.project.service.port;

import java.util.List;

public record ExtractedMetadata(
        List<String> techStacks,
        String domain,
        String difficulty
) {
}
