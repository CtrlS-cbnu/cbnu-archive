
from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def build_search_text(resolved_metadata: dict[str, Any]) -> str:
    title = resolved_metadata.get("title", "")
    summary = resolved_metadata.get("summary", "")
    language = resolved_metadata.get("language", "")
    keywords = " ".join(resolved_metadata.get("keywords", []) or [])
    tech_stack = " ".join(resolved_metadata.get("tech_stack", []) or [])

    parts = [
        f"title: {title}",
        f"summary: {summary}",
        f"language: {language}",
        f"keywords: {keywords}",
        f"tech_stack: {tech_stack}",
    ]

    return "\n".join([p for p in parts if p.strip()])


def build_corpus_row(record: dict[str, Any]) -> dict[str, Any]:
    resolved = record.get("resolved_metadata", {})

    return {
        "_id": record["project_id"],
        "title": resolved.get("title", ""),
        "text": build_search_text(resolved),
        "metadata": {
            "language": resolved.get("language", ""),
            "keywords": resolved.get("keywords", []),
            "tech_stack": resolved.get("tech_stack", []),
            "summary": resolved.get("summary", ""),
        },
    }


def build_search_corpus(records: list[dict[str, Any]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as f:
        for record in records:
            row = build_corpus_row(record)
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main():
    root = Path(__file__).resolve().parents[1]

    # Example input path.
    # Replace this with DB export or project metadata records path later.
    input_path = root / "dataset" / "metadata" / "project_metadata_records.json"
    output_path = root / "dataset" / "retrieval" / "corpus_resolved.jsonl"

    records = load_json(input_path)
    build_search_corpus(records, output_path)

    print(f"saved: {output_path}")


if __name__ == "__main__":
    main()
