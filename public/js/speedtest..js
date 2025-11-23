// public/js/speedtest.js
// Lightweight test utilities (attach to window for compatibility)

(function(window){
  async function testLatency(url, count = 5) {
    const times = [];
    for (let i = 0; i < count; i++) {
      const t0 = performance.now();
      try {
        // HEAD request to avoid full download
        await fetch(url, { method: 'HEAD', cache: 'no-store' });
        const t1 = performance.now();
        times.push(t1 - t0);
      } catch (e) {
        times.push(9999);
      }
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return Math.round(avg);
  }

  async function downloadTest(url, durationSec = 6, onProgress) {
    const controller = new AbortController();
    const start = performance.now();
    let downloaded = 0;
    const readerPromise = (async () => {
      try {
        const resp = await fetch(url + '?r=' + Math.random(), { signal: controller.signal, cache: 'no-store' });
        if (!resp.body) return;
        const reader = resp.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          downloaded += (value ? value.length : 0);
          if (typeof onProgress === 'function') onProgress(downloaded);
          const now = performance.now();
          if ((now - start) >= durationSec * 1000) { controller.abort(); break; }
        }
      } catch (e) {
        // ignore abort/errors
      }
    })();
    try { await readerPromise } catch (e) { }
    const end = performance.now();
    const secs = (end - start) / 1000 || 0.001;
    const mbps = ((downloaded * 8) / secs) / (1024 * 1024);
    return { mbps: mbps.toFixed(2), downloaded, secs: secs.toFixed(2) };
  }

  // expose
  window.SpeedTest = {
    testLatency,
    downloadTest
  };
})(window);
