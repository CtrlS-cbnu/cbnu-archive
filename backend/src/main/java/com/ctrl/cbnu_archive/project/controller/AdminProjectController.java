package com.ctrl.cbnu_archive.project.controller;

import com.ctrl.cbnu_archive.global.dto.AuditLogResponse;
import com.ctrl.cbnu_archive.global.response.ApiResponse;
import com.ctrl.cbnu_archive.global.security.jwt.CustomUserDetails;
import com.ctrl.cbnu_archive.project.dto.AdminApproveRequest;
import com.ctrl.cbnu_archive.project.dto.AdminRejectRequest;
import com.ctrl.cbnu_archive.project.dto.AdminRevisionRequest;
import com.ctrl.cbnu_archive.project.dto.AdminStatsResponse;
import com.ctrl.cbnu_archive.project.dto.ProjectResponse;
import com.ctrl.cbnu_archive.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/projects")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Project", description = "관리자 프로젝트 관리 API")
public class AdminProjectController {

    private final ProjectService projectService;

    public AdminProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Operation(summary = "승인 대기 목록 조회")
    @GetMapping("/pending")
    public ApiResponse<List<ProjectResponse>> getPendingProjects() {
        return ApiResponse.success(projectService.getPendingProjects());
    }

    @Operation(summary = "프로젝트 승인")
    @PatchMapping("/{id}/approve")
    public ApiResponse<ProjectResponse> approveProject(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody AdminApproveRequest request
    ) {
        return ApiResponse.success(projectService.approveProject(id, request, userDetails.getId()));
    }

    @Operation(summary = "프로젝트 반려")
    @PatchMapping("/{id}/reject")
    public ApiResponse<ProjectResponse> rejectProject(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AdminRejectRequest request
    ) {
        return ApiResponse.success(projectService.rejectProject(id, request, userDetails.getId()));
    }

    @Operation(summary = "수정 요청")
    @PatchMapping("/{id}/request-revision")
    public ApiResponse<ProjectResponse> requestRevision(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody AdminRevisionRequest request
    ) {
        return ApiResponse.success(projectService.requestRevision(id, request, userDetails.getId()));
    }

    @Operation(summary = "통계 조회")
    @GetMapping("/stats")
    public ApiResponse<AdminStatsResponse> getStats() {
        return ApiResponse.success(projectService.getStats());
    }

    @Operation(summary = "감사 로그 조회")
    @GetMapping("/audit-logs")
    public ApiResponse<Page<AuditLogResponse>> getAuditLogs(Pageable pageable) {
        return ApiResponse.success(projectService.getAuditLogs(pageable));
    }
}
