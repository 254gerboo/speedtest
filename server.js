 // server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Allow all origins (dev only)
app.use(cors());

const app = express();
const PUBLIC = path.join(__dirname, 'public');
const ASSETS = path.join(__dirname, 'assets1');

// serve static
app.use(express.static(PUBLIC));

// ensure assets folder exists
if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS);

// If you want to use the uploaded image as /assets/cover.png, we try to copy it into assets (best-effort).
const uploaded = '/assets1/cover.png';
const dest = path.join(ASSETS, 'cover.png');
try {
  if (fs.existsSync(uploaded)) {
    fs.copyFileSync(uploaded, dest);
    console.log('Copied uploaded image to', dest); 
  } else {
    console.log('Uploaded image not found at', uploaded);
  }
} catch (e) {
  console.warn('Could not copy uploaded image:', e.message);
}

// streaming endpoint: streams repeated chunk until client closes (used to measure download speed)
app.get('/download', (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  const chunk = Buffer.alloc(64 * 1024, 'a'); // 64KB chunk pattern
  let sending = true;

  req.on('close', () => { sending = false; });

  (async function sendLoop() {
    while (sending) {
      if (!res.write(chunk)) {
        // wait for drain
        await new Promise(resolve => res.once('drain', resolve));
      }
    }
    try { res.end(); } catch (e) { /* ignore */ }
  })();
});

// fallback: health
app.get('/health', (req, res) => res.json({ok:true, time:Date.now()}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SpeedCheck Lite server running: http://localhost:${PORT}`));
