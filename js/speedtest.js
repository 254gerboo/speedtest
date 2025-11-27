const SpeedTest = {
    async testLatency(url) {
        const samples = 5;
        let total = 0;
        for (let i = 0; i < samples; i++) {
            const start = performance.now();
            await fetch(url, { method: 'HEAD', cache: 'no-cache' });
            const end = performance.now();
            total += (end - start);
        }
        return total / samples;
    },

    async downloadTest(url, parallel = 4, onProgress = null) {
        let totalBytes = 0;
        const promises = [];

        for (let i = 0; i < parallel; i++) {
            promises.push(fetch(url, { cache: 'no-cache' })
                .then(resp => {
                    const reader = resp.body.getReader();
                    let loaded = 0;
                    return reader.read().then(function process({ done, value }) {
                        if (done) return;
                        loaded += value.length;
                        totalBytes += value.length;
                        if (onProgress) onProgress(totalBytes);
                        return reader.read().then(process);
                    });
                })
            );
        }

        const startTime = performance.now();
        await Promise.all(promises);
        const endTime = performance.now();

        const durationSecs = (endTime - startTime) / 1000;
        const mbps = (totalBytes * 8 / 1e6) / durationSecs; // Megabits per second

        return { mbps, secs: durationSecs, bytes: totalBytes };
    }
};
