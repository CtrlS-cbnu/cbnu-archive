package com.ctrl.cbnu_archive.project.controller;

import com.ctrl.cbnu_archive.project.dto.NaturalSearchRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/v1/search")
@Tag(name = "Search", description = "검색 API")
public class SearchController {

    private final RestClient restClient;

    public SearchController(@Value("${app.ai.base-url:http://localhost:8000}") String aiBaseUrl) {
        this.restClient = RestClient.builder().baseUrl(aiBaseUrl).build();
    }

    @Operation(summary = "자연어 검색", description = "자연어 질의를 AI 서비스에 포워딩하여 검색 결과를 반환합니다.")
    @PostMapping("/natural")
    public ResponseEntity<Map> naturalSearch(@RequestBody NaturalSearchRequest request) {
        Map response = restClient.post()
                .uri("/search")
                .body(request)
                .retrieve()
                .body(Map.class);
        return ResponseEntity.ok(response);
    }
}
