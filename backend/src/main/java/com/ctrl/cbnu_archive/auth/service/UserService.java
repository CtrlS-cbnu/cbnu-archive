package com.ctrl.cbnu_archive.auth.service;

import com.ctrl.cbnu_archive.auth.domain.User;
import com.ctrl.cbnu_archive.auth.domain.UserStatus;
import com.ctrl.cbnu_archive.auth.dto.PasswordChangeRequest;
import com.ctrl.cbnu_archive.auth.dto.UserResponse;
import com.ctrl.cbnu_archive.auth.dto.UserUpdateRequest;
import com.ctrl.cbnu_archive.auth.exception.AuthException;
import com.ctrl.cbnu_archive.auth.repository.UserRepository;
import com.ctrl.cbnu_archive.global.domain.AuditLog;
import com.ctrl.cbnu_archive.global.exception.ErrorCode;
import com.ctrl.cbnu_archive.global.repository.AuditLogRepository;
import com.ctrl.cbnu_archive.project.dto.ProjectResponse;
import com.ctrl.cbnu_archive.project.mapper.ProjectMapper;
import com.ctrl.cbnu_archive.project.repository.ProjectRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProjectRepository projectRepository;
    private final AuditLogRepository auditLogRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       ProjectRepository projectRepository,
                       AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.projectRepository = projectRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public UserResponse getMyInfo(Long userId) {
        User user = loadUser(userId);
        return UserResponse.fromEntity(user);
    }

    public UserResponse updateMyInfo(Long userId, UserUpdateRequest request) {
        User user = loadUser(userId);
        user.updateProfile(request.name(), request.studentNumber());
        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }

    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = loadUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new AuthException(ErrorCode.INVALID_INPUT, "현재 비밀번호가 일치하지 않습니다.");
        }
        user.updatePassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public Page<ProjectResponse> getMyProjects(Long userId, Pageable pageable) {
        return projectRepository.findByAuthorId(userId, pageable)
                .map(ProjectMapper::toResponse);
    }

    public List<UserResponse> getPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponse approveUser(Long userId, Long adminUserId) {
        User user = loadUser(userId);
        user.activate();
        User saved = userRepository.save(user);
        auditLogRepository.save(AuditLog.of(adminUserId, "APPROVE_USER", "USER", userId, null));
        return UserResponse.fromEntity(saved);
    }

    public void rejectUser(Long userId, String reason, Long adminUserId) {
        User user = loadUser(userId);
        user.rejectUser();
        userRepository.save(user);
        auditLogRepository.save(AuditLog.of(adminUserId, "REJECT_USER", "USER", userId, reason));
    }

    private User loadUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }
}
