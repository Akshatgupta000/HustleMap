import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  'uploads',
  'public',
  'qa-springworks',
  'docs',
  'benchmarks'
]);

const CODE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.json'
]);

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let code = 0;
    let comment = 0;
    let blank = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        blank++;
      } else if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        comment++;
      } else {
        code++;
      }
    }
    return { total: lines.length, code, comment, blank };
  } catch (err) {
    return { total: 0, code: 0, comment: 0, blank: 0 };
  }
}

function scanDir(dirPath, stats = {}) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      scanDir(fullPath, stats);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Exclude package-lock.json and large trained data
      if (entry.name === 'package-lock.json' || entry.name.endsWith('.traineddata') || entry.name.endsWith('.txt')) {
        continue;
      }
      if (CODE_EXTENSIONS.has(ext)) {
        const topFolder = relPath.split(path.sep)[0];
        if (!stats[topFolder]) {
          stats[topFolder] = { files: 0, totalLines: 0, codeLines: 0, commentLines: 0, blankLines: 0 };
        }
        const fileCount = countLines(fullPath);
        stats[topFolder].files++;
        stats[topFolder].totalLines += fileCount.total;
        stats[topFolder].codeLines += fileCount.code;
        stats[topFolder].commentLines += fileCount.comment;
        stats[topFolder].blankLines += fileCount.blank;
      }
    }
  }
  return stats;
}

const stats = scanDir(rootDir);

console.log('=====================================================');
console.log('       HUSTLEMAP REPOSITORY CODEBASE AUDIT           ');
console.log('=====================================================');
console.log('Directory / Module       | Files | Code Lines | Comments | Total Lines');
console.log('-------------------------|-------|------------|----------|------------');

let totalFiles = 0;
let totalCode = 0;
let totalComments = 0;
let grandTotal = 0;

for (const [mod, data] of Object.entries(stats)) {
  console.log(
    `${mod.padEnd(25)}| ${String(data.files).padStart(5)} | ${String(data.codeLines).padStart(10)} | ${String(data.commentLines).padStart(8)} | ${String(data.totalLines).padStart(11)}`
  );
  totalFiles += data.files;
  totalCode += data.codeLines;
  totalComments += data.commentLines;
  grandTotal += data.totalLines;
}
console.log('-------------------------|-------|------------|----------|------------');
console.log(
  `${'TOTAL (excl. node_modules)'.padEnd(25)}| ${String(totalFiles).padStart(5)} | ${String(totalCode).padStart(10)} | ${String(totalComments).padStart(8)} | ${String(grandTotal).padStart(11)}`
);
console.log('=====================================================\n');
