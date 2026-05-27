package com.ctrl.cbnu_archive.auth.controller;

import com.ctrl.cbnu_archive.auth.dto.RejectUserRequest;
import com.ctrl.cbnu_archive.auth.dto.UserResponse;
import com.ctrl.cbnu_archive.auth.service.UserService;
import com.ctrl.cbnu_archive.global.response.ApiResponse;
import com.ctrl.cbnu_archive.global.security.jwt.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin User", description = "관리자 회원 관리 API")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "가입 승인 대기 목록 조회")
    @GetMapping("/pending")
    public ApiResponse<List<UserResponse>> getPendingUsers() {
        return ApiResponse.success(userService.getPendingUsers());
    }

    @Operation(summary = "회원 승인")
    @PostMapping("/{userId}/approve")
    public ApiResponse<UserResponse> approveUser(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId
    ) {
        return ApiResponse.success(userService.approveUser(userId, userDetails.getId()));
    }

    @Operation(summary = "회원 거절")
    @PostMapping("/{userId}/reject")
    public ApiResponse<Void> rejectUser(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId,
            @RequestBody(required = false) RejectUserRequest request
    ) {
        String reason = request != null ? request.reason() : null;
        userService.rejectUser(userId, reason, userDetails.getId());
        return ApiResponse.success(null);
    }
}
