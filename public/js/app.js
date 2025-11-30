const startBtn = document.getElementById("startBtn");
if (!startBtn) {
    console.warn('startBtn element not found');
} else {
    startBtn.addEventListener("click", async () => {
        const startBtn = document.getElementById("startBtn");
    const resultEl = document.getElementById("result");
    const latencyEl = document.getElementById("latency");
    const downloadedEl = document.getElementById("downloaded");
    const durationEl = document.getElementById("duration");
    const gauge = document.getElementById("gauge");

    resultEl.textContent = "Testing...";
    gauge.style.width = "0%";
    startBtn.disabled = true;

    try {
            // Use local endpoints provided by the server
            const latencyUrl = '/health';
            const downloadUrl = '/download';

            // 1️⃣ Test latency (HEAD against health endpoint)
            const latency = await SpeedTest.testLatency(latencyUrl);
            latencyEl.textContent = (Number(latency).toFixed(1)) + " ms";

            // 2️⃣ Run download test (streams served from /download)
            const start = performance.now();
            const res = await SpeedTest.downloadTest(downloadUrl, (bytes) => {
                downloadedEl.textContent = (bytes / 1024 / 1024).toFixed(2) + " MB";
            });
        const end = performance.now();

        // 3️⃣ Show results
        resultEl.textContent = res.mbps.toFixed(1) + " Mbps";
        durationEl.textContent = ((end - start)/1000).toFixed(1) + " s";

        // Animate gauge (max 100 Mbps visual)
        let percent = Math.min(100, res.mbps);
        gauge.style.width = percent + "%";

        } catch (err) {
            resultEl.textContent = "Error running test";
            console.error(err);
        } finally {
            startBtn.disabled = false;
        }
    });
}
