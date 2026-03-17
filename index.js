const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// ENet server info
const ENET_SERVER_IP = "70.153.137.6";
const ENET_SERVER_PORT = 17091;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Dashboard page (GET only)
app.get('/player/login/dashboard', (req, res) => {
    res.render(path.join(__dirname, 'public/html/dashboard.ejs'));
});

// Login normal
app.post('/player/growid/login/validate', (req, res) => {
    const { growId, password } = req.body;
    if(!growId || !password) return res.json({status:'failed', message:'Missing growId/password'});

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

// Guest login
app.post('/player/growid/login/guest', (req, res) => {
    const growId = `guest${Math.floor(Math.random()*9999)}`;
    const password = 'guest';
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

// Root
app.get('/', (req, res) => res.send('Welcome to Secret PS!'));

// Start server
app.listen(5000, () => console.log('Server running on port 5000'));
