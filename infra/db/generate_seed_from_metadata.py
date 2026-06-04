import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

JSON_PATH = BASE_DIR / "ai-service" / "dataset" / "metadata" / "project_metadata_records_100.json"
OUTPUT_SQL = BASE_DIR / "infra" / "db" / "generated_seed_from_metadata.sql"


def sql_text(value):
    if value is None:
        return "NULL"

    value = str(value)
    value = value.replace("'", "''")
    return f"'{value}'"


def short_text(value, limit):
    if not value:
        return ""
    value = str(value).replace("\x00", "")
    if len(value) > limit:
        return value[:limit]
    return value


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        records = json.load(f)

    lines = []
    lines.append("-- Generated from ai-service/dataset/metadata/project_metadata_records_100.json")
    lines.append("-- JSON metadata seed data for local PostgreSQL test")
    lines.append("")

    for idx, record in enumerate(records[:100], start=1):
        source = record.get("source", {})

        project_key = record.get("project_id", f"unknown/project-{idx}")
        title = short_text(source.get("repo_name") or project_key.split("/")[-1], 255)
        summary = short_text(source.get("repo_description") or "", 1000)
        description = short_text(source.get("repo_description") or "", 3000)
        readme = short_text(source.get("readme") or "", 8000)
        language = short_text(source.get("repo_language") or "Unknown", 100)
        repo_url = source.get("repo_url") or ""
        storage_key = f"metadata/{project_key.replace('/', '_')}.json"

        vector_value = round(0.001 * idx, 6)

        lines.append(f"""
INSERT INTO projects (
    title,
    summary,
    description,
    readme,
    project_year,
    semester,
    difficulty,
    domain,
    is_team,
    status,
    visibility,
    author_id,
    created_at,
    updated_at
)
SELECT
    {sql_text(title)},
    {sql_text(summary)},
    {sql_text(description)},
    {sql_text(readme)},
    2026,
    '1학기',
    'MEDIUM',
    {sql_text(language)},
    TRUE,
    'APPROVED',
    'PUBLIC',
    1,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE title = {sql_text(title)}
);
""")

        lines.append(f"""
INSERT INTO project_tech_stack (project_id, tech_stack)
SELECT p.id, {sql_text(language)}
FROM projects p
WHERE p.title = {sql_text(title)}
AND NOT EXISTS (
    SELECT 1
    FROM project_tech_stack pts
    WHERE pts.project_id = p.id
    AND pts.tech_stack = {sql_text(language)}
);
""")

        lines.append(f"""
INSERT INTO project_files (
    file_name,
    file_type,
    size,
    storage_key,
    uploaded_at,
    project_id
)
SELECT
    {sql_text(title + "-metadata.json")},
    'JSON',
    0,
    {sql_text(storage_key)},
    NOW(),
    p.id
FROM projects p
WHERE p.title = {sql_text(title)}
ON CONFLICT (storage_key) DO NOTHING;
""")

        metadata_json = json.dumps(
            {
                "project_id": project_key,
                "repo_url": repo_url,
                "repo_name": title,
                "language": language,
            },
            ensure_ascii=False,
        )

        lines.append(f"""
INSERT INTO project_vectors (
    project_id,
    embedding,
    metadata
)
SELECT
    p.id,
    ('[' || array_to_string(array_fill({vector_value}::float, ARRAY[384]), ',') || ']')::vector,
    {sql_text(metadata_json)}::jsonb
FROM projects p
WHERE p.title = {sql_text(title)}
ON CONFLICT (project_id) DO NOTHING;
""")

    OUTPUT_SQL.write_text("\n".join(lines), encoding="utf-8")
    print(f"generated: {OUTPUT_SQL}")
    print(f"records: {min(len(records), 100)}")


if __name__ == "__main__":
    main()