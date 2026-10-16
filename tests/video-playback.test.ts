import assert from "node:assert/strict";
import test from "node:test";
import { observeVideoPlayback } from "../lib/video-playback";

test("hero playback follows scrolling and tab visibility, then cleans up", async () => {
  let callback: IntersectionObserverCallback;
  let disconnected = false;
  let plays = 0;
  let pauses = 0;
  let source = "";
  const listeners = new Set<() => void>();
  const video = {
    get src() { return source; }, set src(value: string) { source = value; },
    getAttribute: () => source || null,
    play: () => { plays++; return Promise.resolve(); },
    pause: () => { pauses++; },
  } as unknown as HTMLVideoElement;
  const page = {
    hidden: false,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  };
  class Observer {
    constructor(cb: IntersectionObserverCallback) { callback = cb; }
    observe(target: Element) { assert.equal(target, video); }
    disconnect() { disconnected = true; }
  }
  const cleanup = observeVideoPlayback(video, "/compressed.mp4", page as unknown as Document, Observer as unknown as typeof IntersectionObserver);
  const intersect = (visible: boolean) => callback([{ target: video, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 } as IntersectionObserverEntry], {} as IntersectionObserver);
  intersect(false);
  assert.equal(source, "");
  assert.equal(plays, 0);
  intersect(true);
  assert.equal(source, "/compressed.mp4");
  assert.equal(plays, 1);
  intersect(false);
  const paused = pauses;
  await Promise.resolve();
  assert.ok(pauses > paused, "late play completion must not restart an offscreen video");
  intersect(true);
  assert.equal(plays, 2);
  page.hidden = true;
  listeners.forEach(listener => listener());
  const hiddenPauses = pauses;
  page.hidden = false;
  listeners.forEach(listener => listener());
  assert.equal(plays, 3);
  assert.ok(hiddenPauses > paused);
  cleanup();
  assert.ok(disconnected);
  assert.equal(listeners.size, 0);
  const stopped = pauses;
  await Promise.resolve();
  assert.ok(pauses > stopped, "unmount must win over pending play promises");
});
