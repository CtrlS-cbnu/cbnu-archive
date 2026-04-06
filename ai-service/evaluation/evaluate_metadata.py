from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

def load_json(path: str | Path) -> Any:
    return json.loads(Path(path).read_text(encoding="utf-8"))

def normalize_value(value: str | None, alias_map: dict[str, str]) -> str | None:
    if value is None:
        return None
    v = value.strip()
    return alias_map.get(v.lower(), v)

def normalize_list(values: list[str], alias_map: dict[str, str]) -> list[str]:
    out = []
    for v in values:
        x = alias_map.get(v.strip().lower(), v.strip())
        if x not in out:
            out.append(x)
    return out

def normalize_keywords(values: list[str]) -> list[str]:
    out = []
    for v in values:
        x = v.strip().lower()
        x = x.replace(".", "")
        x = x.replace("이며", "")
        x = x.replace("이다", "")
        if x and x not in out:
            out.append(x)
    return out

def single_label_accuracy(gold_items, pred_items, field, alias_map):
    pred_map = {item["project_id"]: item["pred"].get(field) for item in pred_items}
    total, correct = 0, 0

    for item in gold_items:
        pid = item["project_id"]
        gold_val = normalize_value(item["gold"].get(field), alias_map)
        pred_val = normalize_value(pred_map.get(pid), alias_map)
        total += 1
        correct += int(gold_val == pred_val)

    return correct / total if total else 0.0

def multi_label_prf(gold_items, pred_items, field, alias_map=None, is_keyword=False):
    if alias_map is None:
        alias_map = {}

    pred_map = {item["project_id"]: item["pred"].get(field, []) for item in pred_items}
    tp = fp = fn = 0

    for item in gold_items:
        pid = item["project_id"]

        if is_keyword:
            gold_vals = set(normalize_keywords(item["gold"].get(field, [])))
            pred_vals = set(normalize_keywords(pred_map.get(pid, [])))
        else:
            gold_vals = set(normalize_list(item["gold"].get(field, []), alias_map))
            pred_vals = set(normalize_list(pred_map.get(pid, []), alias_map))

        tp += len(gold_vals & pred_vals)
        fp += len(pred_vals - gold_vals)
        fn += len(gold_vals - pred_vals)

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
    return {"precision": round(precision, 4), "recall": round(recall, 4), "f1": round(f1, 4)}

def main():
    gold_items = load_json(ROOT / "dataset/metadata/metadata_gold.json")
    pred_items = load_json(ROOT / "dataset/metadata/metadata_pred.json")
    aliases = load_json(ROOT / "dataset/metadata/metadata_aliases.json")

    topic_acc = single_label_accuracy(
        gold_items, pred_items, "topic", aliases.get("topic_aliases", {})
    )

    tech_stack_metrics = multi_label_prf(
        gold_items, pred_items, "tech_stack", aliases.get("tech_stack_aliases", {})
    )

    keyword_metrics = multi_label_prf(
        gold_items, pred_items, "keywords", is_keyword=True
    )

    print("=== Metadata Evaluation ===")
    print(f"topic accuracy     : {topic_acc:.4f}")
    print(f"tech_stack metrics : {tech_stack_metrics}")
    print(f"keywords metrics   : {keyword_metrics}")

if __name__ == "__main__":
    main()