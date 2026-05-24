from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "dataset" / "metadata"

SOURCE_PATH = DATA_DIR / "metadata_source.json"
OUTPUT_PATH = DATA_DIR / "metadata_gold_simple.json"

NOISY_PATTERNS = [
    r"^\[!\[.*?\]\(.*?\)\]\(.*?\)$",   # badge lines
    r"^!\[.*?\]\(.*?\)$",              # image lines
    r"^>.*$",                          # blockquote
    r"^\s*[-*]\s+\[.*?\]\(.*?\)\s*$",  # toc-like links
]

STOPWORDS = {
    "project", "projects", "repository", "readme", "codebase", "curriculum",
    "platform", "service", "system", "application", "applications",
    "framework", "features", "feature", "open", "source", "free",
    "community", "learn", "learning", "introduction", "overview", "license",
    "installation", "usage", "guide", "documentation", "docs",
    "using", "used", "support", "supports", "provides", "include", "includes",
    "based", "building", "development", "developer", "developers",
}

PHRASE_PATTERNS = [
    "machine learning",
    "deep learning",
    "computer science",
    "system design",
    "question answering",
    "natural language processing",
    "computer vision",
    "object detection",
    "image classification",
    "text classification",
    "document search",
    "code generation",
    "api development",
    "web development",
    "mobile development",
    "data analysis",
    "relational databases",
    "back-end development",
    "front-end development",
]

def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def clean_readme(text: str) -> str:
    lines = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            continue
        
        skip = False
        for pat in NOISY_PATTERNS:
            if re.match(pat, s):
                skip = True
                break
        if skip:
            continue
        if s.startswith("#"):
            s = re.sub(r"^#+\s*", "", s).strip()

        # markdown links -> text만 남김
        s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
        lines.append(s)

    cleaned = " ".join(lines)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def first_sentences(text: str, n: int = 3) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return " ".join(sentences[:n]).strip()

def extract_keywords(
    repo_name: str = "",
    repo_description: str = "",
    readme: str = "",
    repo_topics: list[str] | None = None,
    config_texts: dict[str, str] | None = None,
    max_keywords: int = 5,
) -> list[str]:
    import json
    import re

    repo_topics = repo_topics or []
    config_texts = config_texts or {}

    readme_head = "\n".join(readme.splitlines()[:50])

    cleaned = re.sub(r"!\[.*?\]\(.*?\)", " ", readme_head)
    cleaned = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", cleaned)
    cleaned = re.sub(r"`[^`]+`", " ", cleaned)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = re.sub(r"[#>*\-]+", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    focus_text = " ".join([
        repo_name or "",
        repo_description or "",
    ]).strip().lower()

    readme_text = cleaned.lower()

    weak_topics = {
        "community", "careers", "teachers", "nonprofits", "freecodecamp",
        "resources", "guide", "awesome", "opensource", "open-source", "d3"
    }

    stopwords = {
        "project", "projects", "repository", "codebase", "platform", "service",
        "application", "applications", "framework", "features", "feature",
        "support", "supports", "open", "source", "free", "learn", "learning",
        "introduction", "overview", "license", "installation", "usage", "guide",
        "documentation", "docs", "using", "used", "build", "development",
        "developer", "developers", "code", "software", "includes", "include",
        "programming", "math"
    }

    important_phrases = [
        "computer science",
        "machine learning",
        "deep learning",
        "system design",
        "design interview",
        "technical interview",
        "coding challenges",
        "interactive coding",
        "developer curriculum",
        "web development",
        "full-stack web development",
        "frontend development",
        "backend development",
        "data analysis",
        "question answering",
        "document search",
        "recommendation system",
        "computer vision",
        "natural language processing",
        "relational databases",
        "back-end development and apis",
    ]

    found: list[str] = []

    for topic in repo_topics:
        t = topic.strip().lower()
        if not t or t in weak_topics:
            continue
        if t not in found:
            found.append(t)

    for phrase in important_phrases:
        if phrase in focus_text or phrase in readme_text:
            if phrase not in found:
                found.append(phrase)

    tokens = re.findall(r"[A-Za-z][A-Za-z0-9\-\+]{2,30}", focus_text)
    for tok in tokens:
        if tok in stopwords:
            continue
        if tok not in found:
            found.append(tok)

    tech_candidates = []
    package_json = config_texts.get("package.json")
    if package_json:
        try:
            pkg = json.loads(package_json)
            deps = {}
            deps.update(pkg.get("dependencies", {}))
            deps.update(pkg.get("devDependencies", {}))

            preferred = [
                "react", "typescript", "javascript", "node", "gatsby",
                "prisma", "fastapi", "spring-boot"
            ]
            for dep in preferred:
                for key in deps.keys():
                    if dep in key.lower():
                        tech_candidates.append(dep)
                        break
        except Exception:
            pass

    if tech_candidates:
        tech = tech_candidates[0]
        if tech not in found:
            found.append(tech)

    title_tokens = re.findall(r"[A-Za-z][A-Za-z0-9\-\+]{2,30}", (repo_name or "").lower())
    for tok in title_tokens:
        if tok not in stopwords and tok not in found:
            found.insert(0, tok)

    final_keywords = []
    for kw in found:
        kw = kw.strip().lower()
        if not kw:
            continue
        if kw not in final_keywords:
            final_keywords.append(kw)

    return final_keywords[:max_keywords]

def build_summary(item: dict[str, Any]) -> str:
    inp = item.get("input", {})
    short_summary = (inp.get("short_summary") or "").strip()
    description = (inp.get("description") or "").strip()

    if short_summary:
        return short_summary
    if description:
        return description[:300].strip()
    return ""


def build_simple_gold_item(item: dict[str, Any]) -> dict[str, Any]:
    inp = item.get("input", {})
    repo_meta = item.get("repo_meta", {})

    repo_name = item.get("title", "") or ""
    short_summary = (inp.get("short_summary") or "").strip()
    repo_description = (inp.get("description") or "").strip() or short_summary
    readme = inp.get("readme", "") or ""
    file_names = inp.get("file_names", []) or []
    config_texts = inp.get("config_texts", {}) or {}
    repo_topics = repo_meta.get("topics", []) or []
    repo_language = repo_meta.get("language")

    keywords = extract_keywords(
        repo_name=repo_name,
        readme=readme,
        repo_description=repo_description,
        config_texts=config_texts,
        max_keywords=5,
    )

    return {
        "project_id": item.get("project_id"),
        "input": {
            "repo_name": repo_name,
            "repo_description": repo_description,
            "repo_language": repo_meta.get("language"),
            "readme": readme,
            "file_names": file_names,
            "config_texts": config_texts,
            "repo_topics": repo_topics,
        },
        "gold": {
            "title": repo_name,
            "summary": build_summary(item),
            "language": repo_meta.get("language"),
            "keywords": keywords,
        }
    }


def main():
    source_items = load_json(SOURCE_PATH)
    output = [build_simple_gold_item(item) for item in source_items]

    save_json(OUTPUT_PATH, output)
    print(f"saved: {OUTPUT_PATH}")
    print(f"count: {len(output)}")


if __name__ == "__main__":
    main()