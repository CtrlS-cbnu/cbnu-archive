package com.ctrl.cbnu_archive.project.controller;

import com.ctrl.cbnu_archive.global.response.ApiResponse;
import com.ctrl.cbnu_archive.global.security.jwt.CustomUserDetails;
import com.ctrl.cbnu_archive.project.dto.AiRecommendResponse;
import com.ctrl.cbnu_archive.project.dto.ProjectCreateRequest;
import com.ctrl.cbnu_archive.project.dto.ProjectResponse;
import com.ctrl.cbnu_archive.project.dto.ProjectUpdateRequest;
import com.ctrl.cbnu_archive.project.dto.RecommendRequest;
import com.ctrl.cbnu_archive.project.dto.SearchRequest;
import com.ctrl.cbnu_archive.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Project", description = "프로젝트 API")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Operation(summary = "프로젝트 등록", description = "인증된 사용자가 새 프로젝트를 등록합니다.")
    @PostMapping
    public ApiResponse<ProjectResponse> createProject(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProjectCreateRequest request
    ) {
        return ApiResponse.success(projectService.createProject(request, userDetails.getId()));
    }

    @Operation(summary = "프로젝트 상세 조회", description = "프로젝트 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> getProject(@PathVariable Long id) {
        return ApiResponse.success(projectService.getProject(id));
    }

    @Operation(summary = "프로젝트 검색", description = "검색 조건으로 프로젝트 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<Page<ProjectResponse>> searchProjects(@ModelAttribute SearchRequest request) {
        return ApiResponse.success(projectService.searchProjects(request));
    }

    @Operation(summary = "프로젝트 수정", description = "프로젝트 작성자 또는 ADMIN이 프로젝트를 수정합니다.")
    @PatchMapping("/{id}")
    public ApiResponse<ProjectResponse> updateProject(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequest request
    ) {
        return ApiResponse.success(projectService.updateProject(id, request, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))));
    }

    @Operation(summary = "프로젝트 삭제", description = "프로젝트 작성자 또는 ADMIN이 프로젝트를 삭제합니다.")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        projectService.deleteProject(id, userDetails.getId(), userDetails.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
        return ApiResponse.success(null);
    }

    @Operation(summary = "내 프로젝트 목록", description = "로그인한 사용자가 등록한 프로젝트 목록을 조회합니다.")
    @GetMapping("/my")
    public ApiResponse<List<ProjectResponse>> getMyProjects(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ApiResponse.success(projectService.getMyProjects(userDetails.getId()));
    }

    @Operation(summary = "기술 스택 목록", description = "전체 기술 스택 목록을 조회합니다.")
    @GetMapping("/tech-stacks")
    public ApiResponse<List<String>> getTechStacks() {
        return ApiResponse.success(projectService.getAllTechStacks());
    }

    @Operation(summary = "AI 추천", description = "자연어 질의를 통해 프로젝트 추천을 제공합니다.")
    @PostMapping("/recommend")
    public ApiResponse<AiRecommendResponse> recommendProjects(@Valid @RequestBody RecommendRequest request) {
        return ApiResponse.success(projectService.recommendByQuery(request.query()));
    }
}
