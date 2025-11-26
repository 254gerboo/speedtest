// public/js/app.js

document.getElementById("startBtn").addEventListener("click", async () => {
    const resultEl = document.getElementById("result");
    const latencyEl = document.getElementById("latency");
    const downloadedEl = document.getElementById("downloaded");
    const durationEl = document.getElementById("duration");
    const gauge = document.getElementById("gauge");

    resultEl.textContent = "Testing...";
    gauge.style.width = "0%";

    // 1. Test latency
    const latency = await SpeedTest.testLatency("/testfile.bin");
    latencyEl.textContent = latency + " ms";

    // 2. Run download test
    const res = await SpeedTest.downloadTest("/testfile.bin", 6, (bytes) => {
        downloadedEl.textContent = bytes + " bytes";
    });

    // 3. Show results
    resultEl.textContent = res.mbps + " Mbps";
    durationEl.textContent = res.secs + " s";

    // Animate gauge (max 100 Mbps visual)
    let percent = Math.min(100, (res.mbps / 100) * 100);
    gauge.style.width = percent + "%";
});
