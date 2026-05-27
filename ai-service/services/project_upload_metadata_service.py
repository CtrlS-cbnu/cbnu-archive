
from __future__ import annotations

from typing import Any

from services.simple_metadata_analyzer import SimpleMetadataAnalyzer
from services.metadata_resolver import build_project_metadata_record


def build_source_from_input(
    repo_url: str = "",
    repo_name: str = "",
    repo_description: str = "",
    repo_language: str = "",
    readme: str = "",
    file_names: list[str] | None = None,
    config_texts: dict[str, str] | None = None,
    repo_topics: list[str] | None = None,
) -> dict[str, Any]:
    return {
        "repo_url": repo_url,
        "repo_name": repo_name,
        "repo_description": repo_description,
        "repo_language": repo_language,
        "readme": readme,
        "file_names": file_names or [],
        "config_texts": config_texts or {},
        "repo_topics": repo_topics or [],
    }


def build_analyzer_metadata(source: dict[str, Any]) -> dict[str, Any]:
    analyzer = SimpleMetadataAnalyzer()

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


def create_project_metadata_from_upload(
    project_id: str,
    source: dict[str, Any],
    user_metadata: dict[str, Any],
    updated_by: str = "user",
    updated_at: str | None = None,
) -> dict[str, Any]:
    analyzer_metadata = build_analyzer_metadata(source)

    return build_project_metadata_record(
        project_id=project_id,
        source=source,
        user_metadata=user_metadata,
        analyzer_metadata=analyzer_metadata,
        updated_by=updated_by,
        updated_at=updated_at,
        notes="created from upload flow",
    )


# Example usage in API/service layer:
#
# source = build_source_from_input(
#     repo_url="https://github.com/freeCodeCamp/freeCodeCamp",
#     repo_name="freeCodeCamp",
#     repo_description="freeCodeCamp.org's open-source codebase and curriculum.",
#     repo_language="TypeScript",
#     readme="...",
#     file_names=["README.md", "package.json"],
#     config_texts={"package.json": "..."},
#     repo_topics=["education", "javascript", "curriculum"],
# )
#
# user_metadata = {
#     "title": "freeCodeCamp 플랫폼",
#     "summary": "무료 코딩 학습 플랫폼의 오픈소스 코드베이스",
#     "description": "커리큘럼과 인증 과정을 제공하는 교육 플랫폼",
#     "keywords": ["education", "curriculum", "javascript"],
#     "tech_stack": ["TypeScript", "React", "Node.js"],
# }
#
# record = create_project_metadata_from_upload(
#     project_id="freeCodeCamp/freeCodeCamp",
#     source=source,
#     user_metadata=user_metadata,
# )
