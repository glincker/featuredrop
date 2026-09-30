#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const cwd = process.cwd();

const budgets = [
  { name: "core", file: "dist/index.js", maxBytes: 5 * 1024 },
  // Bumped from 55 kB: adding 7 i18n locales (ru, it, nl, tr, pl, id, vi)
  // pushed real usage to 55.74 kB. Budget raised to 58 kB with headroom for
  // the next couple of locales rather than re-triggering on trivial growth.
  { name: "react", file: "dist/react.js", maxBytes: 58 * 1024 },
  { name: "vue", file: "dist/vue.js", maxBytes: 10 * 1024 },
  { name: "svelte", file: "dist/svelte.js", maxBytes: 5 * 1024 },
];

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

async function run() {
  let hasFailure = false;

  for (const budget of budgets) {
    const fullPath = join(cwd, budget.file);
    const content = await readFile(fullPath);
    const gzipBytes = gzipSync(content).byteLength;
    const status = gzipBytes <= budget.maxBytes ? "PASS" : "FAIL";
    console.log(
      `[${status}] ${budget.name.padEnd(7)} ${formatKb(gzipBytes).padStart(10)} / ${formatKb(budget.maxBytes)}`,
    );

    if (gzipBytes > budget.maxBytes) {
      hasFailure = true;
      console.log(
        `       over by ${formatKb(gzipBytes - budget.maxBytes)} (${budget.file})`,
      );
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
