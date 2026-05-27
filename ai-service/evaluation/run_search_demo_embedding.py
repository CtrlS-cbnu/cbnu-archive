
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from services.embedding_service import EmbeddingService
from services.search_service import search_projects


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def main():
    corpus_path = ROOT / "dataset" / "retrieval" / "corpus.jsonl"
    scenarios_path = ROOT / "dataset" / "retrieval" / "demo_queries.json"
    output_path = ROOT / "dataset" / "retrieval" / "demo_search_results.json"

    corpus = load_jsonl(corpus_path)
    scenarios = json.loads(scenarios_path.read_text(encoding="utf-8"))["scenarios"]

    embedder = EmbeddingService()

    passage_texts = [row.get("text", "") for row in corpus]
    passage_embeddings = embedder.embed_passages(passage_texts)

    candidates = []
    for row, embedding in zip(corpus, passage_embeddings):
        candidates.append({
            "project_id": row["_id"],
            "title": row.get("title", ""),
            "metadata": row.get("metadata", {}),
            "embedding": embedding,
        })

    output = []

    for scenario in scenarios:
        query = scenario["query"]
        query_embedding = embedder.embed_query(query)

        result = search_projects(
            query=query,
            query_embedding=query_embedding,
            candidates=candidates,
            top_k=5,
        )

        output.append({
            "query": query,
            "expected_behavior": scenario.get("expected_behavior", ""),
            "analysis": result["analysis"],
            "results": result["results"],
        })

    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved: {output_path}")
    print(f"queries: {len(scenarios)}")
    print(f"corpus: {len(corpus)}")


if __name__ == "__main__":
    main()
