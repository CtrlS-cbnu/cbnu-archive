
from __future__ import annotations

from typing import Any

from services.advanced_query_analyzer import analyze_query
from services.search_reranker import rerank_projects


def search_projects(
    query: str,
    query_embedding: list[float] | None,
    candidates: list[dict[str, Any]],
    top_k: int = 5,
) -> dict[str, Any]:
    analysis = analyze_query(query)
    results = rerank_projects(
        query=query,
        query_embedding=query_embedding,
        candidates=candidates,
        top_k=top_k,
    )

    return {
        "query": query,
        "analysis": {
            "intent_type": analysis.intent_type,
            "topic_terms": analysis.topic_terms,
            "tech_stack_terms": analysis.tech_stack_terms,
            "keyword_terms": analysis.keyword_terms,
            "difficulty_terms": analysis.difficulty_terms,
        },
        "results": [
            {
                "project_id": item.get("project_id") or item.get("_id"),
                "title": item.get("title", ""),
                "score": item.get("score", 0.0),
                "embedding_score": item.get("embedding_score", 0.0),
                "metadata_score": item.get("metadata_score", 0.0),
                "explanation": item.get("explanation", ""),
                "metadata": item.get("metadata", {}),
            }
            for item in results
        ],
    }
