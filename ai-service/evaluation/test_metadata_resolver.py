
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from services.metadata_resolver import build_project_metadata_record


def main():
    source = {
        "repo_url": "https://github.com/freeCodeCamp/freeCodeCamp",
        "repo_name": "freeCodeCamp",
        "repo_description": "freeCodeCamp.org's open-source codebase and curriculum.",
        "repo_language": "TypeScript",
        "readme": "...",
        "file_names": ["README.md", "package.json"],
        "config_texts": {"package.json": "..."},
        "repo_topics": ["education", "javascript", "curriculum"],
    }

    user_metadata = {
        "title": "freeCodeCamp 플랫폼",
        "summary": "무료 코딩 학습 플랫폼의 오픈소스 코드베이스",
        "description": "커리큘럼과 인증 과정을 제공하는 교육 플랫폼",
        "keywords": ["education", "curriculum", "javascript"],
        "tech_stack": ["TypeScript", "React", "Node.js"],
    }

    analyzer_metadata = {
        "title": "freeCodeCamp",
        "summary": "open-source codebase and curriculum",
        "language": "TypeScript",
        "keywords": ["curriculum", "computer science", "javascript"],
        "tech_stack": ["TypeScript", "React", "Node.js", "Gatsby"],
    }

    record = build_project_metadata_record(
        project_id="freeCodeCamp/freeCodeCamp",
        source=source,
        user_metadata=user_metadata,
        analyzer_metadata=analyzer_metadata,
        updated_by="test",
        updated_at="2026-05-15T00:00:00Z",
        notes="resolver smoke test",
    )

    print(json.dumps(record, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
