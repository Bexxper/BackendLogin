const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 SERVER DATA (PALING PENTING)
app.all('/growtopia/server_data.php', (req, res) => {
  console.log("SERVER DATA HIT");

  res.send(
    "server|127.0.0.1\nport|17091\ntype|1\n#maint|Server Online"
  );
});

// 🔥 DASHBOARD LOGIN
app.all('/player/login/dashboard', (req, res) => {
  console.log("DASHBOARD HIT");

  res.send(`
    <html>
      <body>
        <script>
          window.location.href = "/player/growid/login/validate";
        </script>
      </body>
    </html>
  `);
});

// 🔥 LOGIN VALIDATE
app.all('/player/growid/login/validate', (req, res) => {
  console.log("LOGIN VALIDATE HIT");

  res.setHeader('Content-Type', 'application/json');
  res.send(
    '{"status":"success","message":"Account Validated.","token":"bypass_token","url":"","accountType":"growtopia","accountAge":2}'
  );
});

// 🔥 CHECK TOKEN
app.all('/player/growid/checktoken', (req, res) => {
  console.log("CHECK TOKEN HIT");

  res.setHeader('Content-Type', 'application/json');
  res.send(
    '{"status":"success","message":"Account Validated.","token":"bypass_token","url":"","accountType":"growtopia","accountAge":2}'
  );
});

// ROOT
app.get('/', (req, res) => {
  res.send('GTPS Bypass Active');
});

// START SERVER
app.listen(80, () => {
  console.log('Server running on port 80');
});
