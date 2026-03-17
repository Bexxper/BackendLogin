const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 BYPASS LOGIN VALIDATE
app.all('/player/growid/login/validate', (req, res) => {
  res.send({
    status: "success",
    message: "Account Validated.",
    token: "bypass_token",
    url: "",
    accountType: "growtopia",
    accountAge: 999
  });
});

// 🔥 BYPASS CHECK TOKEN
app.all('/player/growid/checktoken', (req, res) => {
  res.send({
    status: "success",
    message: "Account Validated.",
    token: "bypass_token",
    url: "",
    accountType: "growtopia",
    accountAge: 2
  });
});

// 🔥 OPTIONAL: DASHBOARD LANGSUNG LEWAT
app.all('/player/login/dashboard', (req, res) => {
  res.send("OK");
});

// 🔥 SEMUA REQUEST LAIN → OK AJA
app.all('*', (req, res) => {
  res.send("OK");
});

// ROOT
app.get('/', (req, res) => {
  res.send('Bypass Login Active');
});

app.listen(5000, () => {
  console.log('Bypass server running on port 5000');
});
