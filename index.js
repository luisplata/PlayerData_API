require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors');
const knex = require('knex');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Configurar la conexión a la base de datos usando Knex
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
  }
});

// Endpoint para agregar un jugador
app.post('/api/player', async (req, res) => {
  const { playerId, nickname } = req.body;

  try {
    // Verificar si ya existe un jugador con el mismo nickname o playerId
    const existingPlayer = await db('players')
      .where({ nickname })
      .orWhere({ playerId })
      .first();

    if (existingPlayer) {
      return res.status(409).json({ message: "Nickname or Player ID already exists" });
    }

    // Insertar nuevo jugador
    const [newPlayer] = await db('players')
      .insert({ playerId, nickname })
      .returning(['id', 'playerId', 'nickname']);
      
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while adding player' });
  }
});

// Endpoint para validar si un nickname está disponible
app.get('/api/player/validate/:nickname', async (req, res) => {
  const { nickname } = req.params;

  try {
    const result = await db('players').where({ nickname }).first();
    res.json(!result); // Devuelve true si el nickname está disponible
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while validating nickname' });
  }
});

// Endpoint para obtener el Player ID por nickname
app.get('/api/player/:nickname', async (req, res) => {
  const { nickname } = req.params;

  try {
    const player = await db('players').where({ nickname }).first();
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json({ playerId: player.playerId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while getting player ID' });
  }
});

// Endpoint para obtener jugador por ID
app.get('/api/player/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const player = await db('players').where({ id }).first();
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while getting player by ID' });
  }
});

// Iniciar el servidor
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
