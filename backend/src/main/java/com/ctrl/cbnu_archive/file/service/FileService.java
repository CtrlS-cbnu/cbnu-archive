package com.ctrl.cbnu_archive.file.service;

import com.ctrl.cbnu_archive.auth.domain.User;
import com.ctrl.cbnu_archive.auth.repository.UserRepository;
import com.ctrl.cbnu_archive.file.domain.FileType;
import com.ctrl.cbnu_archive.file.domain.ProjectFile;
import com.ctrl.cbnu_archive.file.dto.FileResponse;
import com.ctrl.cbnu_archive.file.dto.FileUploadResponse;
import com.ctrl.cbnu_archive.file.exception.FileException;
import com.ctrl.cbnu_archive.file.repository.ProjectFileRepository;
import com.ctrl.cbnu_archive.file.service.port.FileStoragePort;
import com.ctrl.cbnu_archive.global.exception.ErrorCode;
import com.ctrl.cbnu_archive.project.domain.Project;
import com.ctrl.cbnu_archive.project.exception.ProjectException;
import com.ctrl.cbnu_archive.project.repository.ProjectRepository;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class FileService {

    private static final Duration DOWNLOAD_URL_TTL = Duration.ofMinutes(15);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectFileRepository fileRepository;
    private final FileStoragePort fileStoragePort;

    public FileService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ProjectFileRepository fileRepository,
            FileStoragePort fileStoragePort
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
        this.fileStoragePort = fileStoragePort;
    }

    public FileUploadResponse uploadFile(Long projectId, MultipartFile file, Long currentUserId, boolean isAdmin) {
        Objects.requireNonNull(projectId, "projectId must not be null");
        Objects.requireNonNull(file, "file must not be null");

        Project project = validateProjectAccess(projectId, currentUserId, isAdmin);
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new FileException(ErrorCode.INVALID_INPUT, "파일 이름이 유효하지 않습니다.");
        }

        String storageKey = createStorageKey(projectId, filename);
        try {
            fileStoragePort.upload(storageKey, file.getInputStream(), file.getSize(), file.getContentType());
        } catch (IOException e) {
            throw new FileException(ErrorCode.FILE_UPLOAD_FAILED, "파일 업로드 중 오류가 발생했습니다.");
        }

        ProjectFile projectFile = ProjectFile.create(filename, FileType.fromContentType(file.getContentType()), file.getSize(), storageKey, project);
        ProjectFile saved = fileRepository.save(projectFile);

        return toUploadResponse(saved);
    }

    public FileResponse getFile(Long fileId, Long currentUserId, boolean isAdmin) {
        Objects.requireNonNull(fileId, "fileId must not be null");
        ProjectFile projectFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileException(ErrorCode.FILE_NOT_FOUND, "파일을 찾을 수 없습니다."));
        validateProjectAccess(projectFile.getProjectId(), currentUserId, isAdmin);
        return toResponse(projectFile);
    }

    public List<FileResponse> listFilesByProject(Long projectId, Long currentUserId, boolean isAdmin) {
        Objects.requireNonNull(projectId, "projectId must not be null");
        validateProjectAccess(projectId, currentUserId, isAdmin);
        return fileRepository.findByProject_Id(projectId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteFile(Long fileId, Long currentUserId, boolean isAdmin) {
        Objects.requireNonNull(fileId, "fileId must not be null");
        ProjectFile projectFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new FileException(ErrorCode.FILE_NOT_FOUND, "파일을 찾을 수 없습니다."));
        validateProjectAccess(projectFile.getProjectId(), currentUserId, isAdmin);
        fileStoragePort.delete(projectFile.getStorageKey());
        fileRepository.delete(projectFile);
    }

    private Project validateProjectAccess(Long projectId, Long currentUserId, boolean isAdmin) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectException(ErrorCode.PROJECT_NOT_FOUND, "프로젝트를 찾을 수 없습니다."));
        if (isAdmin) {
            return project;
        }
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ProjectException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));
        if (!project.isAuthor(currentUser)) {
            throw new FileException(ErrorCode.FORBIDDEN, "파일 접근 권한이 없습니다.");
        }
        return project;
    }

    private FileUploadResponse toUploadResponse(ProjectFile projectFile) {
        return new FileUploadResponse(
                projectFile.getId(),
                projectFile.getProjectId(),
                projectFile.getFileName(),
                projectFile.getFileType(),
                projectFile.getSize(),
                fileStoragePort.generatePresignedUrl(projectFile.getStorageKey(), DOWNLOAD_URL_TTL),
                projectFile.getUploadedAt()
        );
    }

    private FileResponse toResponse(ProjectFile projectFile) {
        return new FileResponse(
                projectFile.getId(),
                projectFile.getProjectId(),
                projectFile.getFileName(),
                projectFile.getFileType(),
                projectFile.getSize(),
                fileStoragePort.generatePresignedUrl(projectFile.getStorageKey(), DOWNLOAD_URL_TTL),
                projectFile.getUploadedAt()
        );
    }

    private String createStorageKey(Long projectId, String filename) {
        String sanitizedFilename = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return String.format("projects/%d/%s-%s", projectId, UUID.randomUUID(), sanitizedFilename);
    }
}
