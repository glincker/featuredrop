#!/usr/bin/env node
// Informational only — prints gzip size for every dist/*.js entry point so
// docs/BENCHMARKS.md can be regenerated from real numbers. Unlike
// check-bundle-budgets.mjs, this does not gate CI and has no pass/fail budgets.
import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const cwd = process.cwd();
const distDir = join(cwd, "dist");

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

async function run() {
  const entries = await readdir(distDir);
  const jsFiles = entries
    .filter((name) => name.endsWith(".js") && !name.endsWith(".map"))
    .sort();

  const rows = [];
  for (const file of jsFiles) {
    const content = await readFile(join(distDir, file));
    const gzipBytes = gzipSync(content).byteLength;
    rows.push({ file, gzipBytes });
  }

  rows.sort((a, b) => a.gzipBytes - b.gzipBytes);
  for (const row of rows) {
    console.log(`${row.file.padEnd(24)} ${formatKb(row.gzipBytes).padStart(10)} gzip`);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
