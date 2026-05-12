#!/usr/bin/env bun
/**
 * extract-i18n.ts
 * Scans all .tsx/.ts files under src/ for t("key") or t('key') calls,
 * then syncs those keys into every locale JSON file under src/locales/.
 *
 * Run:  bun scripts/extract-i18n.ts
 *
 * Behaviour:
 *   - NEW keys are added to every locale file with the key itself as a
 *     placeholder value (e.g. "Profile.bio": "Profile.bio") so a translator
 *     knows what still needs filling in.
 *   - EXISTING keys (with real translations) are never overwritten.
 *   - Keys are sorted alphabetically in the output files.
 *   - Keys found in locale files that are NOT used in source are kept as-is
 *     (no deletions — you can add --prune to remove them if you want).
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = join(import.meta.dir, "..");
const SRC_DIR = join(ROOT, "src");
const LOCALES_DIR = join(ROOT, "src", "locales");

// ---------------------------------------------------------------------------
// 1. Collect all .tsx / .ts source files recursively under src/
// ---------------------------------------------------------------------------
function walkSrc(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSrc(fullPath));
    } else if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// 2. Extract all translation keys from source files
// ---------------------------------------------------------------------------
function extractKeys(files: string[]): Set<string> {
  // Matches: t("some.key") or t('some.key')
  // Also handles t("key", { ... }) — captures only the key part
  const RE = /\bt\(\s*["']([A-Za-z0-9_./-]+)["']/g;
  const keys = new Set<string>();

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    for (const match of content.matchAll(RE)) {
      keys.add(match[1]);
    }
  }
  return keys;
}

// ---------------------------------------------------------------------------
// 3. Sync keys into a locale file
// ---------------------------------------------------------------------------
function syncLocale(localePath: string, allKeys: Set<string>, prune: boolean) {
  const existing: Record<string, string> = JSON.parse(
    readFileSync(localePath, "utf-8")
  );

  const updated: Record<string, string> = {};
  let added = 0;
  let pruned = 0;

  // Add all found keys (preserve existing values)
  for (const key of [...allKeys].sort()) {
    if (key in existing) {
      updated[key] = existing[key];
    } else {
      updated[key] = key; // placeholder — translator fills this in
      added++;
    }
  }

  // Keep keys that exist in locale but were NOT found in source
  if (!prune) {
    for (const [key, val] of Object.entries(existing)) {
      if (!(key in updated)) {
        updated[key] = val;
      }
    }
  } else {
    pruned = Object.keys(existing).filter((k) => !allKeys.has(k)).length;
  }

  // Sort final object
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(updated).sort()) {
    sorted[key] = updated[key];
  }

  writeFileSync(localePath, JSON.stringify(sorted, null, 2) + "\n", "utf-8");
  return { added, pruned };
}

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------
const prune = process.argv.includes("--prune");

console.log("🔍  Scanning source files...");
const srcFiles = walkSrc(SRC_DIR);
console.log(`   Found ${srcFiles.length} .ts/.tsx files`);

const keys = extractKeys(srcFiles);
console.log(`   Extracted ${keys.size} unique translation keys\n`);

const localeFiles = readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => join(LOCALES_DIR, f));

for (const localePath of localeFiles) {
  const name = relative(ROOT, localePath);
  const { added, pruned } = syncLocale(localePath, keys, prune);
  const msgs = [];
  if (added > 0) msgs.push(`+${added} added`);
  if (pruned > 0) msgs.push(`-${pruned} pruned`);
  const summary = msgs.length ? `(${msgs.join(", ")})` : "(no changes)";
  console.log(`✅  ${name} ${summary}`);
}

console.log("\nDone. Review locale files and fill in any placeholder values.");
