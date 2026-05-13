package com.ctrl.cbnu_archive.file.controller;

import com.ctrl.cbnu_archive.file.dto.FileResponse;
import com.ctrl.cbnu_archive.file.dto.FileUploadResponse;
import com.ctrl.cbnu_archive.file.service.FileService;
import com.ctrl.cbnu_archive.global.response.ApiResponse;
import com.ctrl.cbnu_archive.global.security.jwt.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "File", description = "파일 업로드 및 다운로드 API")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @Operation(summary = "프로젝트 파일 업로드", description = "프로젝트 작성자 또는 ADMIN이 파일을 업로드합니다.")
    @PostMapping(value = "/projects/{projectId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file
    ) {
        return ApiResponse.success(fileService.uploadFile(projectId, file, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))));
    }

    @Operation(summary = "프로젝트 파일 목록 조회", description = "프로젝트에 첨부된 파일 목록을 조회합니다.")
    @GetMapping("/projects/{projectId}")
    public ApiResponse<List<FileResponse>> listFiles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long projectId
    ) {
        return ApiResponse.success(fileService.listFilesByProject(projectId, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))));
    }

    @Operation(summary = "파일 상세 조회", description = "파일 메타데이터와 다운로드 URL을 조회합니다.")
    @GetMapping("/{fileId}")
    public ApiResponse<FileResponse> getFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long fileId
    ) {
        return ApiResponse.success(fileService.getFile(fileId, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))));
    }

    @Operation(summary = "파일 바이트 스트리밍 다운로드", description = "파일 내용을 직접 스트리밍합니다. mock-storage를 사용할 때도 동작합니다.")
    @GetMapping("/{fileId}/download")
    public ResponseEntity<InputStreamResource> downloadFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long fileId
    ) {
        InputStream stream = fileService.downloadFileStream(
                fileId,
                userDetails.getId(),
                userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))
        );
        String fileName = fileService.getFileName(fileId);
        // Encode filename for Content-Disposition to handle Korean and special characters
        String encoded = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(stream));
    }

    @Operation(summary = "파일 삭제", description = "프로젝트 작성자 또는 ADMIN이 파일을 삭제합니다.")
    @DeleteMapping("/{fileId}")
    public ApiResponse<Void> deleteFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long fileId
    ) {
        fileService.deleteFile(fileId, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
        return ApiResponse.success(null);
    }
}
