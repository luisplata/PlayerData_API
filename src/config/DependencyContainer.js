/**
 * DependencyContainer - Dependency Injection Container
 * Manages dependencies and their initialization
 */
const db = require('../../DB/db.js');
const JwtService = require('../services/JwtService');

// Repositories
const PlayerRepository = require('../repositories/PlayerRepository');
const BattlePassRepository = require('../repositories/BattlePassRepository');
const BattlePassRewardRepository = require('../repositories/BattlePassRewardRepository');
const PlayerRewardRepository = require('../repositories/PlayerRewardRepository');

// Controllers
const PlayerController = require('../controllers/PlayerController');
const BattlePassController = require('../controllers/BattlePassController');
const HealthController = require('../controllers/HealthController');

class DependencyContainer {
  constructor() {
    this.services = {};
    this.repositories = {};
    this.controllers = {};
    this.initialize();
  }

  initialize() {
    // Initialize services
    this.services.jwtService = new JwtService();

    // Initialize repositories
    this.repositories.playerRepository = new PlayerRepository(db);
    this.repositories.battlePassRepository = new BattlePassRepository(db);
    this.repositories.battlePassRewardRepository = new BattlePassRewardRepository(db);
    this.repositories.playerRewardRepository = new PlayerRewardRepository(db);

    // Initialize controllers
    this.controllers.playerController = new PlayerController(
      this.repositories.playerRepository,
      this.services.jwtService,
      this.repositories.battlePassRepository,
      this.repositories.playerRewardRepository,
      this.repositories.battlePassRewardRepository
    );

    this.controllers.battlePassController = new BattlePassController(
      this.repositories.battlePassRepository,
      this.repositories.playerRewardRepository,
      this.repositories.battlePassRewardRepository
    );

    this.controllers.healthController = new HealthController();
  }

  getService(name) {
    return this.services[name];
  }

  getRepository(name) {
    return this.repositories[name];
  }

  getController(name) {
    return this.controllers[name];
  }
}

module.exports = DependencyContainer;
