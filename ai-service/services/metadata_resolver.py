
from __future__ import annotations

from typing import Any


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    if not isinstance(value, str):
        value = str(value)
    return " ".join(value.strip().split())


def _clean_list(values: Any) -> list[str]:
    if not values:
        return []
    out: list[str] = []
    for value in values:
        cleaned = _clean_text(value)
        if cleaned and cleaned not in out:
            out.append(cleaned)
    return out


def resolve_metadata(
    user_metadata: dict[str, Any],
    analyzer_metadata: dict[str, Any],
    source: dict[str, Any],
) -> dict[str, Any]:
    """
    Resolve final metadata for search/recommendation.

    Priority:
    1. user_metadata
    2. analyzer_metadata
    3. source
    """

    resolved_title = (
        _clean_text(user_metadata.get("title"))
        or _clean_text(analyzer_metadata.get("title"))
        or _clean_text(source.get("repo_name"))
    )

    resolved_summary = (
        _clean_text(user_metadata.get("summary"))
        or _clean_text(analyzer_metadata.get("summary"))
        or _clean_text(source.get("repo_description"))
    )

    resolved_language = (
        _clean_text(user_metadata.get("language"))
        or _clean_text(analyzer_metadata.get("language"))
        or _clean_text(source.get("repo_language"))
    )

    resolved_keywords = (
        _clean_list(user_metadata.get("keywords"))
        or _clean_list(analyzer_metadata.get("keywords"))
    )

    resolved_tech_stack = (
        _clean_list(user_metadata.get("tech_stack"))
        or _clean_list(analyzer_metadata.get("tech_stack"))
    )

    return {
        "title": resolved_title,
        "summary": resolved_summary,
        "language": resolved_language,
        "keywords": resolved_keywords,
        "tech_stack": resolved_tech_stack,
    }


def build_project_metadata_record(
    project_id: str,
    source: dict[str, Any],
    user_metadata: dict[str, Any],
    analyzer_metadata: dict[str, Any],
    updated_by: str = "user",
    updated_at: str | None = None,
    notes: str = "",
) -> dict[str, Any]:
    resolved_metadata = resolve_metadata(
        user_metadata=user_metadata,
        analyzer_metadata=analyzer_metadata,
        source=source,
    )

    return {
        "project_id": project_id,
        "source": source,
        "user_metadata": user_metadata,
        "analyzer_metadata": analyzer_metadata,
        "resolved_metadata": resolved_metadata,
        "audit": {
            "resolution_policy": "user_priority_with_analyzer_suggestion",
            "updated_by": updated_by,
            "updated_at": updated_at,
            "notes": notes,
        },
    }
