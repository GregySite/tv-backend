const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const USERS_FILE = "./users.json";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // pour servir admin.html si nécessaire

let users = [];

// Charger les utilisateurs depuis le fichier
function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    users = JSON.parse(data);
  } else {
    users = [];
  }
}

// Sauvegarder les utilisateurs dans le fichier
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Initialisation
loadUsers();

// Authentification
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

// Liste des utilisateurs (admin)
app.get("/list-users", (req, res) => {
  const safeUsers = users.map((u) => ({ username: u.username }));
  res.json(safeUsers);
});

// Ajouter ou modifier un utilisateur
app.post("/save-user", async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "Nom d'utilisateur requis" });
  }

  let user = users.find((u) => u.username === username);
  if (!user) {
    user = { username, passwordHash: "" };
    users.push(user);
  }

  if (password) {
    user.passwordHash = await bcrypt.hash(password, 10);
  }

  saveUsers();
  res.json({ success: true });
});

// Supprimer un utilisateur
app.post("/delete-user", (req, res) => {
  const { username } = req.body;
  users = users.filter((u) => u.username !== username);
  saveUsers();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
