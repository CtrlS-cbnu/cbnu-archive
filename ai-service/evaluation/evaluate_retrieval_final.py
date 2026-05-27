
from __future__ import annotations

import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: str | Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def recall_at_k(results: list[str], relevant: set[str], k: int) -> float:
    topk = results[:k]
    return len(set(topk) & relevant) / len(relevant) if relevant else 0.0


def precision_at_k(results: list[str], relevant: set[str], k: int) -> float:
    topk = results[:k]
    return len(set(topk) & relevant) / len(topk) if topk else 0.0


def mrr_at_k(results: list[str], relevant: set[str], k: int) -> float:
    for i, doc_id in enumerate(results[:k], start=1):
        if doc_id in relevant:
            return 1.0 / i
    return 0.0


def dcg(rels: list[int]) -> float:
    score = 0.0
    for i, rel in enumerate(rels, start=1):
        score += rel / math.log2(i + 1)
    return score


def ndcg_at_k(results: list[str], qrels_map: dict[str, int], k: int) -> float:
    predicted_rels = [qrels_map.get(doc_id, 0) for doc_id in results[:k]]
    ideal_rels = sorted(qrels_map.values(), reverse=True)[:k]
    ideal = dcg(ideal_rels)
    return dcg(predicted_rels) / ideal if ideal else 0.0


def evaluate(qrels: dict, predictions: dict, k_values: list[int] | None = None) -> dict:
    k_values = k_values or [5, 10]
    output: dict[str, float] = {}

    for k in k_values:
        recall_scores = []
        precision_scores = []
        mrr_scores = []
        ndcg_scores = []

        for qid, predicted_docs in predictions.items():
            rel_items = qrels.get(qid, [])
            rel_set = {x["doc_id"] for x in rel_items if x["relevance"] > 0}
            rel_map = {x["doc_id"]: x["relevance"] for x in rel_items}

            recall_scores.append(recall_at_k(predicted_docs, rel_set, k))
            precision_scores.append(precision_at_k(predicted_docs, rel_set, k))
            mrr_scores.append(mrr_at_k(predicted_docs, rel_set, k))
            ndcg_scores.append(ndcg_at_k(predicted_docs, rel_map, k))

        denom = len(predictions) if predictions else 1
        output[f"Recall@{k}"] = round(sum(recall_scores) / denom, 4)
        output[f"Precision@{k}"] = round(sum(precision_scores) / denom, 4)
        output[f"MRR@{k}"] = round(sum(mrr_scores) / denom, 4)
        output[f"nDCG@{k}"] = round(sum(ndcg_scores) / denom, 4)

    return output


def main():
    qrels = load_json(ROOT / "dataset" / "retrieval" / "qrels_100.json")
    predictions = load_json(ROOT / "dataset" / "retrieval" / "predictions.json")

    result = evaluate(qrels, predictions, [5, 10])

    print("=== Retrieval Evaluation ===")
    for key, value in result.items():
        print(f"{key:<12}: {value:.4f}")


if __name__ == "__main__":
    main()
