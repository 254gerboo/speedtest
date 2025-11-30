const SpeedTest = {
    latencySamples: 5,
    downloadStreams: 8,
    testDuration: 7, // seconds

    async testLatency(url) {
        let samples = [];

        for (let i = 0; i < this.latencySamples; i++) {
            const t0 = performance.now();
            await fetch(url,{ method: "HEAD" });
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

            while (!abort) {
                const res = await fetch(url, { signal: controller.signal });
                const reader = res.body.getReader();

                while (true) {
                    const { value, done } = await reader.read();
                    if (done || abort) break;

                    totalBytes += value.length;
                    onProgress(totalBytes);
                }
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
