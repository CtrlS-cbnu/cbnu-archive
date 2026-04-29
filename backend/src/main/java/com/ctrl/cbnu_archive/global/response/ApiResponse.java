package com.ctrl.cbnu_archive.global.response;

import com.ctrl.cbnu_archive.global.exception.ErrorCode;

public record ApiResponse<T>(boolean success, String message, T data, String errorCode) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "OK", data, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(false, errorCode.message(), null, errorCode.code());
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String customMessage) {
        return new ApiResponse<>(false, customMessage, null, errorCode.code());
    }
}
