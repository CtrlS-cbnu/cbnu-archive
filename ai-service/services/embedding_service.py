
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass
class EmbeddingConfig:
    model_name: str = "intfloat/multilingual-e5-small"
    batch_size: int = 32
    normalize_embeddings: bool = True


class EmbeddingService:
    """
    intfloat/multilingual-e5-small 기반 임베딩 서비스.

    E5 계열 모델은 입력 prefix를 구분해서 쓰는 것이 권장된다.
    - query: 사용자 질의
    - passage: 검색 대상 문서
    """

    def __init__(self, config: EmbeddingConfig | None = None):
        self.config = config or EmbeddingConfig()

        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as exc:
            raise ImportError(
                "sentence-transformers가 설치되어 있지 않습니다. "
                "아래 명령으로 설치하세요: pip install sentence-transformers"
            ) from exc

        self.model = SentenceTransformer(self.config.model_name)

    def embed_query(self, query: str) -> list[float]:
        text = self._format_query(query)
        vector = self.model.encode(
            text,
            normalize_embeddings=self.config.normalize_embeddings,
        )
        return vector.tolist()

    def embed_passage(self, passage: str) -> list[float]:
        text = self._format_passage(passage)
        vector = self.model.encode(
            text,
            normalize_embeddings=self.config.normalize_embeddings,
        )
        return vector.tolist()

    def embed_passages(self, passages: Iterable[str]) -> list[list[float]]:
        texts = [self._format_passage(passage) for passage in passages]
        if not texts:
            return []

        vectors = self.model.encode(
            texts,
            batch_size=self.config.batch_size,
            normalize_embeddings=self.config.normalize_embeddings,
            show_progress_bar=True,
        )
        return [vector.tolist() for vector in vectors]

    @staticmethod
    def _format_query(query: str) -> str:
        query = " ".join((query or "").strip().split())
        return f"query: {query}"

    @staticmethod
    def _format_passage(passage: str) -> str:
        passage = " ".join((passage or "").strip().split())
        return f"passage: {passage}"
