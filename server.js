const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";
let users = [];

// Charger les utilisateurs depuis le fichier JSON au démarrage
if (fs.existsSync(USERS_FILE)) {
  const content = fs.readFileSync(USERS_FILE, "utf-8");
  try {
    users = JSON.parse(content);
  } catch (e) {
    console.error("Erreur de parsing de users.json :", e);
    users = [];
  }
}

// Sauvegarder les utilisateurs dans le fichier JSON
function saveUsersToFile(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// === LOGIN ===
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }

  if (user.passwordHash === "") {
    return res.json({ success: true, username });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (match) {
    return res.json({ success: true, username });
  } else {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }
});

// === AJOUT UTILISATEUR ===
app.post("/add-user", async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "Nom d'utilisateur requis" });
  }

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, message: "Utilisateur déjà existant" });
  }

  let passwordHash = "";
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  users.push({ username, passwordHash });
  saveUsersToFile(users);
  res.json({ success: true });
});

// === SUPPRESSION UTILISATEUR ===
app.post("/delete-user", (req, res) => {
  const { username } = req.body;
  const countBefore = users.length;
  users = users.filter((u) => u.username !== username);

  if (users.length < countBefore) {
    saveUsersToFile(users);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Utilisateur introuvable" });
  }
});

// === LISTER LES UTILISATEURS ===
app.get("/list-users", (req, res) => {
  const safeUsers = users.map((u) => ({ username: u.username }));
  res.json(safeUsers);
});

// === SERVIR admin.html ===
app.use(express.static(path.join(__dirname, "../tele"))); // si admin.html est dans ../tele

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
