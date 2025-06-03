const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  const user = users.find(u => u.username === username);
  if (!user) return res.json({ success: false });

  const match = await bcrypt.compare(password, user.passwordHash);
  res.json({ success: match });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);
  // Reste de ton code...
});
