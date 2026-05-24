from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from services.simple_metadata_analyzer import SimpleMetadataAnalyzer
from services.metadata_resolver import build_project_metadata_record

SOURCE_PATH = ROOT / "dataset" / "metadata" / "metadata_source.json"
RECORDS_PATH = ROOT / "dataset" / "metadata" / "project_metadata_records.json"
CORPUS_PATH = ROOT / "dataset" / "retrieval" / "corpus_resolved.jsonl"
QUERIES_PATH = ROOT / "dataset" / "retrieval" / "queries.jsonl"
QRELS_PATH = ROOT / "dataset" / "retrieval" / "qrels.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def save_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def build_source(item: dict) -> dict:
    inp = item.get("input", {})
    repo_meta = item.get("repo_meta", {})

    return {
        "repo_url": item.get("repo_url", ""),
        "repo_name": item.get("title", ""),
        "repo_description": inp.get("description", "") or inp.get("short_summary", ""),
        "repo_language": repo_meta.get("language"),
        "readme": inp.get("readme", ""),
        "file_names": inp.get("file_names", []),
        "config_texts": inp.get("config_texts", {}),
        "repo_topics": repo_meta.get("topics", []),
    }


def build_user_metadata_from_source(item: dict) -> dict:
    inp = item.get("input", {})
    repo_meta = item.get("repo_meta", {})

    # 현재는 DB/사용자 입력이 없으므로 title/summary/language만 source에서 넣고,
    # keywords/tech_stack은 비워 analyzer 결과가 resolved_metadata에 반영되게 둔다.
    return {
        "title": item.get("title", ""),
        "summary": inp.get("short_summary", "") or inp.get("description", ""),
        "description": inp.get("description", "") or inp.get("short_summary", ""),
        "language": repo_meta.get("language"),
        "keywords": [],
        "tech_stack": [],
    }


def build_analyzer_metadata(analyzer: SimpleMetadataAnalyzer, source: dict) -> dict:
    result = analyzer.analyze(
        repo_name=source.get("repo_name", ""),
        readme=source.get("readme", ""),
        repo_description=source.get("repo_description", ""),
        repo_language=source.get("repo_language"),
        file_names=source.get("file_names", []),
        config_texts=source.get("config_texts", {}),
        repo_topics=source.get("repo_topics", []),
    )

    return {
        "title": result.title,
        "summary": result.summary,
        "language": result.language,
        "keywords": result.keywords,
        "tech_stack": result.tech_stack,
    }


def build_search_text(resolved: dict) -> str:
    return "\n".join([
        f"title: {resolved.get('title', '')}",
        f"summary: {resolved.get('summary', '')}",
        f"description: {resolved.get('description', resolved.get('summary', ''))}",
        f"language: {resolved.get('language', '')}",
        f"keywords: {' '.join(resolved.get('keywords', []))}",
        f"tech_stack: {' '.join(resolved.get('tech_stack', []))}",
    ])


def build_corpus_row(record: dict) -> dict:
    resolved = record.get("resolved_metadata", {})

    return {
        "_id": record["project_id"],
        "title": resolved.get("title", ""),
        "text": build_search_text(resolved),
        "metadata": {
            "summary": resolved.get("summary", ""),
            "description": resolved.get("description", resolved.get("summary", "")),
            "language": resolved.get("language", ""),
            "keywords": resolved.get("keywords", []),
            "tech_stack": resolved.get("tech_stack", []),
        },
    }


