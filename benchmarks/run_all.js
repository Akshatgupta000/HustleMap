/**
 * Master Benchmark Suite Runner
 * Runs:
 * 1. Code Stats & Line Count Audit
 * 2. API CRUD Latency Benchmark (50 jobs x 5 runs)
 * 3. Extension Flow Benchmark (30 requests x 5 runs)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('######################################################################');
console.log('              STARTING COMPLETE HUSTLEMAP BENCHMARK SUITE             ');
console.log('######################################################################\n');

try {
  console.log('>>> [1/3] Running Codebase Line Count & Structure Audit...');
  execSync('node benchmarks/code_stats.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  console.log('\n>>> [2/3] Running Extension Flow Save Benchmark...');
  execSync('node benchmarks/extension_flow_benchmark.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  console.log('\n>>> [3/3] Running API CRUD Latency Benchmark...');
  execSync('node benchmarks/api_crud_benchmark.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  console.log('\n######################################################################');
  console.log('                   BENCHMARK SUITE COMPLETED SUCCESSFULLY             ');
  console.log('######################################################################');
} catch (error) {
  console.error('\nBenchmark run encountered an error:', error.message);
  process.exit(1);
}
