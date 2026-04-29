package com.ctrl.cbnu_archive.project.service.adapter.mock;

import com.ctrl.cbnu_archive.project.service.port.AiSummaryPort;
import com.ctrl.cbnu_archive.project.service.port.ExtractedMetadata;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.adapter", name = "ai-summary", havingValue = "mock", matchIfMissing = true)
public class MockAiSummaryAdapter implements AiSummaryPort {

    private static final Logger log = LoggerFactory.getLogger(MockAiSummaryAdapter.class);

    @Override
    public String summarize(String readme, String description) {
        Objects.requireNonNull(readme, "readme must not be null");
        Objects.requireNonNull(description, "description must not be null");
        log.info("[MOCK] called summarize(readmeLength={}, descriptionLength={})", readme.length(), description.length());
        String summary = String.format(
                "[MOCK] 요약: %s... 주요 내용: %s...",
                trimText(readme, 120),
                trimText(description, 120)
        );
        return summary;
    }

    @Override
    public ExtractedMetadata extractMetadata(String text) {
        Objects.requireNonNull(text, "text must not be null");
        log.info("[MOCK] called extractMetadata(textLength={})", text.length());
        List<String> techStacks = new ArrayList<>();
        String lower = text.toLowerCase(Locale.ROOT);
        if (lower.contains("spring")) {
            techStacks.add("Spring");
        }
        if (lower.contains("react")) {
            techStacks.add("React");
        }
        if (lower.contains("postgres")) {
            techStacks.add("PostgreSQL");
        }
        if (lower.contains("java")) {
            techStacks.add("Java");
        }
        if (lower.contains("python")) {
            techStacks.add("Python");
        }
        if (lower.contains("docker")) {
            techStacks.add("Docker");
        }
        if (techStacks.isEmpty()) {
            techStacks.add("기타");
        }

        String domain = guessDomain(lower);
        String difficulty = guessDifficulty(lower);

        return new ExtractedMetadata(techStacks, domain, difficulty);
    }

    private String trimText(String text, int maxLength) {
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength).trim() + "...";
    }

    private String guessDomain(String lower) {
        if (lower.contains("cms") || lower.contains("content")) {
            return "콘텐츠 관리";
        }
        if (lower.contains("search") || lower.contains("검색")) {
            return "검색 엔진";
        }
        if (lower.contains("chat") || lower.contains("dialog")) {
            return "대화형 AI";
        }
        return "일반 프로젝트";
    }

    private String guessDifficulty(String lower) {
        if (lower.contains("advanced") || lower.contains("high") || lower.contains("complex")) {
            return "High";
        }
        if (lower.contains("intermediate") || lower.contains("medium")) {
            return "Medium";
        }
        return "Low";
    }
}
