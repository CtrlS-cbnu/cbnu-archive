
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class MetadataValueSet:
    title: str = ""
    summary: str = ""
    language: str = ""
    keywords: list[str] = field(default_factory=list)
    tech_stack: list[str] = field(default_factory=list)


@dataclass
class ProjectSource:
    repo_url: str = ""
    repo_name: str = ""
    repo_description: str = ""
    repo_language: str = ""
    readme: str = ""
    file_names: list[str] = field(default_factory=list)
    config_texts: dict[str, str] = field(default_factory=dict)
    repo_topics: list[str] = field(default_factory=list)


@dataclass
class ProjectMetadataAudit:
    resolution_policy: str = "user_priority_with_analyzer_suggestion"
    updated_by: str = ""
    updated_at: str = ""
    notes: str = ""


@dataclass
class ProjectMetadataRecord:
    project_id: str
    source: ProjectSource
    user_metadata: MetadataValueSet
    analyzer_metadata: MetadataValueSet
    resolved_metadata: MetadataValueSet
    audit: ProjectMetadataAudit = field(default_factory=ProjectMetadataAudit)

    def to_dict(self) -> dict[str, Any]:
        return {
            "project_id": self.project_id,
            "source": {
                "repo_url": self.source.repo_url,
                "repo_name": self.source.repo_name,
                "repo_description": self.source.repo_description,
                "repo_language": self.source.repo_language,
                "readme": self.source.readme,
                "file_names": self.source.file_names,
                "config_texts": self.source.config_texts,
                "repo_topics": self.source.repo_topics,
            },
            "user_metadata": {
                "title": self.user_metadata.title,
                "summary": self.user_metadata.summary,
                "language": self.user_metadata.language,
                "keywords": self.user_metadata.keywords,
                "tech_stack": self.user_metadata.tech_stack,
            },
            "analyzer_metadata": {
                "title": self.analyzer_metadata.title,
                "summary": self.analyzer_metadata.summary,
                "language": self.analyzer_metadata.language,
                "keywords": self.analyzer_metadata.keywords,
                "tech_stack": self.analyzer_metadata.tech_stack,
            },
            "resolved_metadata": {
                "title": self.resolved_metadata.title,
                "summary": self.resolved_metadata.summary,
                "language": self.resolved_metadata.language,
                "keywords": self.resolved_metadata.keywords,
                "tech_stack": self.resolved_metadata.tech_stack,
            },
            "audit": {
                "resolution_policy": self.audit.resolution_policy,
                "updated_by": self.audit.updated_by,
                "updated_at": self.audit.updated_at,
                "notes": self.audit.notes,
            },
        }
