
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from services.embedding_service import EmbeddingService
from services.ranking import rank_projects


def load_jsonl(path: str | Path) -> list[dict]:
    rows = []
    with Path(path).open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def save_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    corpus_path = ROOT / "dataset" / "retrieval" / "corpus_resolved_100.jsonl"
    queries_path = ROOT / "dataset" / "retrieval" / "queries_100.jsonl"
    output_path = ROOT / "dataset" / "retrieval" / "predictions.json"

    corpus = load_jsonl(corpus_path)
    queries = load_jsonl(queries_path)

    embedder = EmbeddingService()

    passage_texts = [doc["text"] for doc in corpus]
    passage_embeddings = embedder.embed_passages(passage_texts)

    project_items = []
    for doc, embedding in zip(corpus, passage_embeddings):
        project_items.append({
            "project_id": doc["_id"],
            "title": doc.get("title", ""),
            "metadata": doc.get("metadata", {}),
            "embedding": embedding,
        })

    predictions = {}

    for query in queries:
        query_embedding = embedder.embed_query(query["text"])

        ranked = rank_projects(
            query=query["text"],
            query_embedding=query_embedding,
            project_items=project_items,
            top_k=10,
        )

        predictions[query["_id"]] = [x["project_id"] for x in ranked]

    save_json(output_path, predictions)
    print(f"saved: {output_path}")
    print(f"queries: {len(queries)}")
    print(f"corpus: {len(corpus)}")


if __name__ == "__main__":
    main()
