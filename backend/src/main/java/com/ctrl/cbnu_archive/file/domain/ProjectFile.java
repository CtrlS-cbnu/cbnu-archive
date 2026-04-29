package com.ctrl.cbnu_archive.file.domain;

import com.ctrl.cbnu_archive.project.domain.Project;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "project_files")
public class ProjectFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileType fileType;

    @Column(nullable = false)
    private Long size;

    @Column(nullable = false, unique = true)
    private String storageKey;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    protected ProjectFile() {
    }

    private ProjectFile(String fileName, FileType fileType, Long size, String storageKey, LocalDateTime uploadedAt, Project project) {
        this.fileName = Objects.requireNonNull(fileName, "fileName must not be null");
        this.fileType = Objects.requireNonNull(fileType, "fileType must not be null");
        this.size = Objects.requireNonNull(size, "size must not be null");
        this.storageKey = Objects.requireNonNull(storageKey, "storageKey must not be null");
        this.uploadedAt = Objects.requireNonNull(uploadedAt, "uploadedAt must not be null");
        this.project = Objects.requireNonNull(project, "project must not be null");
    }

    public static ProjectFile create(String fileName, FileType fileType, Long size, String storageKey, Project project) {
        return new ProjectFile(fileName, fileType, size, storageKey, LocalDateTime.now(), project);
    }

    public Long getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public FileType getFileType() {
        return fileType;
    }

    public Long getSize() {
        return size;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public Long getProjectId() {
        return project.getId();
    }

    public Project getProject() {
        return project;
    }
}
