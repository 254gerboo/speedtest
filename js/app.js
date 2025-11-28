document.getElementById("startBtn").addEventListener("click", async () => {
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
        const testUrl = "http://127.0.0.1:5500/?Run=10"; // Public test file

        // 1️⃣ Test latency (tiny fetch)
        const latency = await SpeedTest.testLatency(testUrl);
        latencyEl.textContent = (Number(latency).toFixed(1)) + " ms";

        // 2️⃣ Run download test (6 parallel streams)
        const start = performance.now();
        const res = await SpeedTest.downloadTest(testUrl, (bytes) => {
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
