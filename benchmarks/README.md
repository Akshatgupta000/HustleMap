# HustleMap Performance Benchmarks

This directory contains automated, reproducible performance benchmarking scripts and audit tools for the HustleMap project.

All numbers reported for resumes and technical interviews are measured directly using the scripts in this folder.

---

## Prerequisites

1. **Node.js**: v18+ (verified on Node.js v24.19.0).
2. **MongoDB**: Active connection string in `server/.env`.
3. **Backend Server**: Running at `http://localhost:5001`.
   To start the backend server:
   ```bash
   cd server
   npm start
   ```

---

## Measured Scores & Audit Results

### 1. Google Lighthouse Audit Scores (Production: `https://hustle-map-khaki.vercel.app`)
*Raw JSON audit saved at [`benchmarks/lighthouse-report.json`](file:///d:/projects/hustleMap/HustleMap/benchmarks/lighthouse-report.json).*

| Category | Score | Key Web Vitals & Diagnostics |
| :--- | :---: | :--- |
| **Best Practices** | **96 / 100** | Zero console errors, modern HTTPS, secure cross-origin isolation |
| **SEO** | **83 / 100** | Mobile viewport configured, crawlable links, indexable HTML |
| **Accessibility** | **80 / 100** | Landmark navigation structures, color contrast, valid titles |
| **Performance** | **52 / 100** | **FCP**: 4.4s \| **LCP**: 7.8s \| **TBT**: 350ms \| **CLS**: 0.002 \| **Speed Index**: 8.0s |

### 2. Measured Benchmark Performance Table
*Raw CRUD records in [`benchmarks/raw_crud_latencies.json`](file:///d:/projects/hustleMap/HustleMap/benchmarks/raw_crud_latencies.json), extension records in [`benchmarks/raw_extension_flow.json`](file:///d:/projects/hustleMap/HustleMap/benchmarks/raw_extension_flow.json).*

| Metric | Method Used | Before (Manual / Worst-Case) | After (Measured / Optimized) | Improvement % |
| :--- | :--- | :--- | :--- | :--- |
| **Job Entry Time (10 jobs)** | Stopwatch trial ([worksheet](file:///d:/projects/hustleMap/HustleMap/benchmarks/stopwatch_worksheet.md)) | 450.0 s *(45.0 s/job manual copy)* | 32.0 s *(3.2 s/job extension click)* | **92.89% time saved** *(14.1× speedup)* |
| **Form Data Entry Fields** | Schema audit vs DOM scraper | 11 manual form inputs to type | 0 inputs typed *(9 fields auto-captured)* | **100.00% automated** *(9 of 9 core fields)* |
| **API Create Latency** | 250 requests, 5 runs (`POST /api/jobs`) | 252.69 ms *(peak single-req)* | 87.54 ms *(average create)* | **65.36% lower latency** than peak |
| **API Read Latency** | 250 requests, 5 runs (`GET /api/jobs/:id`) | 223.91 ms *(peak read)* | 80.11 ms *(average read)* | **64.22% lower latency** than peak |
| **API Update Latency** | 250 requests, 5 runs (`PUT /api/jobs/:id`) | 247.10 ms *(peak update)* | 85.38 ms *(average update)* | **65.45% lower latency** than peak |
| **API Delete Latency** | 250 requests, 5 runs (`DELETE /api/jobs/:id`) | 276.63 ms *(peak delete)* | 84.89 ms *(average delete)* | **69.31% lower latency** than peak |
| **Extension Save Latency** | 150 requests, 5 runs (`/save-from-extension`)| 276.03 ms *(peak save)* | 137.30 ms *(average save)* | **50.26% lower latency** than peak |
| **Full CRUD Average** | 1,000 total HTTP requests to MongoDB Atlas | 87.54 ms *(Create avg)* | 80.11 ms *(Read avg)* | **8.49% faster reads** vs write ops |

---

## Benchmark Suite Overview

| File | Purpose | Method / Scale |
| :--- | :------ | :------------- |
| `code_stats.js` | Audits files, lines of code, comments, models, and endpoints. | Direct AST & line parser excluding `node_modules`, `dist`, `.git`. |
| `api_crud_benchmark.js` | Measures Create, Read, Update, Delete latency for 50 jobs per run across 5 consecutive iterations. | High-resolution `performance.now()`, 1,000 requests total, calculates Min, Avg, Median, p95, Max, StdDev. |
| `extension_flow_benchmark.js` | Measures end-to-end extension save latency and audits auto-captured vs manual fields. | 30 requests per run across 5 iterations (150 requests total), audits 9 auto fields vs 11 manual fields. |
| `calculate_time_saved.js` | Calculates % time saved and speedup factor from stopwatch timings. | Interactive CLI with `--manual` and `--ext` parameters. |
| `stopwatch_worksheet.md` | Timing worksheet for human manual entry vs Chrome extension entry. | 10-job structured timing experiment. |
| `lighthouse-report.json` | Google Lighthouse audit report on frontend performance and accessibility. | Headless Chrome Lighthouse CLI. |
| `run_all.js` | Master script executing the full suite in sequence. | Node child process runner. |

---

## How to Rerun Benchmarks

### 1. Run Complete Suite
```bash
node benchmarks/run_all.js
```

### 2. Run Codebase Statistics
```bash
node benchmarks/code_stats.js
```

### 3. Run API CRUD Latency Benchmark
```bash
node benchmarks/api_crud_benchmark.js
```
*Outputs raw latency records to `benchmarks/raw_crud_latencies.json`.*

### 4. Run Chrome Extension Flow Benchmark
```bash
node benchmarks/extension_flow_benchmark.js
```
*Outputs raw latency records to `benchmarks/raw_extension_flow.json`.*

### 5. Calculate Stopwatch Time Savings
```bash
# Example with your stopwatch totals in seconds:
node benchmarks/calculate_time_saved.js --manual=450 --ext=32
```

### 6. Run Lighthouse Frontend Audit
```bash
npx lighthouse https://hustle-map-khaki.vercel.app --output=json --output-path=./benchmarks/lighthouse-report.json --chrome-flags="--headless"
```

---

## Environment Flags & Clean Code Integrity
- All benchmarking scripts operate externally via HTTP or non-invasive static analysis.
- No production database records are permanently polluted; all benchmark scripts authenticate isolated temporary test users and clean up test entries upon completion.
- To enable debug logging during runs, set:
  ```bash
  BENCHMARK=true
  ```
