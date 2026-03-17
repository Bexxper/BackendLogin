// index.js - Mafia PS Style Auto Login
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
  }),
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
  console.log(
    `[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`
  );
  next();
});

// Favicon
app.get('/favicon.:ext', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// ---------------------------
// Root
app.get('/', (req, res) => {
  res.send('Welcome to Growtopia 2 - Mafia PS Style Login!');
});

// ---------------------------
// Dashboard (optional, fallback)
// Bisa diakses manual, tapi untuk auto login client ENet tidak dibutuhkan
app.all('/player/login/dashboard', (req, res) => {
  const { growId, password } = req.body;

  // jika growId & password ada, langsung redirect ke validate
  if (growId && password) {
    return res.redirect(307, '/player/growid/login/validate');
  }

  // fallback: render dashboard (opsional)
  res.render(path.join(__dirname, 'public/html/dashboard.ejs'), { data: {} });
});

// ---------------------------
// Validate login → generate token
app.all('/player/growid/login/validate', (req, res) => {
  const growId = req.body.growId || 'guest';
  const password = req.body.password || 'guest';

  // Base64 encode token
  const token = Buffer.from(`growId=${growId}&password=${password}`).toString('base64');

  // Response ala Mafia PS
  res.json({
    status: "success",
    message: "Account Validated.",
    token: token,
    url: "", // bisa kosong
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
    // minimal validasi sederhana
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
