import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HomeVideo, homeVideoSource } from "../components/media/HomeVideo";
import { ApartmentVideo } from "../components/media/ApartmentVideo";
import { apartmentVideos } from "../lib/apartment-videos";

// Run codec/duration verification on a workstation that has ffprobe.
const hasProbe = (() => { try { execFileSync("ffprobe", ["-version"], { stdio: "ignore" }); return true; } catch { return false; } })();

test("homepage video is muted, inline and defers its source until visibility is known", () => {
  const markup = renderToStaticMarkup(createElement(HomeVideo, { poster: "/images/alexa/3.jpg" }));
  assert.ok(markup.includes("<video"));
  assert.ok(markup.includes('preload="none"'));
  assert.ok(markup.includes('muted=""'));
  assert.ok(markup.includes('playsinline=""'));
  assert.ok(!markup.includes(homeVideoSource));
  assert.ok(!markup.includes("<dialog"));
});

test("apartment tours retain play-on-demand loading and use optimized files", () => {
  for (const [name, src] of Object.entries(apartmentVideos)) {
    assert.ok(src?.startsWith("/optimized/"));
    const markup = renderToStaticMarkup(createElement(ApartmentVideo, { src: src!, name, poster: `/images/${name}/1.jpg` }));
    assert.ok(markup.includes('preload="none"'));
    assert.ok(!markup.includes("autoplay"));
    assert.ok(statSync(`public${decodeURIComponent(src!)}`).size > 0);
  }
});

test("optimized playback files are smaller, fast-start and preserve duration and browser codecs", { skip: !hasProbe }, () => {
  const sources = [homeVideoSource, ...Object.values(apartmentVideos)] as string[];
  for (const src of sources) {
    const output = `public${decodeURIComponent(src)}`;
    const original = output.replace("/optimized/", "/");
    assert.ok(statSync(output).size < statSync(original).size, src);
    const bytes = readFileSync(output);
    assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")), src);
    const probe = (path: string) => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", path], { encoding: "utf8" }));
    const video = probe(output);
    const source = probe(original);
    assert.ok(Math.abs(Number(video.format.duration) - Number(source.format.duration)) < 0.5, src);
    const stream = video.streams.find((s: { codec_type: string }) => s.codec_type === "video");
    assert.equal(stream.codec_name, "h264");
    assert.equal(stream.pix_fmt, "yuv420p");
    assert.ok(stream.width <= 720 && stream.height <= 1280, src);
    assert.equal(video.streams.filter((s: { codec_type: string }) => s.codec_type === "audio").length, source.streams.filter((s: { codec_type: string }) => s.codec_type === "audio").length);
  }
});
