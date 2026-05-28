package com.ctrl.cbnu_archive.project.repository;

import com.ctrl.cbnu_archive.project.domain.Project;
import com.ctrl.cbnu_archive.project.domain.ProjectStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public final class ProjectSpecification {

    private ProjectSpecification() {
    }

    public static Specification<Project> approved() {
        return (root, query, cb) ->
                cb.equal(root.get("status"), ProjectStatus.APPROVED);
    }

    public static Specification<Project> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("summary")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("domain")), pattern)
            );
        };
    }

    public static Specification<Project> hasAllTechStacks(List<String> techStacks) {
        return (root, query, cb) -> {
            if (techStacks == null || techStacks.isEmpty()) {
                return cb.conjunction();
            }
            // 지정된 기술 스택을 모두 포함하는 프로젝트 필터 (AND 조건)
            List<Predicate> predicates = new ArrayList<>();
            for (String techStack : techStacks) {
                Subquery<Long> sub = query.subquery(Long.class);
                var subRoot = sub.correlate(root);
                Join<Project, String> join = subRoot.join("techStacks");
                sub.select(cb.literal(1L))
                        .where(cb.equal(cb.lower(join), techStack.toLowerCase()));
                predicates.add(cb.exists(sub));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Project> yearFrom(Integer yearFrom) {
        return (root, query, cb) -> {
            if (yearFrom == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("year"), yearFrom);
        };
    }

    public static Specification<Project> yearTo(Integer yearTo) {
        return (root, query, cb) -> {
            if (yearTo == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("year"), yearTo);
        };
    }

    public static Specification<Project> hasSemester(String semester) {
        return (root, query, cb) -> {
            if (semester == null || semester.isBlank()) return cb.conjunction();
            return cb.equal(root.get("semester"), normalizeSemester(semester));
        };
    }

    public static Specification<Project> hasDifficulty(String difficulty) {
        return (root, query, cb) -> {
            if (difficulty == null || difficulty.isBlank()) return cb.conjunction();
            return cb.equal(root.get("difficulty"), difficulty);
        };
    }

    public static Specification<Project> hasDomain(String domain) {
        return (root, query, cb) -> {
            if (domain == null || domain.isBlank()) return cb.conjunction();
            return cb.equal(root.get("domain"), domain);
        };
    }

    public static Specification<Project> isTeam(Boolean isTeam) {
        return (root, query, cb) -> {
            if (isTeam == null) return cb.conjunction();
            return cb.equal(root.get("isTeam"), isTeam);
        };
    }

    private static String normalizeSemester(String s) {
        return switch (s.toUpperCase()) {
            case "1", "FIRST" -> "FIRST";
            case "2", "SECOND" -> "SECOND";
            default -> s.toUpperCase();
        };
    }
}
