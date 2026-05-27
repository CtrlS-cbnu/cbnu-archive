package com.ctrl.cbnu_archive.project.controller;

import com.ctrl.cbnu_archive.global.response.ApiResponse;
import com.ctrl.cbnu_archive.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tech-stacks")
@Tag(name = "TechStack", description = "기술 스택 API")
public class TechStackController {

    private final ProjectService projectService;

    public TechStackController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Operation(summary = "기술 스택 목록 조회", description = "전체 프로젝트에서 사용된 기술 스택 목록을 반환합니다.")
    @GetMapping
    public ApiResponse<List<String>> getTechStacks() {
        return ApiResponse.success(projectService.getAllTechStacks());
    }
}
