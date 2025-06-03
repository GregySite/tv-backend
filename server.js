const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "users.json");
let users = [];

// Chargement des users au démarrage
try {
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  users = JSON.parse(data);
  console.log(`Loaded ${users.length} users`);
} catch (err) {
  console.error("Erreur en lisant users.json :", err);
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }

  if (user.passwordHash === "") {
    // Compte sans mot de passe (pour test)
    return res.json({ success: true, username });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (match) {
    return res.json({ success: true, username });
  } else {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
