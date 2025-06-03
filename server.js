const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "users.json");

// Fonction pour charger les utilisateurs depuis le fichier
function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.log("Erreur lecture users.json, fichier vide ou inexistant, création d'une liste vide.");
    return [];
  }
}

// Fonction pour sauver les utilisateurs dans le fichier
function saveUsersToFile(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

// Charge les users en mémoire au démarrage
let users = loadUsers();


// ROUTE LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Tentative login:", username);

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }

  if (user.passwordHash === "") {
    // Pas de mot de passe, accès direct
    return res.json({ success: true, username });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (match) {
    return res.json({ success: true, username });
  } else {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }
});

// ROUTE LIST USERS (pour admin)
app.get("/list-users", (req, res) => {
  // Envoie la liste sans les hash pour la sécurité
  const safeUsers = users.map((u) => ({ username: u.username }));
  res.json(safeUsers);
});

// ROUTE ADD USER
app.post("/add-user", async (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ success: false, message: "Nom d'utilisateur requis" });

  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, message: "Utilisateur déjà existant" });
  }

  let passwordHash = "";
  if (password && password.length > 0) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  users.push({ username, passwordHash });
  saveUsersToFile(users);

  res.json({ success: true, message: "Utilisateur ajouté" });
});

// ROUTE UPDATE USER (changer mot de passe)
app.post("/update-user", async (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ success: false, message: "Nom d'utilisateur requis" });

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });

  if (password && password.length > 0) {
    user.passwordHash = await bcrypt.hash(password, 10);
  } else {
    user.passwordHash = ""; // mot de passe vide = pas de mot de passe
  }

  saveUsersToFile(users);
  res.json({ success: true, message: "Utilisateur mis à jour" });
});

// ROUTE DELETE USER
app.post("/delete-user", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: "Nom d'utilisateur requis" });

  users = users.filter((u) => u.username !== username);
  saveUsersToFile(users);

  res.json({ success: true, message: "Utilisateur supprimé" });
});

// Pour servir l'admin.html si tu veux (optionnel)
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
