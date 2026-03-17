// index.js - Ultra-Minimal Mafia PS Style (ENet direct)
const express = require('express');
const getRawBody = require('raw-body');

const app = express();

// Helper: parse raw body from ENet client
function parseRaw(raw) {
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

// Parse ENet body safely
async function parseENetBody(req) {
  try {
    const raw = (await getRawBody(req)).toString('utf-8');
    return parseRaw(raw);
  } catch (err) {
    console.log('Error parsing ENet body:', err);
    return {};
  }
}

// Root - simple ping
app.get('/', (req, res) => {
  res.send('Mafia PS Style Growtopia Backend - Ultra Minimal');
});

// Dashboard - main login route
app.all('/player/login/dashboard', async (req, res) => {
  const data = await parseENetBody(req);
  const { growId, password } = data;

  if (growId && password) {
    // Returning player or first-time with account
    return res.redirect(307, '/player/growid/login/validate');
  }

  // Optional: fallback guest token
  const guestToken = Buffer.from('growId=guest&password=guest').toString('base64');
  res.json({
    status: 'success',
    message: 'Guest login auto-generated',
    token: guestToken,
    url: '',
    accountType: 'growtopia',
    accountAge: 0
  });
});

// Validate login - generate token
app.all('/player/growid/login/validate', async (req, res) => {
  const data = await parseENetBody(req);
  const growId = data.growId || 'guest';
  const password = data.password || 'guest';

  const token = Buffer.from(`growId=${growId}&password=${password}`).toString('base64');

  res.json({
    status: 'success',
    message: 'Account Validated.',
    token,
    url: '',
    accountType: 'growtopia',
    accountAge: 2
  });
});

// Check token
app.all('/player/growid/checktoken', async (req, res) => {
  const data = await parseENetBody(req);
  const refreshToken = data.refreshToken || '';
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
    const guestToken = Buffer.from('growId=guest&password=guest').toString('base64');
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

// Listen for VPS (optional)
if (process.env.SERVER_TYPE !== 'vercel') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Mafia PS Backend running on port ${PORT}`));
}

// Export for serverless
module.exports = app;
