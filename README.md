# Power Series Labs

Host-neutral static Power Series lab catalog generated from the approved columns `I:T` in `PowerSeries_Lab_Tracker.xlsx`.

The same files deploy unchanged to local preview, VibeHub, or GitHub Pages. Runtime assets and catalog requests use relative paths; there are no host-specific APIs or source variants.

## Refresh catalog data

```powershell
python .\scripts\export_catalog.py "$HOME\OneDrive - Microsoft\PowerSeries_Lab_Tracker.xlsx"
```

The exporter writes `data/labs.json`, uses `Proposed Catalog Title` before `Catalog Title`, splits semicolon-delimited business needs/products into arrays, and rejects duplicate Lab IDs.

## Preview locally

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to VibeHub

Deploy this folder as a static site with `index.html` as the entry point. No source edits or VibeHub-specific build are required.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. In repository settings, open **Pages** and set **Source** to **GitHub Actions**.
3. The included workflow deploys the static site after each push to `main`.

Only the catalog-facing JSON is used by the page. Retired and hidden records remain in JSON for traceability but are excluded from the visible catalog.
