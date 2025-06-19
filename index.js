import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/token', async (req, res) => {
  try {
    const username = process.env.ANNATEL_USER;
    const password = process.env.ANNATEL_PASSWORD;

    const loginRes = await axios.post('https://tv.annatel.tv/api/v1/auth/login', {
      username,
      password
    });

    const token = loginRes.data.token;

    const urlsRes = await axios.get('https://tv.annatel.tv/api/v1/tv/liveWithUrls', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const longToken = urlsRes.data?.[0]?.url?.split('=')[1] ?? null;

    res.json({ token, longToken });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du token' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
