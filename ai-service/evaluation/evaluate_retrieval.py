from __future__ import annotations

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_json(path: str | Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def recall_at_k(results, relevant, k):
    topk = results[:k]
    return len(set(topk) & relevant) / len(relevant) if relevant else 0.0

def precision_at_k(results, relevant, k):
    topk = results[:k]
    return len(set(topk) & relevant) / len(topk) if topk else 0.0

def mrr_at_k(results, relevant, k):
    for i, doc_id in enumerate(results[:k], start=1):
        if doc_id in relevant:
            return 1.0 / i
    return 0.0

def dcg(rels):
    score = 0.0
    for i, rel in enumerate(rels, start=1):
        score += rel / math.log2(i + 1)
    return score

def ndcg_at_k(results, qrels_map, k):
    predicted_rels = [qrels_map.get(doc_id, 0) for doc_id in results[:k]]
    ideal_rels = sorted(qrels_map.values(), reverse=True)[:k]
    ideal = dcg(ideal_rels)
    return dcg(predicted_rels) / ideal if ideal else 0.0

def main():
    qrels = load_json(ROOT / "dataset/retrieval/qrels.json")
    predictions = load_json(ROOT / "dataset/retrieval/predictions.json")

    recall_scores, precision_scores, mrr_scores, ndcg_scores = [], [], [], []

    for qid, predicted_docs in predictions.items():
        rel_items = qrels.get(qid, [])
        rel_set = {x["doc_id"] for x in rel_items if x["relevance"] > 0}
        rel_map = {x["doc_id"]: x["relevance"] for x in rel_items}

        recall_scores.append(recall_at_k(predicted_docs, rel_set, 5))
        precision_scores.append(precision_at_k(predicted_docs, rel_set, 5))
        mrr_scores.append(mrr_at_k(predicted_docs, rel_set, 5))
        ndcg_scores.append(ndcg_at_k(predicted_docs, rel_map, 5))

    print("=== Retrieval Evaluation ===")
    print("Recall@5   :", round(sum(recall_scores) / len(recall_scores), 4))
    print("Recall@10  :", round(sum(recall_at_k(predictions[qid], {x['doc_id'] for x in qrels.get(qid, []) if x['relevance'] > 0}, 10) for qid in predictions) / len(predictions), 4))
    print("Precision@5:", round(sum(precision_scores) / len(precision_scores), 4))
    print("MRR@5      :", round(sum(mrr_scores) / len(mrr_scores), 4))
    print("nDCG@5     :", round(sum(ndcg_scores) / len(ndcg_scores), 4))

if __name__ == "__main__":
    main()