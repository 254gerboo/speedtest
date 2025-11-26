// public/js/speedtest.js
(function(window){
  
  async function testLatency(url, count = 5) {
    const times = [];
    for (let i = 0; i < count; i++) {
      const t0 = performance.now();
      try {
        await fetch(url, { method: 'HEAD', cache: 'no-store' });
        times.push(performance.now() - t0);
      } catch {
        times.push(9999);
      }
    }
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  async function downloadTest(url, durationSec = 6, onProgress) {
    const controller = new AbortController();
    let downloaded = 0;
    const start = performance.now();

    const performDownload = async () => {
      try {
        const resp = await fetch(url + "?r=" + Math.random(), {
          cache: "no-store",
          signal: controller.signal
        });
        if (!resp.body) return;

        const reader = resp.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          downloaded += value ? value.length : 0;
          if (onProgress) onProgress(downloaded);

          if (performance.now() - start >= durationSec * 1000) {
            controller.abort();
            break;
          }
        }
      } catch (e) {
        // aborted or network error → ignore
      }
    };

    try { 
      await performDownload(); 
    } catch {}

    const secs = (performance.now() - start) / 1000 || 0.001;
    const mbps = ((downloaded * 8) / secs) / (1024 * 1024);

    return {
      mbps: Number(mbps.toFixed(2)),
      downloaded,
      secs: Number(secs.toFixed(2)),
    };
  }

  window.SpeedTest = { testLatency, downloadTest };

})(window);
