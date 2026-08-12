import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


SOURCE_COLUMNS = [
    "Lab ID",
    "Duration",
    "Lab Type",
    "Level",
    "Repo Link",
    "Proposed Catalog Title",
    "Catalog Title",
    "Description",
    "Business Need",
    "Product",
    "GitHub Copilot Flag",
    "Catalog Display",
]


def text(value):
    return "" if pd.isna(value) else str(value).strip()


def values(value):
    return [item.strip() for item in text(value).split(";") if item.strip()]


def flag(value):
    return text(value).lower() in {"1", "true", "yes", "y"}


def export_catalog(source_path):
    source = Path(source_path)
    frame = pd.read_excel(source, sheet_name="Lab Tracker", usecols="I:T", dtype=object)
    frame = frame[frame["Lab ID"].notna()].copy()
    frame["Lab ID"] = frame["Lab ID"].map(text)

    duplicates = frame.loc[frame["Lab ID"].duplicated(), "Lab ID"].tolist()
    if duplicates:
        raise ValueError(f"Duplicate Lab IDs: {', '.join(duplicates)}")

    labs = []
    for _, row in frame.iterrows():
        proposed_title = text(row["Proposed Catalog Title"])
        catalog_title = text(row["Catalog Title"])
        labs.append({
            "id": text(row["Lab ID"]),
            "duration": text(row["Duration"]),
            "type": text(row["Lab Type"]),
            "level": text(row["Level"]),
            "url": text(row["Repo Link"]),
            "proposedTitle": proposed_title,
            "catalogTitle": catalog_title,
            "description": text(row["Description"]),
            "businessNeeds": values(row["Business Need"]),
            "products": values(row["Product"]),
            "requiresGitHubCopilot": flag(row["GitHub Copilot Flag"]),
            "display": text(row["Catalog Display"]),
            "title": proposed_title or catalog_title,
        })

    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceColumns": SOURCE_COLUMNS,
        "labs": labs,
    }
    output = Path(__file__).resolve().parents[1] / "data" / "labs.json"
    output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Exported {len(labs)} labs to {output}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python export_catalog.py <workbook.xlsx>")
    export_catalog(sys.argv[1])