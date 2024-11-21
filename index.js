require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors');

const { generalLogger, customLogger } = require('./utils/logger.js');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Invalid token' });
  } else {
    next(err);
  }
});

const Player = require('./Router/PlayerApi.js');
const BattlePass = require('./Router/BattlePassRoutes.js');
const BattlePassReward = require('./Router/BattlePassRewardRoutes.js');
const PlayerReward = require('./Router/PlayerRewardRoutes.js');

app.use('/api/player', Player);
app.use('/api/battle-pass', BattlePass);
app.use('/api/battle-pass-reward', BattlePassReward);
app.use('/api/player-reward', PlayerReward);


// Iniciar el servidor
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
