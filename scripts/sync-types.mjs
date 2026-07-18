/**
 * Lightweight OpenAPI -> TypeScript sync helper.
 * Source of truth: backend openapi.json (copied from FastAPI).
 * Domain types live in types/genomic.ts and should stay aligned with schemas.py.
 */
import { readFileSync } from "node:fs";

const spec = JSON.parse(readFileSync(new URL("../openapi.json", import.meta.url), "utf8"));
const paths = Object.keys(spec.paths || {});
console.log(`OpenAPI synced: ${paths.length} paths`);
console.log(paths.join("\n"));
console.log("\nKeep types/genomic.ts aligned with backend schemas.py.");
