package com.ctrl.cbnu_archive.file.exception;

import com.ctrl.cbnu_archive.global.exception.CustomException;
import com.ctrl.cbnu_archive.global.exception.ErrorCode;

public class FileException extends CustomException {

    public FileException(ErrorCode errorCode) {
        super(errorCode);
    }

    public FileException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}
