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
    // 1. Test latency
    const latency = await SpeedTest.testLatency("/testfile.bin");
    latencyEl.textContent = latency + " ms";

    // 2. Run download test
    const res = await SpeedTest.downloadTest("/testfile.bin", 6, (bytes) => {
        downloadedEl.textContent = (bytes / 1024/ 1024).toFixed(2) + " MB";
    });

    // 3. Show results
    resultEl.textContent = res.mbps.toFixed(1) + " Mbps";
    durationEl.textContent = res.secs.toFixed(1) + " s";

    // Animate gauge (max 100 Mbps visual)
    let percent = Math.min(100, res.Mbps);
    gauge.style.width = percent + "%";
}catch (arr) {
    resultEl.textContent ="Error running test";
    console.error(err);
} finally {
    startBtn.disabled = false;
}
});
