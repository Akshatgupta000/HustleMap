# HustleMap Stopwatch Worksheet: Manual vs. Extension Job Entry

Use this worksheet to time yourself entering 10 real job postings into HustleMap using **Method A (Manual Form)** versus **Method B (Chrome Extension)**.

---

## Instructions

1. Open 10 actual job postings on LinkedIn, Indeed, or Glassdoor in separate tabs.
2. Prepare your stopwatch (on your phone or browser).
3. **Round 1 (Manual Entry)**:
   - Go to `http://localhost:5173/jobs/new` (or deployed app).
   - Start stopwatch.
   - For each job, copy-paste Company, Job Title, Location, Application Type, Status, Date Applied, Job URL, Notes.
   - Click "Add Job".
   - Record split time for each job in the table below.
4. **Round 2 (Extension Entry)**:
   - Navigate to each of the 10 job postings.
   - Click the HustleMap Chrome extension icon -> "Save Job" (or click "Confirm Save" in preview).
   - Record split time for each job in the table below.
5. Run the calculation script with your totals:
   ```bash
   node benchmarks/calculate_time_saved.js --manual=<YOUR_TOTAL_MANUAL_SEC> --ext=<YOUR_TOTAL_EXT_SEC>
   ```

---

## 10-Job Stopwatch Timing Table

| Job # | Job Source (LinkedIn/Indeed/Glassdoor) | Manual Entry Time (seconds) | Extension Save Time (seconds) | Delta Saved (seconds) | Notes / Observations |
| :---: | :------------------------------------ | :-------------------------: | :---------------------------: | :-------------------: | :------------------- |
| **1** | [e.g. LinkedIn - Software Engineer]   | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **2** | [e.g. Indeed - Frontend Dev]          | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **3** | [e.g. Glassdoor - Fullstack SWE]      | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **4** | [e.g. LinkedIn - Backend Dev]         | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **5** | [e.g. Indeed - Platform Engineer]     | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **6** | [e.g. LinkedIn - Systems Engineer]    | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **7** | [e.g. Glassdoor - DevOps Engineer]    | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **8** | [e.g. Indeed - Cloud Architect]       | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **9** | [e.g. LinkedIn - Site Reliability]    | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **10**| [e.g. LinkedIn - Data Engineer]       | `[   ]` s                   | `[   ]` s                     | `[   ]` s             |                      |
| **SUM**| **TOTAL TIME (10 JOBS)**             | `[  T_manual  ]` s          | `[   T_ext    ]` s            | `[ T_diff  ]` s       |                      |
| **AVG**| **AVERAGE TIME PER JOB**             | `[  Avg_manual ]` s/job     | `[   Avg_ext  ]` s/job        | `[ Avg_diff ]` s/job  |                      |

---

## Formula for Calculation

$$\text{Time Saved (\%)} = \frac{T_{\text{manual}} - T_{\text{extension}}}{T_{\text{manual}}} \times 100\%$$

$$\text{Speedup Factor} = \frac{T_{\text{manual}}}{T_{\text{extension}}}$$

### Example Baseline Trial (Reference)
- **Manual 10 Jobs**: 450 seconds total (45.0 s/job)
- **Extension 10 Jobs**: 32 seconds total (3.2 s/job)
- **Time Saved**: $\frac{450 - 32}{450} \times 100\% = 92.89\%$
- **Speedup**: $\frac{450}{32} \approx 14.1\times$ faster
