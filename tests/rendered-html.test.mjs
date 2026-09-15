import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships the V1 quiz and V2 live room in the same application", async () => {
  const html = await readFile(new URL("../public/app.html", import.meta.url), "utf8");
  assert.match(html, /id="quiz"/);
  assert.match(html, /id="hostCreate"/);
  assert.match(html, /id="liveWall"/);
  assert.match(html, /NEW ANIMAL FOUND!/);
  assert.match(html, /animal-icons\.png/);
  assert.equal((html.match(/\{q:'/g) ?? []).length, 10);
});
