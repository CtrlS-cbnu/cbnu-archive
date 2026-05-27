
from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def _as_list(values: Any) -> list[str]:
    if not values:
        return []
    return [str(v).strip() for v in values if str(v).strip()]


def build_search_text(resolved_metadata: dict[str, Any]) -> str:
    title = str(resolved_metadata.get("title", "") or "").strip()
    summary = str(resolved_metadata.get("summary", "") or "").strip()
    description = str(resolved_metadata.get("description", "") or "").strip()
    language = str(resolved_metadata.get("language", "") or "").strip()
    keywords = _as_list(resolved_metadata.get("keywords", []))
    tech_stack = _as_list(resolved_metadata.get("tech_stack", []))

    sections = [
        f"title: {title}",
        f"summary: {summary}",
        f"description: {description}",
        f"language: {language}",
        f"keywords: {' '.join(keywords)}",
        f"tech_stack: {' '.join(tech_stack)}",
    ]

    return "\n".join([x for x in sections if x.split(":", 1)[-1].strip()])


def build_corpus_row(record: dict[str, Any]) -> dict[str, Any]:
    resolved = record.get("resolved_metadata", {})

    return {
        "_id": record["project_id"],
        "title": resolved.get("title", ""),
        "text": build_search_text(resolved),
        "metadata": {
            "summary": resolved.get("summary", ""),
            "description": resolved.get("description", ""),
            "language": resolved.get("language", ""),
            "keywords": resolved.get("keywords", []),
            "tech_stack": resolved.get("tech_stack", []),
        },
    }


def build_search_corpus(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [build_corpus_row(record) for record in records]


def save_jsonl(rows: list[dict[str, Any]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main():
    root = Path(__file__).resolve().parents[1]
    input_path = root / "dataset" / "metadata" / "project_metadata_records.json"
    output_path = root / "dataset" / "retrieval" / "corpus_resolved.jsonl"

    records = json.loads(input_path.read_text(encoding="utf-8"))
    rows = build_search_corpus(records)
    save_jsonl(rows, output_path)
    print(f"saved: {output_path}")
    print(f"count: {len(rows)}")


if __name__ == "__main__":
    main()
