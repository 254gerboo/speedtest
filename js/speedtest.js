const SpeedTest = {
    latencySamples: 5,
    downloadStreams: 8,
    testDuration: 7, // seconds

    async testLatency(url) {
        let samples = [];

        for (let i = 0; i < this.latencySamples; i++) {
            const t0 = performance.now();
            await fetch(url + "?cache=" + Math.random(), { method: "HEAD" });
            samples.push(performance.now() - t0);
        }

        samples.sort((a,b) => a - b);
        const trimmed = samples.slice(1, samples.length - 1);

        return (trimmed.reduce((a,b) => a + b) / trimmed.length).toFixed(1);
    },

    async downloadTest(url, onProgress) {
        let totalBytes = 0;
        let abort = false;

        const controllers = [];
        const startTime = performance.now();

        const runStream = async () => {
            const controller = new AbortController();
            controllers.push(controller);

            try {
                while (!abort) {
                    let res;
                    try {
                        res = await fetch(url + "?cache=" + Math.random(), { signal: controller.signal });
                    } catch (err) {
                        if (controller.signal.aborted) break;
                        break;
                    }

                    if (!res || !res.body) {
                        // No readable body (may happen with some responses) — stop this stream iteration
                        break;
                    }

                    const reader = res.body.getReader();

                    try {
                        while (true) {
                            const { value, done } = await reader.read();
                            if (done || abort) break;

                            const chunkLen = value ? (value.byteLength ?? value.length ?? 0) : 0;
                            totalBytes += chunkLen;
                            if (typeof onProgress === 'function') onProgress(totalBytes);
                        }
                    } catch (readErr) {
                        // reading failed (possibly due to abort) — stop this stream
                        break;
                    }
                }
            } catch (err) {
                // swallow unexpected errors from this worker to avoid crashing the whole test
            }
        };

        const workers = [];
        for (let i = 0; i < this.downloadStreams; i++) {
            workers.push(runStream());
        }

        await new Promise(res => setTimeout(res, this.testDuration * 1000));

        abort = true;
        controllers.forEach(c => c.abort());

        await Promise.allSettled(workers);

        const secs = (performance.now() - startTime) / 1000;
        const mbps = (totalBytes * 8) / 1e6 / secs;

        return { mbps, secs, bytes: totalBytes };
    }
};
