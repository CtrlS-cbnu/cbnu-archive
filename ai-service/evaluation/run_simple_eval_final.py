
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from services.simple_metadata_analyzer import SimpleMetadataAnalyzer

DATA_PATH = ROOT / "dataset" / "metadata"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    analyzer = SimpleMetadataAnalyzer()
    gold_items = load_json(DATA_PATH / "metadata_gold_simple.json")

    preds = []

    for item in gold_items:
        inp = item["input"]

        result = analyzer.analyze(
            repo_name=inp.get("repo_name", ""),
            readme=inp.get("readme", ""),
            repo_description=inp.get("repo_description", ""),
            repo_language=inp.get("repo_language"),
            file_names=inp.get("file_names", []),
            config_texts=inp.get("config_texts", {}),
            repo_topics=inp.get("repo_topics", []),
        )

        preds.append({
            "project_id": item["project_id"],
            "pred": {
                "title": result.title,
                "summary": result.summary,
                "language": result.language,
                "keywords": result.keywords,
                "tech_stack": result.tech_stack,
            },
            "analyzer_metadata": {
                "title": result.title,
                "summary": result.summary,
                "language": result.language,
                "keywords": result.keywords,
                "tech_stack": result.tech_stack,
            }
        })

    out_path = DATA_PATH / "metadata_pred_simple.json"
    out_path.write_text(
        json.dumps(preds, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"saved: {out_path}")


if __name__ == "__main__":
    main()
