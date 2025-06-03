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

// Charger les utilisateurs depuis le fichier
function loadUsers() {
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// Sauvegarder les utilisateurs dans le fichier
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Route pour récupérer tous les utilisateurs
app.get('/admin/users', (req, res) => {
  const users = loadUsers();
  res.json(users);
});

// Ajouter ou modifier un utilisateur
app.post('/admin/users', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const existing = users.find(u => u.username === username);

  const passwordHash = password ? await bcrypt.hash(password, 10) : "";

  if (existing) {
    existing.passwordHash = passwordHash;
  } else {
    users.push({ username, passwordHash });
  }

  saveUsers(users);
  res.json({ success: true });
});

// Supprimer un utilisateur
app.delete('/admin/users/:username', (req, res) => {
  const { username } = req.params;
  let users = loadUsers();
  users = users.filter(u => u.username !== username);
  saveUsers(users);
  res.json({ success: true });
});

const path = require("path");
app.use(express.static(path.join(__dirname, ".")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
