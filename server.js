const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }

  // Si passwordHash vide, on autorise directement
  if (user.passwordHash === "") {
    return res.json({ success: true, username });
  }

  // Sinon on compare avec bcrypt
  const match = await bcrypt.compare(password, user.passwordHash);
  if (match) {
    return res.json({ success: true, username });
  } else {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);
  // Reste de ton code...
});
