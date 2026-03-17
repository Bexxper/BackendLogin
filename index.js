const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// Config server IP dan port CPS
const ENET_SERVER = '70.153.137.6:17091';

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

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, headers: true }));

// Favicon
app.get('/favicon.:ext', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Dashboard (opsional, bisa dilewatkan untuk auto-login)
app.get('/player/login/dashboard', (req, res) => {
  res.render(path.join(__dirname, 'public/html/dashboard.ejs'));
});

// Login dengan growId/password
app.post('/player/growid/login/validate', (req, res) => {
  const growId = req.body.growId || '';
  const password = req.body.password || '';
  const _token = Buffer.from(`_token=&growId=${growId}&password=${password}`).toString('base64');

  // Simpan akun di server (contoh simpan ke memory atau db)
  // accounts[growId] = { password, token: _token }; // bisa pakai database nyata

  res.json({
    status: 'success',
    message: 'Account Validated.',
    token: _token,
    url: ENET_SERVER, // <---- HARUS ADA supaya langsung connect ke CPS
    accountType: 'growtopia',
    accountAge: 2
  });
});

// Guest login / register button
app.post('/player/growid/login/guest', (req, res) => {
  const growId = `guest_${Date.now()}`;
  const password = 'guest';
  const _token = Buffer.from(`_token=&growId=${growId}&password=${password}`).toString('base64');

  // Simpan guest di server jika perlu
  // accounts[growId] = { password, token: _token };

  res.json({
    status: 'success',
    message: 'Guest login auto-generated',
    token: _token,
    url: ENET_SERVER, // <---- HARUS ADA supaya langsung connect ke CPS
    accountType: 'growtopia',
    accountAge: 0
  });
});

// Check token dan refresh
app.post('/player/growid/checktoken', (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = Buffer.from(refreshToken, 'base64').toString('utf-8');
    // bisa tambahkan validasi growId/password disini
    res.json({
      status: 'success',
      message: 'Account Validated.',
      token: refreshToken,
      url: ENET_SERVER, // <---- HARUS ADA supaya langsung connect ke CPS
      accountType: 'growtopia',
      accountAge: decoded.includes('guest') ? 0 : 2
    });
  } catch (err) {
    console.log('Invalid token, redirect to dashboard');
    res.render(path.join(__dirname, 'public/html/dashboard.ejs'));
  }
});

// Root
app.get('/', (req, res) => {
  res.send('Welcome to Secret PS Growtopia 2!');
});

// Start server
app.listen(5000, () => {
  console.log('Secret PS Login backend running on port 5000');
});
