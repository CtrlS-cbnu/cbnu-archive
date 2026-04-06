from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATASET_DIR = ROOT / "dataset" / "metadata"

SOURCE_PATH = DATASET_DIR / "metadata_source.json"
OUTPUT_PATH = DATASET_DIR / "metadata_gold_bootstrap.json"


TOPIC_PATTERNS = {
    "프로젝트 아카이브": [
        r"archive", r"아카이브", r"문서 검색", r"논문 검색", r"repo", r"repository"
    ],
    "추천 시스템": [
        r"recommend", r"recommendation", r"추천", r"personalized", r"개인화"
    ],
    "컴퓨터 비전": [
        r"computer vision", r"비전", r"image", r"영상", r"ocr", r"object detection",
        r"segmentation", r"classification"
    ],
    "자연어 처리": [
        r"nlp", r"natural language", r"자연어", r"텍스트", r"요약", r"질의응답",
        r"question answering", r"transformers"
    ],
    "헬스케어": [
        r"healthcare", r"medical", r"의료", r"헬스케어", r"clinical"
    ],
    "보안": [
        r"security", r"보안", r"침입", r"취약점", r"malware", r"로그 분석"
    ],
    "챗봇": [
        r"chatbot", r"챗봇", r"assistant", r"대화", r"q&a"
    ],
    "교육": [
        r"education", r"learning", r"curriculum", r"course", r"강의", r"교육"
    ],
    "웹 플랫폼": [
        r"web", r"frontend", r"backend", r"platform", r"react", r"spring boot"
    ],
}


TECH_PATTERNS = {
    "Python": [r"\bpython\b", r"requirements\.txt", r"pyproject\.toml", r"\.py\b"],
    "Java": [r"\bjava\b", r"pom\.xml", r"build\.gradle", r"\.java\b"],
    "JavaScript": [r"\bjavascript\b", r"\.js\b", r"node\.js"],
    "TypeScript": [r"\btypescript\b", r"\.ts\b", r"\.tsx\b"],
    "React": [r"\breact\b"],
    "Spring Boot": [r"spring[- ]boot", r"spring boot", r"spring-boot"],
    "FastAPI": [r"\bfastapi\b"],
    "Flask": [r"\bflask\b"],
    "Django": [r"\bdjango\b"],
    "PostgreSQL": [r"\bpostgresql\b", r"\bpostgres\b"],
    "MySQL": [r"\bmysql\b"],
    "MongoDB": [r"\bmongodb\b"],
    "Redis": [r"\bredis\b"],
    "OpenSearch": [r"\bopensearch\b", r"\belasticsearch\b"],
    "Qdrant": [r"\bqdrant\b"],
    "FAISS": [r"\bfaiss\b"],
    "RAG": [r"\brag\b", r"retrieval[- ]augmented"],
    "PyTorch": [r"\bpytorch\b", r"\btorch\b"],
    "TensorFlow": [r"\btensorflow\b"],
    "Transformers": [r"\btransformers\b"],
    "OpenCV": [r"\bopencv\b", r"\bcv2\b"],
    "Docker": [r"\bdocker\b", r"dockerfile"],
    "Node.js": [r"\bnode\.js\b", r"\bnode\b"],
    "Vue": [r"\bvue\b"],
    "Flutter": [r"\bflutter\b"],
    "Firebase": [r"\bfirebase\b"],
    "Scikit-learn": [r"scikit-learn", r"sklearn"],
    "Pandas": [r"\bpandas\b"],
}


KEYWORD_PHRASES = [
    "문서 검색",
    "논문 검색",
    "도서 추천",
    "교과목 추천",
    "상품 추천",
    "이미지 분류",
    "객체 탐지",
    "행동 탐지",
    "텍스트 분류",
    "질의응답",
    "학교 공지 챗봇",
    "의료 영상",
    "의료 상담",
    "침입 탐지",
    "로그 분석",
    "취약점 진단",
    "강의자료 요약",
    "성적 분석",
    "수강신청 예측",
    "협업 툴",
    "시설 예약",
    "프로젝트 아카이브",
    "추천 시스템",
    "컴퓨터 비전",
    "자연어 처리",
    "헬스케어",
    "웹 플랫폼",
    "보안",
    "챗봇",
    "교육",
]


NOISY_KEYWORDS = {
    "project", "projects", "repository", "readme", "codebase", "curriculum",
    "platform", "service", "system", "application", "app", "framework",
    "개발", "구현", "프로젝트", "기술", "스택", "사용", "기반",
    "및", "그리고", "또한", "입니다", "있습니다", "한다", "된다",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def join_source_text(item: dict[str, Any]) -> str:
    inp = item.get("input", {})
    parts = [
        item.get("title", ""),
        inp.get("short_summary", ""),
        inp.get("description", ""),
        inp.get("readme", ""),
        " ".join(inp.get("file_names", [])),
        " ".join(inp.get("folder_paths", [])),
        " ".join(inp.get("config_texts", {}).keys()),
        " ".join(inp.get("config_texts", {}).values()),
    ]
    return "\n".join([p for p in parts if p])


def infer_topic(text: str) -> str | None:
    scores: dict[str, int] = {}
    lowered = text.lower()

    for topic, patterns in TOPIC_PATTERNS.items():
        score = 0
        for pat in patterns:
            if re.search(pat, lowered, re.IGNORECASE):
                score += 1
        if score > 0:
            scores[topic] = score

    if not scores:
        return None

    return sorted(scores.items(), key=lambda x: (-x[1], x[0]))[0][0]


def infer_tech_stack(text: str) -> list[str]:
    lowered = text.lower()
    found = []

    for tech, patterns in TECH_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, lowered, re.IGNORECASE):
                found.append(tech)
                break

    return sorted(set(found))


def infer_keywords(text: str, topic: str | None, tech_stack: list[str], max_keywords: int = 5) -> list[str]:
    lowered = text.lower()
    found: list[str] = []

    if topic:
        found.append(topic)

    for phrase in sorted(KEYWORD_PHRASES, key=len, reverse=True):
        if phrase.lower() in lowered and phrase not in found:
            found.append(phrase)

    for tech in tech_stack[:2]:
        if tech not in found:
            found.append(tech)

    tokens = re.findall(r"[A-Za-z가-힣][A-Za-z0-9가-힣\-\+]{1,30}", text)
    for tok in tokens:
        t = tok.strip()
        tl = t.lower()
        if len(t) < 2:
            continue
        if tl in NOISY_KEYWORDS:
            continue
        if tl.endswith("이며") or tl.endswith("이다"):
            continue
        if t not in found:
            found.append(t)
        if len(found) >= max_keywords:
            break

    return found[:max_keywords]


def bootstrap_gold(source_items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    output = []

    for item in source_items:
        text = join_source_text(item)
        topic = infer_topic(text)
        tech_stack = infer_tech_stack(text)
        keywords = infer_keywords(text, topic, tech_stack)

        output.append({
            "project_id": item["project_id"],
            "title": item["title"],
            "repo_url": item.get("repo_url"),
            "input": item.get("input", {}),
            "gold": {
                "topic": topic,
                "tech_stack": tech_stack,
                "keywords": keywords,
            }
        })

    return output


def main():
    source_items = load_json(SOURCE_PATH)
    gold_items = bootstrap_gold(source_items)
    save_json(OUTPUT_PATH, gold_items)
    print(f"saved: {OUTPUT_PATH}")
    print(f"count: {len(gold_items)}")


if __name__ == "__main__":
    main()