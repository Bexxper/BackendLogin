const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 LOGIN VALIDATE (WAJIB FORMAT INI)
app.all('/player/growid/login/validate', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(
    '{"status":"success","message":"Account Validated.","token":"bypass_token","url":"","accountType":"growtopia","accountAge":2}'
  );
});

// 🔥 CHECK TOKEN (WAJIB JUGA)
app.all('/player/growid/checktoken', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(
    '{"status":"success","message":"Account Validated.","token":"bypass_token","url":"","accountType":"growtopia","accountAge":2}'
  );
});

// 🔥 DASHBOARD → KASIH RESPONSE KOSONG / HTML
app.all('/player/login/dashboard', (req, res) => {
  res.send('<html><body>OK</body></html>');
});

// 🔥 JANGAN override semua route jadi "OK"
app.get('/', (req, res) => {
  res.send('Bypass Active');
});

app.listen(5000, () => {
  console.log('Bypass server running on port 5000');
});
