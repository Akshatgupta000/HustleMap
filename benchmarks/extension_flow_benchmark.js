/**
 * HustleMap Extension Flow Performance Benchmark
 * Measures end-to-end latency from extension "Save" click to MongoDB persistence,
 * testing 30 requests per run across 5 complete runs (150 total extension saves).
 * Analyzes field count comparison: auto-captured fields vs manual form fields.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = process.env.API_BASE || 'http://localhost:5001';
const REQUESTS_PER_RUN = 30;
const RUNS_COUNT = 5;

// Base64 placeholder screenshot representing a cropped viewport snippet
const SAMPLE_SCREENSHOT_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function calculateStats(latencies) {
  if (!latencies.length) return { min: 0, max: 0, avg: 0, median: 0, p95: 0, stdDev: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = sum / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);
  return { min, max, avg, median, p95, stdDev };
}

async function runExtensionBenchmark() {
  console.log('======================================================================');
  console.log('       HUSTLEMAP EXTENSION FLOW BENCHMARK (30 REQS x 5 RUNS)         ');
  console.log(`Target: ${API_BASE} | Requests/Run: ${REQUESTS_PER_RUN} | Runs: ${RUNS_COUNT}`);
  console.log('======================================================================\n');

  // 1. Create a benchmark test user
  const timestamp = Date.now();
  const testUser = {
    name: `Ext Tester ${timestamp}`,
    email: `ext_${timestamp}@benchmark.local`,
    password: 'BenchmarkPassword123!',
  };

  console.log(`[AUTH] Registering extension test user: ${testUser.email}...`);
  const regRes = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });

  if (!regRes.ok) {
    const errText = await regRes.text();
    throw new Error(`Failed to register test user: ${regRes.status} ${errText}`);
  }

  const regData = await regRes.json();
  const token = regData.token;
  const userId = regData.user?.id || regData.user?._id;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log(`[AUTH] Authenticated successfully. User ID (extensionId): ${userId}\n`);

  // 2. Field Count Comparison
  const autoCapturedFields = [
    'jobTitle',       // Extracted from page h1 / selector
    'company',        // Extracted from page company selector
    'location',       // Cleaned location string
    'salary',         // Regex parsed salary pattern
    'description',    // Full job text / description container
    'jobUrl',         // Current tab window.location.href
    'companyLogo',    // Image selector src
    'source',         // LinkedIn, Indeed, Glassdoor
    'screenshot',     // User crop rectangle base64 data
  ];

  const manualFormFields = [
    'company',               // Required text
    'position',              // Required text
    'location',              // Optional text
    'application_type',      // Required select (on_campus / off_campus)
    'status',                // Required select (applied, online_test, interview, offer, rejected)
    'date_applied',          // Required date
    'job_url',               // Optional URL
    'interview_date',        // Optional date
    'resume_link',           // Optional URL
    'portfolio_link',        // Optional URL
    'notes',                 // Optional textarea
  ];

  const manualInterviewHubFields = [
    'interview_rounds',      // Array of { round, date }
    'interview_questions',   // Array of { round, question, notes_or_answer }
    'preparation_notes',     // Textarea
    'interview_difficulty',  // Rating / number
  ];

  console.log('----------------------------------------------------------------------');
  console.log('FIELD COUNT AUDIT & AUTOMATION COMPARISON');
  console.log('----------------------------------------------------------------------');
  console.log(`• Auto-captured by Extension: ${autoCapturedFields.length} fields`);
  console.log(`  -> [${autoCapturedFields.join(', ')}]`);
  console.log(`• Manual Form Direct Fields:  ${manualFormFields.length} fields`);
  console.log(`  -> [${manualFormFields.join(', ')}]`);
  console.log(`• Manual Form With Prep Hub:  ${manualFormFields.length + manualInterviewHubFields.length} fields`);
  console.log(`• Quick Add Form Fields:      4 fields (company, position, status, date_applied)`);
  console.log('----------------------------------------------------------------------\n');

  // 3. Execution of 5 runs
  const runResults = [];

  for (let run = 1; run <= RUNS_COUNT; run++) {
    console.log(`>>> STARTING EXTENSION FLOW RUN ${run} OF ${RUNS_COUNT} (${REQUESTS_PER_RUN} requests)`);
    const latencies = [];

    for (let i = 1; i <= REQUESTS_PER_RUN; i++) {
      const payload = {
        extensionId: userId,
        screenshot: SAMPLE_SCREENSHOT_BASE64,
        source: i % 3 === 0 ? 'linkedin' : i % 3 === 1 ? 'indeed' : 'glassdoor',
        url: `https://www.${i % 3 === 0 ? 'linkedin' : i % 3 === 1 ? 'indeed' : 'glassdoor'}.com/jobs/view/ext-${run}-${i}`,
        jobTitle: `Staff Performance Engineer #${run}-${i}`,
        company: `Automated Systems Inc #${run}-${i}`,
        location: 'San Francisco, CA (Hybrid)',
        description: 'Lead benchmarking, load testing, and performance instrumentation for high-scale distributed systems.',
      };

      const t0 = performance.now();
      const res = await fetch(`${API_BASE}/api/jobs/save-from-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const t1 = performance.now();

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Extension save #${i} failed with status ${res.status}: ${errText}`);
      }
      await res.json();
      latencies.push(t1 - t0);
    }

    const stats = calculateStats(latencies);
    console.log(`  Run ${run} Complete: Avg: ${stats.avg.toFixed(2)}ms | Min: ${stats.min.toFixed(2)}ms | Max: ${stats.max.toFixed(2)}ms | Median: ${stats.median.toFixed(2)}ms\n`);

    runResults.push({
      run,
      stats,
      latencies,
    });
  }

  // Aggregate across all 150 requests
  const allLatencies = runResults.flatMap((r) => r.latencies);
  const overallStats = calculateStats(allLatencies);

  console.log('======================================================================');
  console.log('        EXTENSION SAVE LATENCY SUMMARY (150 TOTAL REQUESTS)           ');
  console.log('======================================================================');
  console.log(`• Total Requests Measured: ${allLatencies.length}`);
  console.log(`• Average Save Latency:    ${overallStats.avg.toFixed(2)} ms`);
  console.log(`• Minimum Save Latency:    ${overallStats.min.toFixed(2)} ms`);
  console.log(`• Maximum Save Latency:    ${overallStats.max.toFixed(2)} ms`);
  console.log(`• Median Save Latency:     ${overallStats.median.toFixed(2)} ms`);
  console.log(`• p95 Save Latency:        ${overallStats.p95.toFixed(2)} ms`);
  console.log(`• Standard Deviation:      ${overallStats.stdDev.toFixed(2)} ms`);
  console.log('======================================================================\n');

  // Clean up test jobs
  console.log('[CLEANUP] Removing test jobs created during extension benchmark...');
  await fetch(`${API_BASE}/api/jobs/captured`, {
    method: 'DELETE',
    headers: authHeaders,
  }).catch(() => {});
  await fetch(`${API_BASE}/api/jobs`, {
    method: 'DELETE',
    headers: authHeaders,
  }).catch(() => {});
  console.log('[CLEANUP] Done.\n');

  const outputData = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    requestsPerRun: REQUESTS_PER_RUN,
    runsCount: RUNS_COUNT,
    autoCapturedFields,
    manualFormFields,
    manualInterviewHubFields,
    overallStats,
    runResults,
  };

  fs.writeFileSync(
    path.join(__dirname, 'raw_extension_flow.json'),
    JSON.stringify(outputData, null, 2),
    'utf8'
  );
  console.log(`Raw extension flow data successfully written to ./benchmarks/raw_extension_flow.json\n`);

  return outputData;
}

runExtensionBenchmark().catch((err) => {
  console.error('Extension benchmark failed:', err);
  process.exit(1);
});
