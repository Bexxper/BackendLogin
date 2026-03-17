// index.js - Mafia PS Style Full Skip Login Modal
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
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
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
  next();
});

// ---------------------------
// Root
app.get('/', (req, res) => {
  res.send('Welcome to Growtopia 2 - Mafia PS Style Login!');
});

// ---------------------------
// Login endpoint → langsung bypass dashboard/modal
app.all('/player/login/dashboard', (req, res) => {
  const { growId, password } = req.body;

  // Jika growId & password ada → langsung ke validate (skip modal browser)
  if (growId && password) {
    // langsung POST ke validate
    return res.redirect(307, '/player/growid/login/validate');
  }

  // Kalau tidak ada data → auto-generate guest token (optional)
  const guestToken = Buffer.from(`growId=guest&password=guest`).toString('base64');
  return res.json({
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

  // Response langsung untuk ENet client
  res.json({
    status: "success",
    message: "Account Validated.",
    token: token,
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
// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Mafia PS Style backend login running on port ${PORT}`);
});
