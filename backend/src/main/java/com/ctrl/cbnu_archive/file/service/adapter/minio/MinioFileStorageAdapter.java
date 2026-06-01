package com.ctrl.cbnu_archive.file.service.adapter.minio;

import com.ctrl.cbnu_archive.file.service.port.FileStoragePort;
import java.io.InputStream;
import java.net.URI;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "storage", havingValue = "minio")
public class MinioFileStorageAdapter implements FileStoragePort {

    private static final Logger log = LoggerFactory.getLogger(MinioFileStorageAdapter.class);

    private final S3Client s3Client;
    private final S3Presigner presigner;
    private final String bucket;

    public MinioFileStorageAdapter(
            @Value("${app.storage.minio.endpoint}") String endpoint,
            @Value("${app.storage.minio.bucket}") String bucket,
            @Value("${app.storage.minio.access-key}") String accessKey,
            @Value("${app.storage.minio.secret-key}") String secretKey) {
        this.bucket = bucket;
        Region region = Region.US_EAST_1;
        StaticCredentialsProvider credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));
        S3Configuration s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();
        URI endpointUri = URI.create(endpoint);
        this.s3Client = S3Client.builder()
                .region(region)
                .endpointOverride(endpointUri)
                .credentialsProvider(credentials)
                .serviceConfiguration(s3Config)
                .build();
        this.presigner = S3Presigner.builder()
                .region(region)
                .endpointOverride(endpointUri)
                .credentialsProvider(credentials)
                .build();
        log.info("[MinIO] FileStorageAdapter 초기화: endpoint={}, bucket={}", endpoint, bucket);
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
        log.info("[MinIO] upload 완료: key={}, size={}", path, size);
        return path;
    }

    @Override
    public InputStream download(String storedKey) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(storedKey)
                .build();
        log.info("[MinIO] download 요청: key={}", storedKey);
        return s3Client.getObject(request);
    }

    @Override
    public void delete(String storedKey) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(storedKey)
                .build();
        s3Client.deleteObject(request);
        log.info("[MinIO] delete 완료: key={}", storedKey);
    }

    @Override
    public String generatePresignedUrl(String storedKey, Duration ttl) {
        GetObjectPresignRequest request = GetObjectPresignRequest.builder()
                .signatureDuration(ttl)
                .getObjectRequest(b -> b.bucket(bucket).key(storedKey))
                .build();
        String url = presigner.presignGetObject(request).url().toString();
        log.debug("[MinIO] presigned URL 생성: key={}, ttl={}s", storedKey, ttl.toSeconds());
        return url;
    }
}
