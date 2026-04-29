const chai = require('chai');

module.exports = {
  createAndLogin: async (app, playerId, opts = {}) => {
    const apiKey = process.env.PLAYER_API_KEY || 'dev_player_key_change_in_production';
    const nickname = opts.nickname || `nick_${playerId}`;
    // If `app` is a string we assume a running server URL; otherwise use in-process app
    if (typeof app === 'string') {
      // create player (ignore if already exists in dev)
      const createRes = await chai
        .request(app)
        .post('/api/v1/player')
        .send({ playerId, nickname, key: apiKey });

      

      // login and return token
      const loginRes = await chai
        .request(app)
        .post('/api/v1/player/login')
        .send({ playerId });

      

      return loginRes.body && loginRes.body.data && loginRes.body.data.token;
    }

    // In-process app: create player directly in DB and sign a JWT to avoid API key checks
    try {
      const db = require('../../DB/db');
      // Upsert player record
      const existing = await db('players').where({ playerId }).first();
      if (!existing) {
        await db('players').insert({ playerId, nickname, created_at: new Date(), updated_at: new Date() });
      }

      // Sign a JWT token using the project's JwtService
      const JwtService = require('../../src/services/JwtService');
      const jwtService = new JwtService();
      const token = jwtService.generateToken({ playerId });
      return token;
    } catch (err) {
      return undefined;
    }
  }
};
