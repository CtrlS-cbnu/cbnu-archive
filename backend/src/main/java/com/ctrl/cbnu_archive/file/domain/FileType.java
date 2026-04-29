package com.ctrl.cbnu_archive.file.domain;

public enum FileType {
    DOCUMENT,
    IMAGE,
    ATTACHMENT;

    public static FileType fromContentType(String contentType) {
        if (contentType == null) {
            return ATTACHMENT;
        }
        String normalized = contentType.toLowerCase();
        if (normalized.startsWith("image/")) {
            return IMAGE;
        }
        if (normalized.contains("pdf") || normalized.contains("word") || normalized.contains("msword") || normalized.contains("sheet") || normalized.contains("excel") || normalized.contains("presentation") || normalized.contains("text")) {
            return DOCUMENT;
        }
        return ATTACHMENT;
    }
}
