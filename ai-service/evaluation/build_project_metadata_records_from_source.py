from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from services.simple_metadata_analyzer import SimpleMetadataAnalyzer
from services.metadata_resolver import build_project_metadata_record

SOURCE_PATH = ROOT / "dataset" / "metadata" / "metadata_source.json"
OUTPUT_PATH = ROOT / "dataset" / "metadata" / "project_metadata_records.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def build_source(item: dict) -> dict:
    inp = item.get("input", {})
    repo_meta = item.get("repo_meta", {})

    return {
        "repo_url": item.get("repo_url", ""),
        "repo_name": item.get("title", ""),
        "repo_description": inp.get("description", "") or inp.get("short_summary", ""),
        "repo_language": repo_meta.get("language"),
        "readme": inp.get("readme", ""),
        "file_names": inp.get("file_names", []),
        "config_texts": inp.get("config_texts", {}),
        "repo_topics": repo_meta.get("topics", []),
    }


def build_user_metadata_from_source(item: dict) -> dict:
    """
    아직 사용자 입력 DB가 없으므로 테스트용으로 최소 user_metadata를 만든다.
    실제 서비스에서는 업로드 폼 입력값으로 대체된다.
    """
    inp = item.get("input", {})
    repo_meta = item.get("repo_meta", {})

    return {
        "title": item.get("title", ""),
        "summary": inp.get("short_summary", "") or inp.get("description", ""),
        "description": inp.get("description", "") or inp.get("short_summary", ""),
        "language": repo_meta.get("language"),
        "keywords": [],
        "tech_stack": [],
    }


def build_analyzer_metadata(analyzer: SimpleMetadataAnalyzer, source: dict) -> dict:
    result = analyzer.analyze(
        repo_name=source.get("repo_name", ""),
        readme=source.get("readme", ""),
        repo_description=source.get("repo_description", ""),
        repo_language=source.get("repo_language"),
        file_names=source.get("file_names", []),
        config_texts=source.get("config_texts", {}),
        repo_topics=source.get("repo_topics", []),
    )

    return {
        "title": result.title,
        "summary": result.summary,
        "language": result.language,
        "keywords": result.keywords,
        "tech_stack": result.tech_stack,
    }


def main():
    analyzer = SimpleMetadataAnalyzer()
    items = load_json(SOURCE_PATH)

    records = []

    for item in items:
        project_id = item["project_id"]
        source = build_source(item)
        user_metadata = build_user_metadata_from_source(item)
        analyzer_metadata = build_analyzer_metadata(analyzer, source)

        record = build_project_metadata_record(
            project_id=project_id,
            source=source,
            user_metadata=user_metadata,
            analyzer_metadata=analyzer_metadata,
            updated_by="system",
            updated_at=None,
            notes="generated from metadata_source.json for local test",
        )

        records.append(record)

    save_json(OUTPUT_PATH, records)

    print(f"saved: {OUTPUT_PATH}")
    print(f"count: {len(records)}")


if __name__ == "__main__":
    main()