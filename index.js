// index.js - Secret PS Backend Login
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const rateLimiter = require('express-rate-limit');

// VPS ENet Server Info
const ENET_SERVER_IP = "70.153.137.6";
const ENET_SERVER_PORT = 17091;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
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
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, headers: true }));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
  next();
});

// Favicon
app.get('/favicon.:ext', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Dashboard (GET only)
app.get('/player/login/dashboard', (req, res) => {
  res.render(path.join(__dirname, 'public/html/dashboard.ejs'));
});

// Login Normal (growId/password)
app.post('/player/growid/login/validate', (req, res) => {
  const growId = req.body.growId || '';
  const password = req.body.password || '';

  if (!growId || !password) {
    return res.json({
      status: 'failed',
      message: 'Missing growId or password'
    });
  }

  // Generate token compatible dengan CPS
  const token = Buffer.from(`growId=${growId}&passwords=${password}`).toString('base64');

  res.json({
    status: 'success',
    message: 'Account Validated.',
    token: token,
    url: `${ENET_SERVER_IP}:${ENET_SERVER_PORT}`,
    accountType: 'growtopia',
    accountAge: 2
  });
});

// Guest Login
app.post('/player/growid/login/guest', (req, res) => {
  const growId = `guest${Math.floor(Math.random() * 9999)}`;
  const password = `guest`;

  const token = Buffer.from(`growId=${growId}&passwords=${password}`).toString('base64');

  res.json({
    status: 'success',
    message: 'Guest login auto-generated',
    token: token,
    url: `${ENET_SERVER_IP}:${ENET_SERVER_PORT}`,
    accountType: 'growtopia',
    accountAge: 0
  });
});

// Check token
app.post('/player/growid/checktoken', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.json({ status: 'failed', message: 'Missing refreshToken' });
  }

  try {
    const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');
    // decoded harus ada growId dan passwords
    if (!decoded.includes('growId=') || !decoded.includes('passwords=')) {
      return res.json({ status: 'failed', message: 'Invalid token' });
    }
    res.json({
      status: 'success',
      message: 'Account Validated.',
      token: refreshToken,
      url: `${ENET_SERVER_IP}:${ENET_SERVER_PORT}`,
      accountType: 'growtopia',
      accountAge: decoded.includes('guest') ? 0 : 2
    });
  } catch (err) {
    res.json({ status: 'failed', message: 'Token parse error' });
  }
});

// Root
app.get('/', (req, res) => {
  res.send('Welcome to Growtopia 2 - Secret PS Style Login!');
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Secret PS Backend listening on port ${PORT}`);
});
