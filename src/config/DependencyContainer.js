/**
 * DependencyContainer - Dependency Injection Container
 * Manages dependencies and their initialization
 */
const db = require('../../DB/db.js');
const JwtService = require('../services/JwtService');
const AuthServiceV2 = require('../services/v2/AuthServiceV2');
const TransactionService = require('../services/TransactionService');

// Repositories
const PlayerRepository = require('../repositories/PlayerRepository');
const BattlePassRepository = require('../repositories/BattlePassRepository');
const BattlePassRewardRepository = require('../repositories/BattlePassRewardRepository');
const PlayerRewardRepository = require('../repositories/PlayerRewardRepository');
const HeroRepository = require('../repositories/HeroRepository');
const PassiveRepository = require('../repositories/PassiveRepository');
const DialogRepository = require('../repositories/DialogRepository');
const PlayerPassiveRepository = require('../repositories/PlayerPassiveRepository');
const PlayerHeroProgressRepository = require('../repositories/PlayerHeroProgressRepository');

// Controllers
const PlayerController = require('../controllers/PlayerController');
const BattlePassController = require('../controllers/BattlePassController');
const HealthController = require('../controllers/HealthController');
const HeroController = require('../controllers/HeroController');
const DialogController = require('../controllers/DialogController');
const PassiveController = require('../controllers/PassiveController');

// V2 Controllers
const PlayerV2Controller = require('../controllers/v2/PlayerV2Controller');

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
    this.services.authServiceV2 = new AuthServiceV2();
    this.services.transactionService = new TransactionService();

    // Initialize repositories
    this.repositories.playerRepository = new PlayerRepository(db);
    this.repositories.battlePassRepository = new BattlePassRepository(db);
    this.repositories.battlePassRewardRepository =
      new BattlePassRewardRepository(db);
    this.repositories.playerRewardRepository = new PlayerRewardRepository(db);
    this.repositories.heroRepository = new HeroRepository(db);
    this.repositories.passiveRepository = new PassiveRepository(db);
    this.repositories.dialogRepository = new DialogRepository(db);
    this.repositories.playerPassiveRepository = new PlayerPassiveRepository(db);
    this.repositories.playerHeroProgressRepository =
      new PlayerHeroProgressRepository(db);

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

    this.controllers.heroController = new HeroController(
      this.repositories.heroRepository
    );

    this.controllers.dialogController = new DialogController(
      this.repositories.dialogRepository,
      this.repositories.passiveRepository,
      this.repositories.playerPassiveRepository,
      this.services.transactionService,
      this.repositories.playerHeroProgressRepository,
      this.repositories.heroRepository
    );

    this.controllers.passiveController = new PassiveController(
      this.repositories.playerPassiveRepository,
      this.repositories.passiveRepository
    );

    // Initialize V2 controllers
    this.controllers.playerV2Controller = new PlayerV2Controller(
      this.repositories.playerRepository,
      this.services.authServiceV2,
      this.repositories.battlePassRepository,
      this.repositories.playerRewardRepository,
      this.repositories.battlePassRewardRepository
    );
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
