package com.ctrl.cbnu_archive.auth.controller;

import com.ctrl.cbnu_archive.auth.dto.LoginRequest;
import com.ctrl.cbnu_archive.auth.dto.RefreshTokenRequest;
import com.ctrl.cbnu_archive.auth.dto.SignUpRequest;
import com.ctrl.cbnu_archive.auth.dto.TokenResponse;
import com.ctrl.cbnu_archive.auth.dto.UserResponse;
import com.ctrl.cbnu_archive.auth.exception.AuthException;
import com.ctrl.cbnu_archive.auth.service.AuthService;
import com.ctrl.cbnu_archive.global.exception.ErrorCode;
import com.ctrl.cbnu_archive.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "인증 API")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "회원가입 성공", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = UserResponse.class)))
    @PostMapping("/signup")
    public ApiResponse<UserResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ApiResponse.success(authService.signUp(request));
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하고 JWT를 발급합니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그인 성공", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @Operation(summary = "로그아웃", description = "현재 Access Token을 블랙리스트에 추가하여 로그아웃 처리합니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그아웃 성공")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(name = "Authorization", required = false) String authorizationHeader) {
        String accessToken = resolveAccessToken(authorizationHeader);
        authService.logout(accessToken);
        return ApiResponse.success("로그아웃 되었습니다.", null);
    }

    @Operation(summary = "토큰 재발급", description = "리프레시 토큰으로 엑세스 토큰을 재발급합니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "토큰 재발급 성공", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = TokenResponse.class)))
    @PostMapping("/reissue")
    public ApiResponse<TokenResponse> reissue(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success(authService.reissue(request.refreshToken()));
    }

    private String resolveAccessToken(String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            throw new AuthException(ErrorCode.INVALID_TOKEN, "Authorization 헤더에 Bearer 토큰이 필요합니다.");
        }
        return authorizationHeader.substring(7);
    }
}
