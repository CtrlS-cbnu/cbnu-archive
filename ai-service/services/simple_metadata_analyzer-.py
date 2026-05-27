from __future__ import annotations

import re
import json
from dataclasses import dataclass


@dataclass
class SimpleMetadataResult:
    title: str
    summary: str
    language: str | None
    keywords: list[str]


class SimpleMetadataAnalyzer:
    def extract_title(self, repo_name: str, readme: str) -> str:
        if repo_name and repo_name.strip():
            return repo_name.strip()

        match = re.search(r"^#\s+(.+)$", readme, re.MULTILINE)
        if match:
            return match.group(1).strip()

        return "unknown"

    def extract_summary(self, readme: str, fallback_description: str = "") -> str:
        text = readme.strip()
        text = re.sub(r"^#.*$", "", text, flags=re.MULTILINE).strip()

        lines = []
        for line in text.splitlines():
            s = line.strip()
            if not s:
                continue
            if s.startswith("![") or s.startswith("[!["):
                continue
            if s.startswith(">"):
                continue
            lines.append(s)

        cleaned = " ".join(lines)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        sentences = re.split(r"(?<=[.!?])\s+", cleaned)
        summary = " ".join(sentences[:2]).strip()

        if not summary:
            summary = fallback_description.strip()

        return summary[:300].strip()

    def extract_language(
        self,
        readme: str,
        repo_language: str | None = None,
        file_names: list[str] | None = None,
        config_texts: dict[str, str] | None = None,
    ) -> str | None:
        if repo_language:
            return repo_language

        file_names = file_names or []
        config_texts = config_texts or {}
        scores: dict[str, int] = {}

        def add(lang: str, score: int):
            scores[lang] = scores.get(lang, 0) + score

        config_keys = set(config_texts.keys())

        if "requirements.txt" in config_keys or "pyproject.toml" in config_keys:
            add("Python", 5)
        if "pom.xml" in config_keys or "build.gradle" in config_keys:
            add("Java", 5)
        if "package.json" in config_keys:
            add("JavaScript", 4)
        if "Cargo.toml" in config_keys:
            add("Rust", 5)
        if "go.mod" in config_keys:
            add("Go", 5)

        for name in file_names:
            lower = name.lower()
            if lower.endswith(".py"):
                add("Python", 2)
            elif lower.endswith(".java"):
                add("Java", 2)
            elif lower.endswith(".ts") or lower.endswith(".tsx"):
                add("TypeScript", 2)
            elif lower.endswith(".js") or lower.endswith(".jsx"):
                add("JavaScript", 2)
            elif lower.endswith(".go"):
                add("Go", 2)
            elif lower.endswith(".rs"):
                add("Rust", 2)
            elif lower.endswith(".kt"):
                add("Kotlin", 2)
            elif lower.endswith(".swift"):
                add("Swift", 2)
            elif lower.endswith(".cpp") or lower.endswith(".cc") or lower.endswith(".cxx"):
                add("C++", 2)
            elif lower.endswith(".c"):
                add("C", 2)

        if not scores:
            return None

        return sorted(scores.items(), key=lambda x: (-x[1], x[0]))[0][0]

    def extract_keywords(
        self,
        repo_name: str = "",
        repo_description: str = "",
        readme: str = "",
        repo_topics: list[str] | None = None,
        config_texts: dict[str, str] | None = None,
        max_keywords: int = 3,
    ) -> list[str]:


        repo_topics = repo_topics or []
        config_texts = config_texts or {}

        # README는 앞부분만 사용
        readme_head = "\n".join(readme.splitlines()[:50])

        # markdown / badge / link / html noise 제거
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

        # 1) 강한 repo_topics 먼저
        for topic in repo_topics:
            t = topic.strip().lower()
            if not t or t in weak_topics:
                continue
            if t not in found:
                found.append(t)

        # 2) description / README 앞부분에서 phrase 우선 추출
        for phrase in important_phrases:
            if phrase in focus_text or phrase in readme_text:
                if phrase not in found:
                    found.append(phrase)

        # 3) description에서 일반 토큰 추출
        tokens = re.findall(r"[A-Za-z][A-Za-z0-9\-\+]{2,30}", focus_text)
        for tok in tokens:
            if tok in stopwords:
                continue
            if tok not in found:
                found.append(tok)

        # 4) config에서 기술 키워드 1개만 보조
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

        # 5) repo_name 토큰은 마지막 보정
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

    def analyze(
        self,
        repo_name: str,
        readme: str,
        repo_description: str = "",
        repo_language: str | None = None,
        file_names: list[str] | None = None,
        repo_topics: list[str] | None = None,
        config_texts: dict[str, str] | None = None,
    ) -> SimpleMetadataResult:
        title = self.extract_title(repo_name, readme)
        summary = self.extract_summary(readme, repo_description)
        language = self.extract_language(
            readme=readme,
            repo_language=repo_language,
            file_names=file_names,
            config_texts=config_texts,
        )
        keywords = self.extract_keywords( repo_name=repo_name,
        repo_description=repo_description,
        readme=readme,
        repo_topics=repo_topics,
        config_texts=config_texts,
        max_keywords=5,)

        return SimpleMetadataResult(
            title=title,
            summary=summary,
            language=language,
            keywords=keywords,
        )