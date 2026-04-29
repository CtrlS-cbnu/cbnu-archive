package com.ctrl.cbnu_archive.file.service.adapter.mock;

import com.ctrl.cbnu_archive.file.service.port.FileStoragePort;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "storage", havingValue = "mock", matchIfMissing = true)
public class MockFileStorageAdapter implements FileStoragePort {

    private static final Logger log = LoggerFactory.getLogger(MockFileStorageAdapter.class);
    private final Map<String, byte[]> storage = new ConcurrentHashMap<>();

    @Override
    public String upload(String path, InputStream is, long size, String contentType) {
        Objects.requireNonNull(path, "path must not be null");
        Objects.requireNonNull(is, "input stream must not be null");
        try {
            byte[] payload = is.readAllBytes();
            storage.put(path, payload);
            log.info("[MOCK] called upload(path={}, size={}, contentType={})", path, size, contentType);
            return path;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read input stream in mock upload", e);
        }
    }

    @Override
    public InputStream download(String storedKey) {
        log.info("[MOCK] called download(storedKey={})", storedKey);
        byte[] payload = storage.get(storedKey);
        if (payload == null) {
            throw new IllegalArgumentException("Mock file not found: " + storedKey);
        }
        return new ByteArrayInputStream(payload);
    }

    @Override
    public void delete(String storedKey) {
        log.info("[MOCK] called delete(storedKey={})", storedKey);
        storage.remove(storedKey);
    }

    @Override
    public String generatePresignedUrl(String storedKey, Duration ttl) {
        log.info("[MOCK] called generatePresignedUrl(storedKey={}, ttl={})", storedKey, ttl);
        return String.format("https://mock-storage.local/%s?ttl=%s", storedKey, ttl.toSeconds());
    }
}
