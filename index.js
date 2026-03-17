const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/growtopia/server_data.php', (req, res) => {
  console.log("SERVER DATA HIT");

  res.send(
    "server|127.0.0.1\nport|17091\ntype|1\n#maint|Server Online"
  );
});

app.listen(80, () => {
  console.log("Server data running on port 80");
});
