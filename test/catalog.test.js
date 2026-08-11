import assert from "node:assert/strict";
import test from "node:test";

import { chooseProjectPattern, searchCatalog } from "../server/catalog.js";

test("searchCatalog ranks Kernel documentation", () => {
  const results = searchCatalog("deterministic Kernel workflows", 3);
  assert.ok(results.length > 0);
  assert.equal(results[0].id, "kernel");
  assert.ok(results.every((result) => result.url.startsWith("https://")));
});

test("searchCatalog returns an empty list for unrelated text", () => {
  assert.deepEqual(searchCatalog("bananas typography", 4), []);
});

test("chooseProjectPattern separates proof workloads from general workflows", () => {
  assert.equal(chooseProjectPattern("Generate ZK rollup proofs across a GPU fleet").fit, "Froben");
  assert.equal(chooseProjectPattern("Resolve a prediction market from sports data").fit, "Kernel");
});
