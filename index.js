require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors');
const knex = require('knex');

const app = express();
const port = process.env.PORT || 8080;

const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';
const { expressjwt: expressJwt } = require('express-jwt');
const playerKey = 'your_player_key';

app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      next(err);
    }
});

// Configurar la conexión a la base de datos usando Knex
/*const db = knex({
  client: 'pg',
  connection: {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
  }
});*/
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    connectTimeout: 60000 // Aumenta el tiempo de espera de la conexión a 60 segundos
  }
});

// Middleware para proteger rutas
const authenticate = expressJwt({ secret: secretKey, algorithms: ['HS256'] });

// Endpoint para autenticar usuarios y generar un token JWT basado en playerId
app.post('/api/login', async (req, res) => {
    const { playerId } = req.body;
  
    try {
      const player = await db('players').where({ playerId }).first();
      if (!player) {
        return res.status(401).json({ message: 'Invalid playerId' });
      }
  
      const token = jwt.sign({ playerId }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while authenticating' });
    }
});

// Endpoint para agregar un jugador
app.post('/api/player', async (req, res) => {
    const { playerId, nickname, key } = req.body;
  
    // Validar la clave
    if (key !== playerKey) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
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
app.get('/api/player/validate/:nickname', authenticate, async (req, res) => {
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
app.get('/api/player/:nickname', authenticate, async (req, res) => {
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
app.get('/api/player/id/:playerId', authenticate, async (req, res) => {
  const { playerId } = req.params;

  try {
    const player = await db('players').where({ playerId }).first();
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while getting player by ID' });
  }
});

// Endpoint para actualizar el nickname de un jugador por playerId
app.put('/api/player/nickname/:playerId', authenticate, async (req, res) => {
    const { playerId } = req.params;
    const { nickname } = req.body;
  
    try {
      const updatedRows = await db('players')
        .where({ playerId })
        .update({ nickname });
  
      if (updatedRows === 0) {
        return res.status(404).json({ message: "Player not found" });
      }
  
      res.json({ message: "Nickname updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while updating nickname' });
    }
  });

// Iniciar el servidor
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
