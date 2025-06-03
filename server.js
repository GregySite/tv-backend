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
function loadUsersFromFile() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    } catch (e) {
      console.error("Erreur lecture users.json:", e);
      users = [];
    }
  }
}
function saveUsersToFile() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
loadUsersFromFile();

// ✅ LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) return res.status(401).json({ success: false, message: "Identifiants incorrects" });

  if (!user.passwordHash) return res.json({ success: true, username });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (match) {
    return res.json({ success: true, username });
  } else {
    return res.status(401).json({ success: false, message: "Identifiants incorrects" });
  }
});

// ✅ LIST USERS
app.get('/list-users', (req, res) => {
  const safeUsers = users.map(u => ({ username: u.username }));
  res.json(safeUsers);
});

// ✅ ADD USER
app.post('/add-user', async (req, res) => {
  const { username, password } = req.body;

  if (!username) return res.status(400).json({ success: false, message: "Nom requis" });
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: "Utilisateur existant" });
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : "";
  users.push({ username, passwordHash });
  saveUsersToFile();
  res.json({ success: true });
});

// ✅ DELETE USER
app.post('/delete-user', (req, res) => {
  const { username } = req.body;
  users = users.filter(u => u.username !== username);
  saveUsersToFile();
  res.json({ success: true });
});

// ✅ SERVE admin.html
app.use(express.static(path.join(__dirname, ".")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
