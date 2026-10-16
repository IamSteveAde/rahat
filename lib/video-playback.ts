/** Play only while the video intersects the viewport and the tab is visible. */
export function observeVideoPlayback(
  video: HTMLVideoElement,
  source: string,
  page: Document = document,
  Observer: typeof IntersectionObserver = IntersectionObserver,
) {
  let visible = false;
  let disposed = false;
  const shouldPlay = () => visible && !page.hidden && !disposed;
  const sync = () => {
    if (!shouldPlay()) { video.pause(); return; }
    // Delay the first video request until it is actually visible.
    if (!video.getAttribute("src")) video.src = source;
    void video.play().then(() => {
      if (!shouldPlay()) video.pause();
    }).catch(() => { /* Keep the poster if the browser blocks autoplay. */ });
  };
  const observer = new Observer(entries => {
    const entry = entries.find(item => item.target === video);
    if (!entry) return;
    visible = entry.isIntersecting;
    sync();
  }, { threshold: 0 });
  observer.observe(video);
  page.addEventListener("visibilitychange", sync);
  return () => {
    disposed = true;
    observer.disconnect();
    page.removeEventListener("visibilitychange", sync);
    video.pause();
  };
}
