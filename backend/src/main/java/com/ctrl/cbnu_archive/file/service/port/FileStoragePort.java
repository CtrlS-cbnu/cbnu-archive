package com.ctrl.cbnu_archive.file.service.port;

import java.io.InputStream;
import java.time.Duration;

public interface FileStoragePort {
    String upload(String path, InputStream is, long size, String contentType);
    InputStream download(String storedKey);
    void delete(String storedKey);
    String generatePresignedUrl(String storedKey, Duration ttl);
}
