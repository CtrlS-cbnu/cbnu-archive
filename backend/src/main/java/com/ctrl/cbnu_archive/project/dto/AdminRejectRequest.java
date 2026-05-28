package com.ctrl.cbnu_archive.project.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminRejectRequest(
        @NotBlank(message = "반려 사유는 필수입니다.")
        String reason
) {
}
