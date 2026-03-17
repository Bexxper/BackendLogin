// index.js - Mafia PS Style Full Login Skip Modal - Vercel & ENet Compatible
const express = require('express');
const compression = require('compression');
const rateLimiter = require('express-rate-limit');
const path = require('path');
const getRawBody = require('raw-body'); // untuk body raw dari ENet client

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression({ level: 5, threshold: 0 }));
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

// Helper parse body dari ENet client
async function parseENetBody(req) {
  if (req.is('application/json') || req.is('application/x-www-form-urlencoded')) {
    return req.body;
  }
  // fallback: baca raw text
  let raw = '';
  try {
    raw = (await getRawBody(req)).toString('utf-8');
  } catch (e) {
    console.log('Error parsing raw body:', e);
  }

  const data = {};
  raw.split('\n').forEach(line => {
    const [k, v] = line.split('|');
    if (k && v) data[k] = v;
  });
  return data;
}

// ---------------------------
// Root
app.get('/', (req, res) => {
  res.send('Welcome to Growtopia 2 - Mafia PS Style Login!');
});

// ---------------------------
// Dashboard endpoint (opsional fallback)
// Auto-bypass login modal browser
app.all('/player/login/dashboard', async (req, res) => {
  try {
    const data = await parseENetBody(req);
    const { growId, password } = data;

    if (growId && password) {
      // langsung ke validate
      return res.redirect(307, '/player/growid/login/validate');
    }

    // guest token jika tidak ada data
    const guestToken = Buffer.from(`growId=guest&password=guest`).toString('base64');
    res.json({
      status: 'success',
      message: 'Guest login auto-generated',
      token: guestToken,
      url: '',
      accountType: 'growtopia',
      accountAge: 0
    });
  } catch (err) {
    console.log('Error in /player/login/dashboard:', err);
    res.status(500).json({ status: 'failed', message: 'Server error' });
  }
});

// ---------------------------
// Validate login → generate token
app.all('/player/growid/login/validate', async (req, res) => {
  try {
    const data = await parseENetBody(req);
    const growId = data.growId || 'guest';
    const password = data.password || 'guest';

    const token = Buffer.from(`growId=${growId}&password=${password}`).toString('base64');

    res.json({
      status: "success",
      message: "Account Validated.",
      token,
      url: "",
      accountType: "growtopia",
      accountAge: 2
    });
  } catch (err) {
    console.log('Error in /player/growid/login/validate:', err);
    res.status(500).json({ status: 'failed', message: 'Server error' });
  }
});

// ---------------------------
// Check token → validasi & refresh
app.all('/player/growid/checktoken', async (req, res) => {
  try {
    const data = await parseENetBody(req);
    const refreshToken = data.refreshToken || '';
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
// VPS fallback (tidak untuk Vercel)
if (process.env.SERVER_TYPE !== 'vercel') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Mafia PS Style backend running on port ${PORT}`);
  });
}

// ---------------------------
// Export untuk Vercel / serverless
module.exports = app;
