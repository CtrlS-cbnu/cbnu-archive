from __future__ import annotations

import base64
import json
import os
import re
import time
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
DATASET_DIR = ROOT / "dataset" / "metadata"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


def gh_headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "cbnu-archive-metadata-builder",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def parse_repo_url(repo_url: str) -> tuple[str, str]:
    m = re.match(r"https?://github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$", repo_url)
    if not m:
        raise ValueError(f"Invalid GitHub repo URL: {repo_url}")
    return m.group(1), m.group(2)


def request_github(url: str, params: dict[str, Any] | None = None) -> requests.Response:
    r = requests.get(url, headers=gh_headers(), params=params, timeout=30)

    if r.status_code == 403:
        remaining = r.headers.get("X-RateLimit-Remaining")
        reset_time = r.headers.get("X-RateLimit-Reset")
        raise RuntimeError(
            f"GitHub API rate limit exceeded. Remaining={remaining}, Reset={reset_time}. "
            "Set GITHUB_TOKEN or reduce repo_urls.json size."
        )

    r.raise_for_status()
    return r


def get_repo_info(owner: str, repo: str) -> dict[str, Any]:
    url = f"https://api.github.com/repos/{owner}/{repo}"
    return request_github(url).json()


def get_readme(owner: str, repo: str) -> str:
    url = f"https://api.github.com/repos/{owner}/{repo}/readme"
    r = requests.get(url, headers=gh_headers(), timeout=30)
    if r.status_code == 404:
        return ""
    if r.status_code == 403:
        remaining = r.headers.get("X-RateLimit-Remaining")
        reset_time = r.headers.get("X-RateLimit-Reset")
        raise RuntimeError(
            f"GitHub API rate limit exceeded while reading README. "
            f"Remaining={remaining}, Reset={reset_time}."
        )
    r.raise_for_status()

    data = r.json()
    content = data.get("content", "")
    if not content:
        return ""
    return base64.b64decode(content).decode("utf-8", errors="ignore")


def get_tree(owner: str, repo: str, default_branch: str) -> list[dict[str, Any]]:
    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}"
    data = request_github(url, params={"recursive": "1"}).json()
    return data.get("tree", [])


def get_file_content(owner: str, repo: str, path: str) -> str:
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    r = requests.get(url, headers=gh_headers(), timeout=30)

    if r.status_code == 404:
        return ""

    if r.status_code == 403:
        remaining = r.headers.get("X-RateLimit-Remaining")
        reset_time = r.headers.get("X-RateLimit-Reset")
        raise RuntimeError(
            f"GitHub API rate limit exceeded while reading {path}. "
            f"Remaining={remaining}, Reset={reset_time}."
        )

    r.raise_for_status()
    data = r.json()
    content = data.get("content", "")
    if not content:
        return ""
    return base64.b64decode(content).decode("utf-8", errors="ignore")


def collect_configs(owner: str, repo: str) -> dict[str, str]:
    config_paths = [
        "requirements.txt",
        "pyproject.toml",
        "package.json",
        "pom.xml",
        "build.gradle",
        "Dockerfile",
    ]
    out: dict[str, str] = {}
    for path in config_paths:
        text = get_file_content(owner, repo, path)
        if text:
            out[path] = text
    return out


def infer_team_size(repo_info: dict[str, Any]) -> int | None:
    return None


def build_source_item(repo_url: str) -> dict[str, Any]:
    owner, repo = parse_repo_url(repo_url)

    repo_info = get_repo_info(owner, repo)
    default_branch = repo_info["default_branch"]

    readme = get_readme(owner, repo)
    tree = get_tree(owner, repo, default_branch)
    configs = collect_configs(owner, repo)

    file_names = [x["path"] for x in tree if x.get("type") == "blob"]
    folder_paths = [x["path"] for x in tree if x.get("type") == "tree"]

    return {
        "project_id": f"{owner}/{repo}",
        "title": repo_info["name"],
        "repo_url": repo_url,
        "input": {
            "short_summary": repo_info.get("description") or "",
            "description": repo_info.get("description") or "",
            "readme": readme,
            "report_text": "",
            "file_names": file_names[:300],
            "folder_paths": folder_paths[:200],
            "config_texts": configs,
            "course_name": "github_repo",
            "semester": "",
            "team_size": infer_team_size(repo_info),
        },
        "repo_meta": {
            "default_branch": default_branch,
            "language": repo_info.get("language"),
            "stargazers_count": repo_info.get("stargazers_count", 0),
            "topics": repo_info.get("topics", []),
            "private": repo_info.get("private", False),
        },
        "gold": {
            "topic": None,
            "tech_stack": [],
            "keywords": []
        }
    }


def main():
    repo_urls_path = DATASET_DIR / "repo_urls.json"
    repo_urls = json.loads(repo_urls_path.read_text(encoding="utf-8"))

    items = []
    for i, repo_url in enumerate(repo_urls, start=1):
        try:
            print(f"[{i}/{len(repo_urls)}] fetching: {repo_url}")
            items.append(build_source_item(repo_url))
            time.sleep(0.3)
        except Exception as e:
            print(f"failed: {repo_url} -> {e}")

    out_path = DATASET_DIR / "metadata_source.json"
    out_path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved: {out_path}")
    print(f"success: {len(items)} / {len(repo_urls)}")


if __name__ == "__main__":
    main()