def build_queries_and_qrels() -> tuple[list[dict], dict]:
    """
    metadata_source.json에 들어 있는 대표 GitHub repo 기준으로
    query와 qrels를 같은 project_id 기준으로 만든다.

    relevance:
    - 3: 매우 직접적인 정답
    - 2: 관련성이 높은 보조 정답
    - 1: 약한 관련 정답
    """

    query_specs = [
        {
            "_id": "q1",
            "text": "무료 코딩 학습 커리큘럼과 자바스크립트 교육 플랫폼",
            "relevant": [
                ("freeCodeCamp/freeCodeCamp", 3),
                ("ossu/computer-science", 2),
                ("practical-tutorials/project-based-learning", 1),
            ],
        },
        {
            "_id": "q2",
            "text": "시스템 디자인 면접 준비 자료",
            "relevant": [
                ("donnemartin/system-design-primer", 3),
                ("ashishps1/awesome-system-design-resources", 3),
            ],
        },
        {
            "_id": "q3",
            "text": "안드로이드 화면 미러링과 녹화 도구",
            "relevant": [
                ("Genymobile/scrcpy", 3),
            ],
        },
        {
            "_id": "q4",
            "text": "자바 스프링 부트 웹 애플리케이션 프레임워크",
            "relevant": [
                ("spring-projects/spring-boot", 3),
            ],
        },
        {
            "_id": "q5",
            "text": "프로토콜 버퍼 직렬화 데이터 교환 포맷",
            "relevant": [
                ("protocolbuffers/protobuf", 3),
            ],
        },
        {
            "_id": "q6",
            "text": "스테이블 디퓨전 이미지 생성 웹 UI",
            "relevant": [
                ("AUTOMATIC1111/stable-diffusion-webui", 3),
            ],
        },
        {
            "_id": "q7",
            "text": "대규모 언어 모델 DeepSeek V3",
            "relevant": [
                ("deepseek-ai/DeepSeek-V3", 3),
            ],
        },
        {
            "_id": "q8",
            "text": "깃허브 리드미 통계 배지 생성",
            "relevant": [
                ("anuraghazra/github-readme-stats", 3),
            ],
        },
        {
            "_id": "q9",
            "text": "코드 편집기 개발 환경 TypeScript IDE",
            "relevant": [
                ("microsoft/vscode", 3),
            ],
        },
        {
            "_id": "q10",
            "text": "윈도우 생산성 유틸리티 모음",
            "relevant": [
                ("microsoft/PowerToys", 3),
            ],
        },
        {
            "_id": "q11",
            "text": "추천 알고리즘 피드 랭킹 머신러닝 시스템",
            "relevant": [
                ("twitter/the-algorithm", 3),
            ],
        },
        {
            "_id": "q12",
            "text": "Go 기반 네트워크 프록시 도구",
            "relevant": [
                ("XTLS/Xray-core", 3),
            ],
        },
        {
            "_id": "q13",
            "text": "테슬라 차량 라이트 쇼 제작",
            "relevant": [
                ("teslamotors/light-show", 3),
            ],
        },
        {
            "_id": "q14",
            "text": "Elixir HTTP 클라이언트 미들웨어",
            "relevant": [
                ("elixir-tesla/tesla", 3),
            ],
        },
        {
            "_id": "q15",
            "text": "맥 앱 추천 awesome mac",
            "relevant": [
                ("jaywcjlove/awesome-mac", 3),
            ],
        },
    ]

    queries = [{"_id": x["_id"], "text": x["text"]} for x in query_specs]

    qrels = {
        x["_id"]: [
            {"doc_id": doc_id, "relevance": relevance}
            for doc_id, relevance in x["relevant"]
        ]
        for x in query_specs
    }

    return queries, qrels


def main():
    analyzer = SimpleMetadataAnalyzer()
    source_items = load_json(SOURCE_PATH)

    records = []
    corpus_rows = []

    for item in source_items:
        project_id = item["project_id"]

        source = build_source(item)
        user_metadata = build_user_metadata_from_source(item)
        analyzer_metadata = build_analyzer_metadata(analyzer, source)

        record = build_project_metadata_record(
            project_id=project_id,
            source=source,
            user_metadata=user_metadata,
            analyzer_metadata=analyzer_metadata,
            updated_by="system",
            updated_at=None,
            notes="generated from metadata_source.json for retrieval evaluation",
        )

        records.append(record)
        corpus_rows.append(build_corpus_row(record))

    queries, qrels = build_queries_and_qrels()

    save_json(RECORDS_PATH, records)
    save_jsonl(CORPUS_PATH, corpus_rows)
    save_jsonl(QUERIES_PATH, queries)
    save_json(QRELS_PATH, qrels)

    print(f"saved: {RECORDS_PATH}")
    print(f"saved: {CORPUS_PATH}")
    print(f"saved: {QUERIES_PATH}")
    print(f"saved: {QRELS_PATH}")
    print(f"records: {len(records)}")
    print(f"corpus: {len(corpus_rows)}")
    print(f"queries: {len(queries)}")


if __name__ == "__main__":
    main()