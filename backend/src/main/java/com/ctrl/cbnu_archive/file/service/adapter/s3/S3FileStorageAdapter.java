package com.ctrl.cbnu_archive.file.service.adapter.s3;

import com.ctrl.cbnu_archive.file.service.port.FileStoragePort;
import java.io.InputStream;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "storage", havingValue = "s3")
public class S3FileStorageAdapter implements FileStoragePort {

    private static final Logger log = LoggerFactory.getLogger(S3FileStorageAdapter.class);

    private final S3Client s3Client;
    private final S3Presigner presigner;
    private final String bucket;

    public S3FileStorageAdapter(
            @Value("${app.storage.s3.bucket}") String bucket,
            @Value("${app.storage.s3.region:ap-northeast-2}") String region) {
        this.bucket = bucket;
        Region awsRegion = Region.of(region);
        this.s3Client = S3Client.builder().region(awsRegion).build();
        this.presigner = S3Presigner.builder().region(awsRegion).build();
        log.info("[S3] FileStorageAdapter 초기화: bucket={}, region={}", bucket, region);
    }

    @Override
    public String upload(String path, InputStream is, long size, String contentType) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(path)
                .contentType(contentType != null ? contentType : "application/octet-stream")
                .contentLength(size)
                .build();
        s3Client.putObject(request, RequestBody.fromInputStream(is, size));
        log.info("[S3] upload 완료: key={}, size={}", path, size);
        return path;
    }

    @Override
    public InputStream download(String storedKey) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(storedKey)
                .build();
        log.info("[S3] download 요청: key={}", storedKey);
        return s3Client.getObject(request);
    }

    @Override
    public void delete(String storedKey) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(storedKey)
                .build();
        s3Client.deleteObject(request);
        log.info("[S3] delete 완료: key={}", storedKey);
    }

    @Override
    public String generatePresignedUrl(String storedKey, Duration ttl) {
        GetObjectPresignRequest request = GetObjectPresignRequest.builder()
                .signatureDuration(ttl)
                .getObjectRequest(b -> b.bucket(bucket).key(storedKey))
                .build();
        String url = presigner.presignGetObject(request).url().toString();
        log.debug("[S3] presigned URL 생성: key={}, ttl={}s", storedKey, ttl.toSeconds());
        return url;
    }
}
