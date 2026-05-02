package com.ctrl.cbnu_archive.auth.service;

import com.ctrl.cbnu_archive.auth.domain.User;
import com.ctrl.cbnu_archive.auth.dto.LoginRequest;
import com.ctrl.cbnu_archive.auth.dto.SignUpRequest;
import com.ctrl.cbnu_archive.auth.dto.TokenResponse;
import com.ctrl.cbnu_archive.auth.dto.UserResponse;
import com.ctrl.cbnu_archive.auth.repository.UserRepository;
import com.ctrl.cbnu_archive.auth.exception.AuthException;
import com.ctrl.cbnu_archive.global.exception.ErrorCode;
import com.ctrl.cbnu_archive.global.security.jwt.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    public UserResponse signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new AuthException(ErrorCode.DUPLICATE_EMAIL);
        }
        var encodedPassword = passwordEncoder.encode(request.password());
        User user = User.create(request.email(), encodedPassword, request.name(), request.studentNumber());
        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AuthException(ErrorCode.INVALID_INPUT, "이메일 또는 비밀번호가 일치하지 않습니다.");
        }
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        return new TokenResponse(accessToken, refreshToken);
    }

    public void logout(String accessToken) {
        if (!jwtTokenProvider.validateToken(accessToken)) {
            throw new AuthException(ErrorCode.INVALID_TOKEN);
        }
        // Refresh token은 서버에 저장되지 않으므로, 클라이언트가 refresh token도 반드시 폐기해야 합니다.
        tokenBlacklistService.add(accessToken, jwtTokenProvider.getExpirationFromToken(accessToken));
    }

    public TokenResponse reissue(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AuthException(ErrorCode.INVALID_TOKEN);
        }
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND));
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        return new TokenResponse(accessToken, newRefreshToken);
    }
}
