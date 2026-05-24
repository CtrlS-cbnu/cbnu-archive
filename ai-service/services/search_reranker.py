
from __future__ import annotations

import math
from typing import Any

from services.advanced_query_analyzer import analyze_query


def _norm(value: str) -> str:
    return " ".join((value or "").lower().split())


def _lower_list(values: list[str] | None) -> list[str]:
    return [_norm(v) for v in (values or []) if _norm(v)]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b:
        return 0.0
    numerator = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return numerator / (norm_a * norm_b)


def calculate_metadata_score(query: str, project: dict[str, Any]) -> tuple[float, list[str]]:
    intent = analyze_query(query)
    metadata = project.get("metadata", project)

    title = _norm(project.get("title", ""))
    summary = _norm(metadata.get("summary", ""))
    description = _norm(metadata.get("description", ""))
    language = _norm(metadata.get("language", ""))
    text_blob = " ".join([title, summary, description, language])

    keywords = _lower_list(metadata.get("keywords", []))
    tech_stack = _lower_list(metadata.get("tech_stack", []))

    score = 0.0
    reasons: list[str] = []

    for tech in intent.tech_stack_terms:
        tech_norm = _norm(tech)
        if tech_norm in tech_stack:
            score += 3.0
            reasons.append(f"기술 스택 일치: {tech}")
        elif tech_norm in text_blob:
            score += 1.2
            reasons.append(f"본문 내 기술 언급: {tech}")

    for topic in intent.topic_terms:
        topic_norm = _norm(topic)
        if topic_norm in keywords:
            score += 2.5
            reasons.append(f"키워드 일치: {topic}")
        elif topic_norm in text_blob:
            score += 1.2
            reasons.append(f"설명 내 주제 언급: {topic}")

    for keyword in intent.keyword_terms:
        keyword_norm = _norm(keyword)
        if keyword_norm in keywords:
            score += 1.5
            reasons.append(f"질의어와 키워드 일치: {keyword}")
        elif keyword_norm in title:
            score += 1.2
            reasons.append(f"질의어와 제목 일치: {keyword}")
        elif keyword_norm in text_blob:
            score += 0.6
            reasons.append(f"질의어가 설명에 포함: {keyword}")

    for difficulty in intent.difficulty_terms:
        diff_norm = _norm(difficulty)
        if diff_norm in text_blob:
            score += 0.8
            reasons.append(f"난이도 조건 언급: {difficulty}")

    return score, reasons


def rerank_projects(
    query: str,
    query_embedding: list[float] | None,
    candidates: list[dict[str, Any]],
    top_k: int = 10,
    embedding_weight: float = 0.65,
    metadata_weight: float = 0.35,
) -> list[dict[str, Any]]:
    raw_rows = []
    max_metadata_score = 0.0

    for item in candidates:
        embedding_score = 0.0
        if query_embedding is not None and item.get("embedding") is not None:
            embedding_score = cosine_similarity(query_embedding, item["embedding"])

        raw_metadata_score, reasons = calculate_metadata_score(query, item)
        max_metadata_score = max(max_metadata_score, raw_metadata_score)

        raw_rows.append({
            "item": item,
            "embedding_score": embedding_score,
            "raw_metadata_score": raw_metadata_score,
            "match_reasons": reasons,
        })

    reranked = []
    for row in raw_rows:
        normalized_metadata_score = (
            row["raw_metadata_score"] / max_metadata_score
            if max_metadata_score > 0
            else 0.0
        )

        final_score = (
            embedding_weight * row["embedding_score"]
            + metadata_weight * normalized_metadata_score
        )

        item = dict(row["item"])
        item["embedding_score"] = round(row["embedding_score"], 6)
        item["metadata_score"] = round(normalized_metadata_score, 6)
        item["score"] = round(final_score, 6)
        item["match_reasons"] = row["match_reasons"][:3]
        item["explanation"] = build_result_explanation(item)
        reranked.append(item)

    reranked.sort(key=lambda x: x["score"], reverse=True)
    return reranked[:top_k]


def build_result_explanation(item: dict[str, Any]) -> str:
    reasons = item.get("match_reasons", [])
    if not reasons:
        return "임베딩 유사도가 높아 검색 결과에 포함되었습니다."
    return " / ".join(reasons)
