from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "dataset" / "metadata"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_text(x: str | None) -> str:
    if not x:
        return ""
    return " ".join(x.strip().lower().split())


def normalize_keywords(values: list[str]) -> list[str]:
    out = []
    for v in values:
        x = normalize_text(v)
        if x and x not in out:
            out.append(x)
    return out


def main():
    gold_items = load_json(DATA_PATH / "metadata_gold_simple.json")
    pred_items = load_json(DATA_PATH / "metadata_pred_simple.json")

    pred_map = {x["project_id"]: x["pred"] for x in pred_items}

    total = len(gold_items)
    title_match = 0
    summary_nonempty = 0
    language_correct = 0

    tp = fp = fn = 0

    for item in gold_items:
        pid = item["project_id"]
        gold = item["gold"]
        pred = pred_map.get(pid, {})

        if normalize_text(gold.get("title")) == normalize_text(pred.get("title")):
            title_match += 1

        if normalize_text(pred.get("summary")) != "":
            summary_nonempty += 1

        if normalize_text(gold.get("language")) == normalize_text(pred.get("language")):
            language_correct += 1

        gold_kw = set(normalize_keywords(gold.get("keywords", [])))
        pred_kw = set(normalize_keywords(pred.get("keywords", [])))

        tp += len(gold_kw & pred_kw)
        fp += len(pred_kw - gold_kw)
        fn += len(gold_kw - pred_kw)

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0

    print("=== Simple Metadata Evaluation ===")
    print(f"title_match_rate      : {title_match / total:.4f}")
    print(f"summary_nonempty_rate : {summary_nonempty / total:.4f}")
    print(f"language_accuracy     : {language_correct / total:.4f}")
    print(f"keyword_precision     : {precision:.4f}")
    print(f"keyword_recall        : {recall:.4f}")
    print(f"keyword_f1            : {f1:.4f}")


if __name__ == "__main__":
    main()