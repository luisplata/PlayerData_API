const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

let players = [];

// Endpoint para agregar un jugador
app.post('/api/player', (req, res) => {
  const player = req.body;
  const existingPlayer = players.find(p => p.nickname === player.nickname);
  if (existingPlayer) {
    return res.status(409).json({ message: "Nickname already exists" });
  }
  players.push(player);
  res.status(201).json(player);
});

// Endpoint para validar si un nickname está disponible
app.get('/api/player/validate/:nickname', (req, res) => {
  const { nickname } = req.params;
  const exists = players.some(p => p.nickname === nickname);
  res.json(!exists);
});

// Endpoint para obtener el PlayerId por nickname
app.get('/api/player/:nickname', (req, res) => {
  const { nickname } = req.params;
  const player = players.find(p => p.nickname === nickname);
  if (!player) {
    return res.status(404).json({ message: "Player not found" });
  }
  res.json(player.playerId);
});

// Iniciar el servidor solo si se ejecuta directamente
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
