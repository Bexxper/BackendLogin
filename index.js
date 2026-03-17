// index.js - Mafia PS Style Full Login Skip Modal
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const rateLimiter = require('express-rate-limit');
const path = require('path');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression({ level: 5, threshold: 0 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    headers: true,
  })
);

// CORS & logging
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// Root
app.get('/', (req, res) => {
  res.send('Welcome to Growtopia 2 - Mafia PS Style Login!');
});

// ---------------------------
// Dashboard endpoint (opsional fallback)
// Auto-bypass login modal browser
app.all('/player/login/dashboard', (req, res) => {
  const { growId, password } = req.body;

  // Jika growId & password ada → langsung redirect validate
  if (growId && password) {
    return res.redirect(307, '/player/growid/login/validate');
  }

  // Jika tidak ada data → guest token
  const guestToken = Buffer.from(`growId=guest&password=guest`).toString('base64');
  res.json({
    status: 'success',
    message: 'Guest login auto-generated',
    token: guestToken,
    url: '',
    accountType: 'growtopia',
    accountAge: 0
  });
});

// ---------------------------
// Validate login → generate token
app.all('/player/growid/login/validate', (req, res) => {
  const growId = req.body.growId || 'guest';
  const password = req.body.password || 'guest';

  const token = Buffer.from(`growId=${growId}&password=${password}`).toString('base64');

  res.json({
    status: "success",
    message: "Account Validated.",
    token,
    url: "",
    accountType: "growtopia",
    accountAge: 2
  });
});

// ---------------------------
// Check token → validasi & refresh
app.all('/player/growid/checktoken', (req, res) => {
  const { refreshToken } = req.body || '';
  try {
    const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');
    if (!decoded.includes('growId=')) throw new Error('Invalid token');

    res.json({
      status: 'success',
      message: 'Account Validated.',
      token: refreshToken,
      url: '',
      accountType: 'growtopia',
      accountAge: 2
    });
  } catch (e) {
    res.json({
      status: 'failed',
      message: 'Invalid token'
    });
  }
});

// ---------------------------
// Jika deploy normal di VPS
if (process.env.SERVER_TYPE !== 'vercel') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Mafia PS Style backend running on port ${PORT}`);
  });
}

// ---------------------------
// Export untuk Vercel / serverless
module.exports = app;
