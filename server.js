// server.js  (place this in the PROJECT ROOT)
// Simple static server + avatar upload + robust logging

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Folders ----------------------------------------------------------------
const publicDir = path.join(__dirname);         // serve the whole project as static
const photosDir = path.join(__dirname, 'photos');
const logsDir   = path.join(__dirname, 'logs');

if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
if (!fs.existsSync(logsDir))   fs.mkdirSync(logsDir,   { recursive: true });

// --- Logging (access + error) ------------------------------------------------
// Access log (rotates daily, keeps ~14 files by default)
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: logsDir,
  compress: 'gzip'
});
app.use(morgan('combined', { stream: accessLogStream }));
// Also print concise logs to console during dev
app.use(morgan('dev'));

// Capture unhandled errors in a file
const errorLog = fs.createWriteStream(path.join(logsDir, 'errors.log'), { flags: 'a' });

// --- Middleware --------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your HTML/CSS/JS)
app.use(express.static(publicDir, { extensions: ['html'] }));

// Serve uploaded avatars
app.use('/photos', express.static(photosDir));

// --- Multer setup ------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, photosDir),
  filename: (req, file, cb) => {
    // Example file name: avatar_<timestamp>.jpg/png
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `avatar_${Date.now()}${safeExt}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

// --- Routes ------------------------------------------------------------------
// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Avatar upload
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/photos/${req.file.filename}`;
  res.json({ ok: true, url });
});

// --- Error handlers ----------------------------------------------------------
app.use((err, _req, res, _next) => {
  // Log to file
  const stamp = new Date().toISOString();
  errorLog.write(`[${stamp}] ${err.stack || err}\n`);
  // Return safe message
  res.status(500).json({ error: 'Internal server error' });
});

// --- Start -------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});