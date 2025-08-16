// server.js
// Static site + profile photo upload (with CORS so it also works from Pinegrow on :40000)

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ====== CONFIG ======
const PORT = process.env.PORT || 3000;

// Your project root (where index.html is)
const ROOT = __dirname;

// Where to save uploaded profile photos
const PHOTOS_DIR = path.join(ROOT, "photos");

// Ensure photos dir exists
if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });

// Allow CORS (so pages served by Pinegrow at :40000 can POST to this server)
app.use(cors({ origin: true, credentials: true }));

// Parse JSON if you ever need it
app.use(express.json());

// Serve your whole project statically (optional, but handy)
app.use(express.static(ROOT));

// Serve photos as /photos/<filename>
app.use("/photos", express.static(PHOTOS_DIR));

// Configure multer storage + simple file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PHOTOS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});
const fileFilter = (req, file, cb) => {
  const ok = /image\/(jpeg|png|webp|gif|jpg)/i.test(file.mimetype);
  cb(ok ? null : new Error("Only images are allowed"), ok);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Upload endpoint: expects form field name "profilePhoto"
app.post("/api/upload", upload.single("profilePhoto"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const publicPath = `/photos/${req.file.filename}`;
  return res.json({
    message: "Uploaded successfully",
    path: publicPath,
    url: `${req.protocol}://${req.get("host")}${publicPath}`
  });
});

// Basic health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Photos served from /photos`);
});