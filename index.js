// index.js - Mafia PS Style Final Version - ENet client compatible
const express = require('express');
const compression = require('compression');
const rateLimiter = require('express-rate-limit');
const path = require('path');
const getRawBody = require('raw-body');

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

// ---------------------------
// Helper: Parse body ENet client safely
async function parseENetBody(req) {
  try {
    // Jika body json atau form, pakai default
    if (req.is('application/json') || req.is('application/x-www-form-urlencoded')) {
      return req.body;
    }
    // fallback: raw text
    let raw = '';
    try {
      raw = (await getRawBody(req)).toString('utf-8');
    } catch (e) {
      console.log('Error reading raw body:', e);
    }
    const data = {};
    raw.split('\n').forEach(line => {
      if (!line.includes('|')) return; // skip line tanpa delimiter
      const [k, v] = line.split('|');
      if (k && v) data[k.trim()] = v.trim();
    });
    return data;
  } catch (err) {
    console.log('Error parsing ENet body:', err);
    return {}; // fallback kosong
  }
}

// ---------------------------
// Root
app.get('/', (req, res) => {
  res.send('Welcome to Growtopia 2 - Mafia PS Style Login!');
});

// ---------------------------
// Dashboard endpoint - langsung bypass modal
app.all('/player/login/dashboard', async (req, res) => {
  try {
    const data = await parseENetBody(req);
    const { growId, password } = data;

    if (growId && password) {
      // langsung ke validate
      return res.redirect(307, '/player/growid/login/validate');
    }

    // fallback guest token
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
    res.json({
      status: 'failed',
      message: 'Could not parse request'
    });
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
    const guestToken = Buffer.from(`growId=guest&password=guest`).toString('base64');
    res.json({
      status: 'success',
      message: 'Guest login fallback',
      token: guestToken,
      url: '',
      accountType: 'growtopia',
      accountAge: 0
    });
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
    // fallback guest
    const guestToken = Buffer.from(`growId=guest&password=guest`).toString('base64');
    res.json({
      status: 'success',
      message: 'Guest token fallback',
      token: guestToken,
      url: '',
      accountType: 'growtopia',
      accountAge: 0
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
