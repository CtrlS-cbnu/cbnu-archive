package com.ctrl.cbnu_archive.file.dto;

import com.ctrl.cbnu_archive.file.domain.FileType;
import java.time.LocalDateTime;

public record FileResponse(
        Long id,
        Long projectId,
        String fileName,
        FileType fileType,
        Long size,
        String downloadUrl,
        LocalDateTime uploadedAt
) {
}
