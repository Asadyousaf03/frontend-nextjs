/**
 * Contract drift check against backend OpenAPI.
 * Domain types live in types/genomic.ts and must stay aligned with schemas.py.
 *
 * Usage (from frontend):
 *   1. Copy backend openapi export to ./openapi.json
 *   2. npm run sync:types
 */
import { readFileSync } from "node:fs";

const requiredPaths = [
  "/api/v2/capabilities",
  "/api/v2/uploads",
  "/api/v2/analyses",
  "/api/v2/analyses/{analysis_id}",
  "/api/v2/analyses/{analysis_id}/result",
  "/api/v2/analyses/{analysis_id}/events",
  "/ready",
];

const spec = JSON.parse(
  readFileSync(new URL("../openapi.json", import.meta.url), "utf8"),
);
const paths = Object.keys(spec.paths || {});
const missing = requiredPaths.filter((path) => !paths.includes(path));

console.log(`OpenAPI paths: ${paths.length}`);
console.log(paths.sort().join("\n"));

if (missing.length) {
  console.error("\nContract drift: missing required paths:");
  for (const path of missing) console.error(`  - ${path}`);
  console.error(
    "\nRegenerate openapi.json from the backend (scripts/export_openapi.py) and retry.",
  );
  process.exit(1);
}

console.log("\nRequired v2 paths present.");
console.log("Keep types/genomic.ts aligned with backend schemas.py AnalysisResultV2.");
