import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import manifest from "../lib/image-manifest.json";
import { optimizedImage } from "../lib/optimized-images";

test("responsive assets exist, are WebP and never upscale originals", () => {
  let originalBytes = 0;
  let optimizedBytes = 0;
  for (const [source, entry] of Object.entries(manifest)) {
    originalBytes += statSync(`public${decodeURIComponent(source)}`).size;
    for (const variant of entry.variants) {
      const path = `public${decodeURIComponent(variant.src)}`;
      assert.ok(existsSync(path), path);
      assert.ok(variant.width <= entry.width);
      const bytes = readFileSync(path);
      assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    }
    optimizedBytes += statSync(`public${decodeURIComponent(entry.variants.at(-1)!.src)}`).size;
  }
  assert.ok(optimizedBytes < originalBytes * 0.5, "largest variants should save at least 50% overall");
});

test("responsive helper provides small candidates and safely preserves unknown URLs", () => {
  const image = optimizedImage("/images/alexa/1.jpg", 320);
  assert.ok(image.src?.endsWith("-320.webp"));
  assert.ok(image.srcSet?.includes("640w"));
  assert.deepEqual(optimizedImage("https://example.com/photo.jpg"), { src: "https://example.com/photo.jpg" });
  assert.deepEqual(optimizedImage(undefined), { src: undefined });
  assert.ok(optimizedImage("/images/caesar%20/1.jpg").src?.includes("caesar%20"));
});
