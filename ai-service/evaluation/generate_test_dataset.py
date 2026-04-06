from __future__ import annotations

import json
import random
from pathlib import Path

random.seed(42)

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "dataset"
(DATASET / "metadata").mkdir(parents=True, exist_ok=True)
(DATASET / "retrieval").mkdir(parents=True, exist_ok=True)

TOPICS = [
    ("헬스케어", ["의료 영상", "질환 분류", "의료 상담"], ["Python", "PyTorch", "OpenCV"]),
    ("추천 시스템", ["도서 추천", "교과목 추천", "상품 추천"], ["Python", "FastAPI", "PostgreSQL"]),
    ("프로젝트 아카이브", ["문서 검색", "졸업작품 검색", "논문 검색"], ["React", "Spring Boot", "OpenSearch"]),
    ("컴퓨터 비전", ["이미지 분류", "OCR", "행동 탐지"], ["Python", "OpenCV", "PyTorch"]),
    ("자연어 처리", ["텍스트 분류", "요약", "질의응답"], ["Python", "Transformers"]),
    ("보안", ["침입 탐지", "로그 분석", "취약점 진단"], ["Python", "Docker", "MongoDB"]),
    ("챗봇", ["학교 공지 챗봇", "수업 Q&A", "법률 질의응답"], ["Python", "FastAPI", "RAG"]),
    ("교육", ["성적 분석", "수강신청 예측", "강의자료 요약"], ["Python", "Pandas", "Scikit-learn"]),
    ("웹 플랫폼", ["학사 관리", "시설 예약", "협업 툴"], ["React", "Spring Boot", "MySQL"]),
]

PROJECT_TYPES = ["캡스톤", "팀 프로젝트", "수업 과제", "해커톤"]
DIFFICULTIES = ["초급", "중급", "고급"]

QUERY_TEMPLATES = [
    "{topic} 프로젝트 추천해줘",
    "{topic} 관련 사례 보여줘",
    "{subtopic} 프로젝트 찾아줘",
    "{stack1}와 {stack2}를 같이 사용한 프로젝트 추천해줘",
    "{ptype} 중에서 {topic} 사례 보여줘",
    "{difficulty} 수준 {topic} 프로젝트 추천해줘",
]

def choose_difficulty(topic: str, stacks: list[str], ptype: str) -> str:
    score = 0
    if len(stacks) >= 3:
        score += 1
    if any(x in stacks for x in ["PyTorch", "Transformers", "RAG", "OpenSearch"]):
        score += 2
    if ptype == "캡스톤":
        score += 1
    if score <= 1:
        return "초급"
    if score <= 3:
        return "중급"
    return "고급"

def build_project(pid: int) -> dict:
    topic, subtopics, base_stacks = random.choice(TOPICS)
    subtopic = random.choice(subtopics)
    ptype = random.choice(PROJECT_TYPES)

    extra = []
    if topic in ["프로젝트 아카이브", "추천 시스템", "챗봇"]:
        extra = random.sample(["RAG", "OpenSearch", "Qdrant", "Redis", "PostgreSQL"], k=2)
    elif topic in ["웹 플랫폼", "교육"]:
        extra = random.sample(["React", "Spring Boot", "MySQL", "PostgreSQL", "Node.js"], k=2)
    else:
        extra = random.sample(["Docker", "MongoDB", "FastAPI", "TensorFlow", "OpenCV"], k=2)

    tech_stack = sorted(set(base_stacks + extra))
    difficulty = choose_difficulty(topic, tech_stack, ptype)

    title = f"{subtopic} 기반 {topic} 프로젝트 {pid:03d}"
    summary = f"{topic} 주제를 중심으로 {subtopic} 기능을 제공하는 {ptype}이다."
    description = (
        f"이 프로젝트는 {topic} 도메인에서 {subtopic} 문제를 해결하기 위해 개발되었다. "
        f"주요 기술 스택은 {', '.join(tech_stack)}이며, 사용자가 쉽게 탐색하거나 활용할 수 있도록 구성되었다."
    )
    keywords = list(dict.fromkeys([topic, subtopic, *tech_stack[:2]]))[:5]

    course_name = {
        "캡스톤": "캡스톤디자인",
        "팀 프로젝트": "개신프론티어",
        "수업 과제": "데이터베이스",
        "해커톤": "해커톤"
    }[ptype]

    return {
        "project_id": f"p{pid:03d}",
        "title": title,
        "summary": summary,
        "description": description,
        "course_name": course_name,
        "input": {
            "short_summary": summary,
            "description": description,
            "readme": description,
            "report_text": "",
            "file_names": [],
            "folder_paths": [],
            "config_texts": {},
            "course_name": course_name,
            "semester": "",
            "team_size": 2
        },
        "gold": {
            "topic": topic,
            "tech_stack": tech_stack,
            "project_type": ptype,
            "difficulty": difficulty,
            "keywords": keywords,
        }
    }

