from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class ProjectInput:
    project_id: int
    title: str
    short_summary: str
    description: str
    readme: str
    report_text: str
    file_names: List[str]
    folder_paths: List[str]
    config_texts: Dict[str, str]
    course_name: str
    semester: str
    team_size: Optional[int] = None


@dataclass
class MetadataResult:
    project_id: int
    topic: Optional[str]
    sub_topics: List[str]
    tech_stack: List[str]
    languages: List[str]
    keywords: List[str]
    project_type: Optional[str]
    difficulty: str
    input_output_type: List[str]
    searchable_text: str
    passage_text: str
    embedding_dim: int
    embedding: List[float]