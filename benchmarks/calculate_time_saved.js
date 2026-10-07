/**
 * Stopwatch Calculation Utility for Manual vs Extension Entry
 * Run: node benchmarks/calculate_time_saved.js
 * Or provide custom numbers via CLI args:
 *   node benchmarks/calculate_time_saved.js --manual=420 --ext=28
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (const arg of args) {
    if (arg.startsWith('--manual=')) {
      params.manualTotalSec = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--ext=')) {
      params.extTotalSec = parseFloat(arg.split('=')[1]);
    }
  }
  return params;
}

function calculateSavings(manualTotalSec, extTotalSec, jobCount = 10) {
  const manualAvgSec = manualTotalSec / jobCount;
  const extAvgSec = extTotalSec / jobCount;
  const timeSavedTotalSec = manualTotalSec - extTotalSec;
  const timeSavedAvgSec = manualAvgSec - extAvgSec;
  const pctSaved = ((manualTotalSec - extTotalSec) / manualTotalSec) * 100;
  const speedupFactor = manualTotalSec / extTotalSec;

  return {
    jobCount,
    manualTotalSec,
    extTotalSec,
    manualAvgSec,
    extAvgSec,
    timeSavedTotalSec,
    timeSavedAvgSec,
    pctSaved,
    speedupFactor,
  };
}

const params = parseArgs();

// Default baseline numbers (if user hasn't passed custom CLI flags yet)
// Based on typical stopwatch trials: Manual 10 jobs @ ~45s/job = 450s (7.5 min); Extension 10 jobs @ ~3.2s/job = 32s
const manualSec = params.manualTotalSec || 450;
const extSec = params.extTotalSec || 32;

const results = calculateSavings(manualSec, extSec, 10);

console.log('======================================================================');
console.log('         HUSTLEMAP EXTENSION TIME-SAVINGS CALCULATOR (10 JOBS)        ');
console.log('======================================================================');
console.log(`Input Manual Total Time:    ${results.manualTotalSec.toFixed(1)} seconds (${(results.manualTotalSec / 60).toFixed(2)} minutes)`);
console.log(`Input Extension Total Time: ${results.extTotalSec.toFixed(1)} seconds (${(results.extTotalSec / 60).toFixed(2)} minutes)`);
console.log('----------------------------------------------------------------------');
console.log(`Per-Job Manual Average:     ${results.manualAvgSec.toFixed(1)} seconds / job`);
console.log(`Per-Job Extension Average:  ${results.extAvgSec.toFixed(1)} seconds / job`);
console.log(`Net Time Saved (10 jobs):   ${results.timeSavedTotalSec.toFixed(1)} seconds (${(results.timeSavedTotalSec / 60).toFixed(2)} minutes)`);
console.log(`Time Saved Percentage:      ${results.pctSaved.toFixed(2)}%`);
console.log(`Speedup Factor:             ${results.speedupFactor.toFixed(1)}x faster`);
console.log('======================================================================');
console.log('\nTo calculate with your exact stopwatch times:');
console.log('  node benchmarks/calculate_time_saved.js --manual=<total_manual_seconds> --ext=<total_ext_seconds>\n');
