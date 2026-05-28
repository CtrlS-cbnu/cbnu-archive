package com.ctrl.cbnu_archive.global.dto;

import com.ctrl.cbnu_archive.global.domain.AuditLog;
import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        Long actorUserId,
        String action,
        String entityType,
        Long entityId,
        String detail,
        LocalDateTime createdAt
) {
    public static AuditLogResponse fromEntity(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorUserId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDetail(),
                log.getCreatedAt()
        );
    }
}
