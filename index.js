// index.js - Mafia PS Style Full Final Version
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

// Helper: Safe parse raw body from ENet client
function safeParseRaw(raw) {
  const data = {};
  raw.split(/\r?\n/).forEach(line => {
    const parts = line.split('|');
    for (let i = 0; i < parts.length - 1; i += 2) {
      const key = parts[i]?.trim();
      const value = parts[i + 1]?.trim();
      if (key && value) data[key] = value;
    }
  });
  return data;
}

async function parseENetBody(req) {
  try {
    let raw = '';
    try {
      raw = (await getRawBody(req)).toString('utf-8');
    } catch (e) {
      console.log('Error reading raw body:', e);
    }
    return safeParseRaw(raw);
  } catch (err) {
    console.log('Error parsing ENet body:', err);
    return {};
  }
}

// Root
app.get('/', (req, res) => {
  res.send('Welcome to Growtopia 2 - Mafia PS Style Login!');
});

// Dashboard endpoint - bypass modal login
app.all('/player/login/dashboard', async (req, res) => {
  try {
    const data = await parseENetBody(req);
    console.log('Raw data received:', data);
    const { growId, password } = data;

    if (growId && password) {
      // Returning player → langsung validate
      return res.redirect(307, '/player/growid/login/validate');
    }

    // First-time player → fallback guest token
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

// VPS fallback (tidak untuk Vercel)
if (process.env.SERVER_TYPE !== 'vercel') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Mafia PS Style backend running on port ${PORT}`);
  });
}

// Export untuk Vercel / serverless
module.exports = app;
