from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/embed", tags=["embed"])


class EmbedRequest(BaseModel):
    text: str | None = None
    query: str | None = None


def make_mock_embedding(text: str, dim: int = 384) -> list[float]:
    values = [0.0] * dim

    base = sum(ord(ch) for ch in text) if text else 1

    first = base % dim
    second = (base * 7) % dim
    third = (base * 13) % dim

    values[first] = 1.0
    values[second] = 0.5
    values[third] = 0.25

    return values


@router.post("")
def create_embedding(request: EmbedRequest):
    text = request.text or request.query or ""
    return {
        "embedding": make_mock_embedding(text)
    }