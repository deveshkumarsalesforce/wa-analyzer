# WA Log Analyzer

A web application for analyzing **Web Adapter (WA)** log files from **Salesforce Commerce Cloud** (formerly Demandware). Upload pipe-delimited WA logs to explore traffic, performance, cache behavior, and request drilldown—all in the browser (or in a Mac app) with no data sent to a server.

---

## Two ways to run

| | **Download Mac app** | **Run from source (npm)** |
|---|----------------------|----------------------------|
| **Best for** | Mac users; no dev setup | Windows users, or anyone who wants to run in the browser / change code |
| **Requirements** | Mac (Apple Silicon). No Node, no git. | Node.js 18+, npm. Git (or download repo as ZIP). |
| **Steps** | Download the DMG from [Releases](#releases), open it, drag the app to Applications, then launch **WA Log Analyzer**. | Clone the repo (or download ZIP), `npm install`, `npm run dev`, then open http://localhost:5173 in your browser. |

**Windows users:** There is no pre-built Windows app. Use the [Run from source](#option-2-run-from-source-npm) option below to run the app in your browser—same features, same local processing.

---

## Releases

Pre-built Mac apps are published as **GitHub Releases**.

1. Open the [Releases](https://github.com/deveshkumarsalesforce/wa-analyzer/releases) page for this repo.
2. Pick the latest release (e.g. **v1.0.0**).
3. Under **Assets**, download:
   - **WA Log Analyzer-1.0.0-arm64.dmg** — for Apple Silicon Macs (recommended). Double-click the DMG, drag **WA Log Analyzer** to Applications, then open the app from Applications or Spotlight.
   - **WA Log Analyzer-1.0.0-arm64-mac.zip** — alternative: unzip and double-click **WA Log Analyzer.app**.

No code checkout or `npm` required. The app runs offline; use **New Upload** or drag a WA log file into the window to analyze.

*If you don’t see a release yet, use the [Run from source](#option-2-run-from-source-npm) option below, or create a release and attach the DMG from the `release/` folder after running `npm run build:app`.*

---

## Option 1: Download Mac app (DMG)

1. Go to [Releases](https://github.com/deveshkumarsalesforce/wa-analyzer/releases) and download the latest **DMG** (or ZIP) from Assets.
2. **DMG:** Double-click the DMG file → drag **WA Log Analyzer** to **Applications** → open **WA Log Analyzer** from Applications or Spotlight.
3. **ZIP:** Unzip the downloaded file → double-click **WA Log Analyzer.app**.
4. In the app, click **New Upload** or drag a WA log file onto the window to load and analyze it.

**Note:** The provided build is **Apple Silicon (arm64)**. On first launch, if macOS says the app is from an unidentified developer, right-click the app → **Open** → confirm **Open** in the dialog.

---

## Option 2: Run from source (npm) — Mac, Windows, Linux

Use this if you’re on **Windows**, or if you prefer to run in the browser or modify the code.

### Step 1: Install Node.js

- **Windows / Mac / Linux:** Download and install the **LTS** version from [nodejs.org](https://nodejs.org). This includes `npm`.

### Step 2: Get the repo

**Option A — with Git:**

```bash
git clone https://github.com/deveshkumarsalesforce/wa-analyzer.git
cd wa-analyzer
```

**Option B — without Git (e.g. Windows):**

1. Open [github.com/deveshkumarsalesforce/wa-analyzer](https://github.com/deveshkumarsalesforce/wa-analyzer), click **Code** → **Download ZIP**.
2. Unzip the folder and open a terminal in that folder (e.g. in File Explorer, shift+right-click the folder → **Open PowerShell window here**).

### Step 3: Install and run

```bash
npm install
npm run dev
```

### Step 4: Open the app

In your browser, go to [http://localhost:5173](http://localhost:5173). Use **New Upload** or drag a WA log file onto the page to analyze. All processing stays on your machine.

---

**Windows shortcut:** After Step 2 (ZIP or clone), open Command Prompt or PowerShell in the project folder, run `npm install` then `npm run dev`, then open http://localhost:5173 in Chrome or Edge.

**Build Mac app (optional, Mac only):** To create a new release or run as a desktop app on Mac:

```bash
npm run build:app
```

Output is in the `release/` folder:

- `release/mac-arm64/WA Log Analyzer.app` — the app bundle
- `release/WA Log Analyzer-1.0.0-arm64.dmg` — DMG installer (attach this to a GitHub Release)
- `release/WA Log Analyzer-1.0.0-arm64-mac.zip` — zipped app

---

## What the app does

- **Analysis** — KPIs (total requests, unique sessions, unique IPs, cache hit rate, error rate), charts (slowest pages, traffic by hour, status codes, cache performance), runtime percentiles, and a table of the slowest requests.
- **Request Drilldown** — Main requests (level-0) with include counts; expand any row to see its includes and timing.
- **URL Analysis** — Top URLs by request count and by average runtime.
- **SQL Explorer** — Run simple queries against the loaded data (e.g. `SELECT * FROM wa_logs ORDER BY runtime_ms DESC LIMIT 100`). Click schema columns to insert into the query.
- **Save report as PDF** — After loading a log and viewing reports, use **Save report as PDF** to download all analysis, drilldown, and URL data as a multi-page PDF. No need to re-upload the log to review the report later. Available in both the Mac app and the browser (npm) version.

All processing is client-side; your log data never leaves your machine.

---

## Supported log format

The app expects **pipe-delimited** WA logs (one line per request, fields separated by `|`), as produced by Salesforce Commerce Cloud / Demandware Web Adapter.

- Skip lines that don’t look like log entries (e.g. “Opening up …”).
- Accepted file extensions: `.log`, `.json`, `.jsonl` (pipe-delimited content is detected and parsed).

Main requests are identified by `request_id` ending with `-0-00`. Cache is inferred from `response_source` (`pc` = page cache HIT).

---

## Using the app (both options)

1. **Load a log file** — Drag and drop a WA log file onto the upload area, or click **New Upload** and choose a file.
2. **Tabs** — Use **Analysis**, **Request Drilldown**, **URL Analysis**, and **SQL Explorer** to explore the data.
3. **Save report as PDF** — Click **Save report as PDF** (green button) to download a PDF of all reports. Use it to share or review later without re-uploading.
4. **Clear or replace** — **Clear Memory** removes loaded data; **New Upload** loads another file (replaces current data).

A sample file `wa-log-sample.log` is included in the repo for testing.

---

## Scripts (when running from source)

| Command | Description |
|--------|-------------|
| `npm run dev` | Start development server (http://localhost:5173) |
| `npm run build` | Production build (output in `dist/`) |
| `npm run build:app` | Build web app, then package as Mac .app + DMG + ZIP (output in `release/`) |
| `npm run app` | Run the app in Electron (after `npm run build`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## Tech stack

- **React 18** + **TypeScript** · **Vite** · **Recharts** · **Electron** (Mac app)
- No backend; runs entirely in the browser or in the desktop app.

---

## Data and privacy

- Data is kept only in memory and is lost when you close the tab or app.
- No log content is sent to any server; parsing and analysis happen locally.

---

## License

Use and modify as needed for your project. Check the repo for any added license file.
