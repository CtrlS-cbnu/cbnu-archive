from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

router = APIRouter(prefix="/search", tags=["search"])


class ProjectContext(BaseModel):
    projectId: int | None = None
    project_id: int | None = None
    title: str | None = None
    summary: str | None = None
    techStacks: list[str] | None = None
    tech_stack: list[str] | None = None
    score: float | None = None


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    project_ids: list[int] = []
    retrievedDocs: list[ProjectContext] = []
    retrieved_docs: list[ProjectContext] = []


@router.post("")
def search_projects(request: SearchRequest) -> dict[str, Any]:
    docs = request.retrievedDocs or request.retrieved_docs

    if docs:
        recommended_ids = []
        for doc in docs[:request.top_k]:
            project_id = doc.projectId if doc.projectId is not None else doc.project_id
            if project_id is not None:
                recommended_ids.append(project_id)
    else:
        recommended_ids = request.project_ids[:request.top_k]

    return {
        "answer": f"'{request.query}'에 대한 테스트 추천 응답입니다.",
        "recommendedProjectIds": recommended_ids,
        "reasoning": "로컬 LLM 모델 로딩 없이 백엔드-AI 서비스 연동을 검증하기 위한 mock 응답입니다."
    }