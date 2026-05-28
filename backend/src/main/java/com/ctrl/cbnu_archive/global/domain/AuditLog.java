package com.ctrl.cbnu_archive.global.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorUserId;

    @Column(nullable = false)
    private String action;

    private String entityType;
    private Long entityId;

    @Column(length = 1000)
    private String detail;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected AuditLog() {
    }

    private AuditLog(Long actorUserId, String action, String entityType, Long entityId, String detail) {
        this.actorUserId = actorUserId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.detail = detail;
        this.createdAt = LocalDateTime.now();
    }

    public static AuditLog of(Long actorUserId, String action, String entityType, Long entityId, String detail) {
        return new AuditLog(actorUserId, action, entityType, entityId, detail);
    }

    public Long getId() { return id; }
    public Long getActorUserId() { return actorUserId; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getDetail() { return detail; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
