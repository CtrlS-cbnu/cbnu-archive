from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from models.project import ProjectInput
from services.metadata_analyzer import MetadataAnalyzer
from services.ranking import rank_projects

ROOT = Path(__file__).resolve().parents[1]

def load_json(path: str | Path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def load_jsonl(path: str | Path):
    rows = []
    with Path(path).open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows

def build_metadata_predictions():
    analyzer = MetadataAnalyzer()
    gold_items = load_json(ROOT / "dataset/metadata/metadata_gold.json")

    preds = []
    for item in gold_items:
        src = item["input"]

        project = ProjectInput(
            project_id=0,
            title=item["title"],
            short_summary=src.get("short_summary", ""),
            description=src.get("description", ""),
            readme=src.get("readme", ""),
            report_text=src.get("report_text", ""),
            file_names=src.get("file_names", []),
            folder_paths=src.get("folder_paths", []),
            config_texts=src.get("config_texts", {}),
            course_name=src.get("course_name", ""),
            semester=src.get("semester", ""),
            team_size=src.get("team_size"),
        )
        result = analyzer.analyze(project)
        preds.append({
            "project_id": item["project_id"],
            "pred": {
                "topic": result.topic,
                "tech_stack": result.tech_stack,
                "difficulty": result.difficulty,
                "keywords": result.keywords,
            }
        })

    Path(ROOT / "dataset/metadata/metadata_pred.json").write_text(
        json.dumps(preds, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("saved metadata_pred.json")

def build_retrieval_predictions():
    analyzer = MetadataAnalyzer()
    corpus = load_jsonl(ROOT / "dataset/retrieval/corpus.jsonl")
    queries = load_jsonl(ROOT / "dataset/retrieval/queries.jsonl")

    project_items = []
    for doc in corpus:
        emb = analyzer.model.encode(
            f"passage: {doc['title']} {doc['text']}",
            normalize_embeddings=True,
        ).tolist()

        md = doc["metadata"]
        project_items.append({
            "project_id": doc["_id"],
            "title": doc["title"],
            "topic": md.get("topic"),
            "tech_stack": md.get("tech_stack", []),
            "keywords": [],
            "difficulty": md.get("difficulty"),
            "project_type": md.get("project_type"),
            "embedding": emb,
        })

    predictions = {}
    for q in queries:
        query_vec = analyzer.embed_query(q["text"])
        ranked = rank_projects(
            query=q["text"],
            query_embedding=query_vec,
            project_items=project_items,
            top_k=10,
        )
        predictions[q["_id"]] = [x["project_id"] for x in ranked]

    Path(ROOT / "dataset/retrieval/predictions.json").write_text(
        json.dumps(predictions, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("saved predictions.json")

if __name__ == "__main__":
    build_metadata_predictions()
    build_retrieval_predictions()