def generate():
    projects = [build_project(i) for i in range(1, 121)]

    # metadata gold
    metadata_gold = [
        {
            "project_id": p["project_id"],
            "title": p["title"],
            "input": p["input"],
            "gold": p["gold"]
        } for p in projects
    ]
    (DATASET / "metadata" / "metadata_gold.json").write_text(
        json.dumps(metadata_gold, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # retrieval corpus
    with (DATASET / "retrieval" / "corpus.jsonl").open("w", encoding="utf-8") as f:
        for p in projects:
            row = {
                "_id": p["project_id"],
                "title": p["title"],
                "text": f"{p['summary']} {p['description']}",
                "metadata": {
                    "course_name": p["course_name"],
                    "topic": p["gold"]["topic"],
                    "tech_stack": p["gold"]["tech_stack"],
                    "difficulty": p["gold"]["difficulty"],
                    "project_type": p["gold"]["project_type"],
                },
            }
            f.write(json.dumps(row, ensure_ascii=False) + "\n")

    queries = []
    qrels = {}

    for i, p in enumerate(projects[:60], start=1):
        topic = p["gold"]["topic"]
        subtopic = p["gold"]["keywords"][1] if len(p["gold"]["keywords"]) > 1 else topic
        stacks = p["gold"]["tech_stack"]
        stack1 = stacks[0]
        stack2 = stacks[1] if len(stacks) > 1 else stacks[0]
        ptype = p["gold"]["project_type"]
        difficulty = p["gold"]["difficulty"]

        query = random.choice(QUERY_TEMPLATES).format(
            topic=topic,
            subtopic=subtopic,
            stack1=stack1,
            stack2=stack2,
            ptype=ptype,
            difficulty=difficulty,
        )
        qid = f"q{i:03d}"
        queries.append({"_id": qid, "text": query})

        relevant = []
        for candidate in projects:
            rel = 0
            if candidate["gold"]["topic"] == topic:
                rel += 2
            if ptype == candidate["gold"]["project_type"]:
                rel += 1
            if stack1 in candidate["gold"]["tech_stack"] and stack2 in candidate["gold"]["tech_stack"]:
                rel += 1
            if difficulty == candidate["gold"]["difficulty"]:
                rel += 1
            if rel > 0:
                relevant.append({"doc_id": candidate["project_id"], "relevance": min(rel, 3)})

        relevant.sort(key=lambda x: x["relevance"], reverse=True)
        qrels[qid] = relevant[:10]

    with (DATASET / "retrieval" / "queries.jsonl").open("w", encoding="utf-8") as f:
        for q in queries:
            f.write(json.dumps(q, ensure_ascii=False) + "\n")

    (DATASET / "retrieval" / "qrels.json").write_text(
        json.dumps(qrels, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print("generated:")
    print("- dataset/metadata/metadata_gold.json")
    print("- dataset/retrieval/corpus.jsonl")
    print("- dataset/retrieval/queries.jsonl")
    print("- dataset/retrieval/qrels.json")

if __name__ == "__main__":
    generate()