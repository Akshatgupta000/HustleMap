/**
 * HustleMap API CRUD Performance Benchmark
 * Measures Create, Read, Update, Delete latency for 50 jobs per run across 5 complete iterations.
 * Uses high-resolution performance timers (performance.now()).
 * Writes raw outputs to ./benchmarks/raw_crud_latencies.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = process.env.API_BASE || 'http://localhost:5001';
const JOBS_COUNT = 50;
const RUNS_COUNT = 5;

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

async function runBenchmark() {
  console.log('======================================================================');
  console.log('          HUSTLEMAP REST API CRUD BENCHMARK (50 JOBS x 5 RUNS)         ');
  console.log(`Target: ${API_BASE} | Jobs/Run: ${JOBS_COUNT} | Total Runs: ${RUNS_COUNT}`);
  console.log('======================================================================\n');

  // 1. Create a benchmark test user
  const timestamp = Date.now();
  const testUser = {
    name: `Perf Tester ${timestamp}`,
    email: `perf_${timestamp}@benchmark.local`,
    password: 'BenchmarkPassword123!',
  };

  console.log(`[AUTH] Registering benchmark test user: ${testUser.email}...`);
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

  console.log(`[AUTH] Authenticated successfully. User ID: ${userId}\n`);

  const runResults = [];

  for (let run = 1; run <= RUNS_COUNT; run++) {
    console.log(`----------------------------------------------------------------------`);
    console.log(`>>> STARTING RUN ${run} OF ${RUNS_COUNT}`);
    console.log(`----------------------------------------------------------------------`);

    const createdJobIds = [];
    const createLatencies = [];
    const readLatencies = [];
    const updateLatencies = [];
    const deleteLatencies = [];

    // --- A. CREATE 50 JOBS ---
    process.stdout.write(`  [1/4] CREATE (50 jobs)... `);
    for (let i = 1; i <= JOBS_COUNT; i++) {
      const payload = {
        company: `Benchmark Corp ${run}-${i}`,
        position: `Systems Engineer Level ${i}`,
        location: `Remote, Node ${i % 5}`,
        status: 'applied',
        application_type: 'off_campus',
        date_applied: new Date().toISOString().split('T')[0],
        notes: `Benchmark automated record #${i} in run #${run}`,
      };

      const t0 = performance.now();
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const t1 = performance.now();

      if (!res.ok) {
        throw new Error(`Create job #${i} failed with status ${res.status}`);
      }
      const data = await res.json();
      createdJobIds.push(data.id || data._id);
      createLatencies.push(t1 - t0);
    }
    const createStats = calculateStats(createLatencies);
    console.log(`Done. Avg: ${createStats.avg.toFixed(2)}ms (Min: ${createStats.min.toFixed(2)}ms, Max: ${createStats.max.toFixed(2)}ms)`);

    // --- B. READ 50 JOBS ---
    process.stdout.write(`  [2/4] READ (50 individual jobs)... `);
    for (let i = 0; i < JOBS_COUNT; i++) {
      const jobId = createdJobIds[i];
      const t0 = performance.now();
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'GET',
        headers: authHeaders,
      });
      const t1 = performance.now();

      if (!res.ok) {
        throw new Error(`Read job #${jobId} failed with status ${res.status}`);
      }
      await res.json();
      readLatencies.push(t1 - t0);
    }
    const readStats = calculateStats(readLatencies);
    console.log(`Done. Avg: ${readStats.avg.toFixed(2)}ms (Min: ${readStats.min.toFixed(2)}ms, Max: ${readStats.max.toFixed(2)}ms)`);

    // --- C. UPDATE 50 JOBS ---
    process.stdout.write(`  [3/4] UPDATE (50 jobs)... `);
    for (let i = 0; i < JOBS_COUNT; i++) {
      const jobId = createdJobIds[i];
      const updatePayload = {
        company: `Benchmark Corp ${run}-${i + 1} (Updated)`,
        position: `Senior Systems Engineer Level ${i + 1}`,
        status: 'interview',
        date_applied: new Date().toISOString().split('T')[0],
        interview_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        notes: `Updated status to interview for test item ${i + 1}`,
      };

      const t0 = performance.now();
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updatePayload),
      });
      const t1 = performance.now();

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Update job #${jobId} failed with status ${res.status}: ${errText}`);
      }
      await res.json();
      updateLatencies.push(t1 - t0);
    }
    const updateStats = calculateStats(updateLatencies);
    console.log(`Done. Avg: ${updateStats.avg.toFixed(2)}ms (Min: ${updateStats.min.toFixed(2)}ms, Max: ${updateStats.max.toFixed(2)}ms)`);

    // --- D. DELETE 50 JOBS ---
    process.stdout.write(`  [4/4] DELETE (50 jobs)... `);
    for (let i = 0; i < JOBS_COUNT; i++) {
      const jobId = createdJobIds[i];
      const t0 = performance.now();
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const t1 = performance.now();

      if (!res.ok) {
        throw new Error(`Delete job #${jobId} failed with status ${res.status}`);
      }
      await res.json();
      deleteLatencies.push(t1 - t0);
    }
    const deleteStats = calculateStats(deleteLatencies);
    console.log(`Done. Avg: ${deleteStats.avg.toFixed(2)}ms (Min: ${deleteStats.min.toFixed(2)}ms, Max: ${deleteStats.max.toFixed(2)}ms)\n`);

    runResults.push({
      run,
      create: createStats,
      read: readStats,
      update: updateStats,
      delete: deleteStats,
      raw: {
        create: createLatencies,
        read: readLatencies,
        update: updateLatencies,
        delete: deleteLatencies,
      },
    });
  }

  // --- OVERALL AGGREGATION ACROSS ALL 5 RUNS (250 requests per operation) ---
  console.log('======================================================================');
  console.log('               OVERALL SUMMARY TABLE ACROSS ALL 5 RUNS                ');
  console.log('                (Total 250 requests per CRUD operation)               ');
  console.log('======================================================================');

  const operations = ['create', 'read', 'update', 'delete'];
  const summary = {};

  console.log('Operation | Min (ms) | Avg/Mean (ms) | Median (ms) | p95 (ms) | Max (ms) | StdDev');
  console.log('----------|----------|---------------|-------------|----------|----------|-------');

  for (const op of operations) {
    const allLatencies = runResults.flatMap((r) => r.raw[op]);
    const stats = calculateStats(allLatencies);
    summary[op] = stats;
    console.log(
      `${op.toUpperCase().padEnd(10)}| ${stats.min.toFixed(2).padStart(8)} | ${stats.avg.toFixed(2).padStart(13)} | ${stats.median.toFixed(2).padStart(11)} | ${stats.p95.toFixed(2).padStart(8)} | ${stats.max.toFixed(2).padStart(8)} | ${stats.stdDev.toFixed(2).padStart(6)}`
    );
  }
  console.log('======================================================================\n');

  // Print per-run breakdown
  console.log('PER-RUN AVERAGE LATENCY BREAKDOWN (ms):');
  console.log('Run   | Create (ms) | Read (ms)   | Update (ms) | Delete (ms)');
  console.log('------|-------------|-------------|-------------|------------');
  for (const r of runResults) {
    console.log(
      `Run ${r.run} | ${r.create.avg.toFixed(2).padStart(11)} | ${r.read.avg.toFixed(2).padStart(11)} | ${r.update.avg.toFixed(2).padStart(11)} | ${r.delete.avg.toFixed(2).padStart(10)}`
    );
  }
  console.log('----------------------------------------------------------------------\n');

  const outputPayload = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    jobsPerRun: JOBS_COUNT,
    runsCount: RUNS_COUNT,
    summary,
    runResults,
  };

  fs.writeFileSync(
    path.join(__dirname, 'raw_crud_latencies.json'),
    JSON.stringify(outputPayload, null, 2),
    'utf8'
  );
  console.log(`Raw benchmark data successfully written to ./benchmarks/raw_crud_latencies.json\n`);

  return outputPayload;
}

runBenchmark().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
