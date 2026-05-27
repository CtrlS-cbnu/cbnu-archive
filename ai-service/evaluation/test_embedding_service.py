
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from services.embedding_service import EmbeddingService


def cosine_similarity(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def main():
    embedder = EmbeddingService()

    query = "React로 만든 추천 시스템 프로젝트"
    positive = "title: 추천 시스템\\nkeywords: recommendation system react\\ntech_stack: React TypeScript"
    negative = "title: 시스템 디자인 면접 자료\\nkeywords: system design interview\\ntech_stack: Python"

    q = embedder.embed_query(query)
    p = embedder.embed_passage(positive)
    n = embedder.embed_passage(negative)

    print("=== Embedding Smoke Test ===")
    print(f"model: {embedder.config.model_name}")
    print(f"dimension: {len(q)}")
    print(f"positive_similarity: {cosine_similarity(q, p):.4f}")
    print(f"negative_similarity: {cosine_similarity(q, n):.4f}")


if __name__ == "__main__":
    main()
