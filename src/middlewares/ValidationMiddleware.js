/**
 * ValidationMiddleware - Interface Adapter Layer
 * Input validation middleware
 */
class ValidationMiddleware {
  
  static validatePlayerLogin(req, res, next) {
    const { playerId } = req.body;
    
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID is required and must be a string',
          statusCode: 400
        }
      });
    }
    
    if (playerId.length < 3 || playerId.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID must be between 3 and 50 characters',
          statusCode: 400
        }
      });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID can only contain letters, numbers, underscores, and hyphens',
          statusCode: 400
        }
      });
    }
    
    next();
  }
  static validatePlayerId(req, res, next) {
    const { playerId } = req.params;
    
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID is required and must be a string',
          statusCode: 400
        }
      });
    }
    
    if (playerId.length < 3 || playerId.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID must be between 3 and 50 characters',
          statusCode: 400
        }
      });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID can only contain letters, numbers, underscores, and hyphens',
          statusCode: 400
        }
      });
    }
    
    next();
  }
  static validatePlayerLogin(req, res, next) {
    const { playerId } = req.body;
    
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID is required and must be a string',
          statusCode: 400
        }
      });
    }
    
    if (playerId.length < 3 || playerId.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID must be between 3 and 50 characters',
          statusCode: 400
        }
      });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID can only contain letters, numbers, underscores, and hyphens',
          statusCode: 400
        }
      });
    }
    
    next();
  }

  static validateNickname(req, res, next) {
    const { nickname } = req.params;

    console.log('nickname', nickname);
    
    if (!nickname || typeof nickname !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname is required and must be a string',
          statusCode: 400
        }
      });
    }
    
    if (nickname.length < 2 || nickname.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname must be between 2 and 50 characters',
          statusCode: 400
        }
      });
    }
    
    if (!/^[a-zA-Z0-9._-]+(?: [a-zA-Z0-9._-]+)*$/.test(nickname)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname can only contain letters, numbers, spaces, underscores, hyphens, and dots',
          statusCode: 400
        }
      });
    }
    
    next();
  }

  static validateBodyNickname(req, res, next) {
    const { nickname } = req.body;
    
    if (!nickname || typeof nickname !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname is required and must be a string',
          statusCode: 400
        }
      });
    }
    
    if (nickname.length < 2 || nickname.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname must be between 2 and 50 characters',
          statusCode: 400
        }
      });
    }
    
    if (!/^[a-zA-Z0-9._-]+(?: [a-zA-Z0-9._-]+)*$/.test(nickname)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname can only contain letters, numbers, spaces, underscores, hyphens, and dots',
          statusCode: 400
        }
      });
    }
    
    next();
  }

  static validatePlayerData(req, res, next) {
    const { playerId, nickname } = req.body;
    
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID is required and must be a string',
          statusCode: 400
        }
      });
    }
    
    if (!nickname || typeof nickname !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname is required and must be a string',
          statusCode: 400
        }
      });
    }
    
    if (playerId.length < 3 || playerId.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID must be between 3 and 50 characters',
          statusCode: 400
        }
      });
    }
    
    if (nickname.length < 2 || nickname.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname must be between 2 and 50 characters',
          statusCode: 400
        }
      });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(playerId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Player ID can only contain letters, numbers, underscores, and hyphens',
          statusCode: 400
        }
      });
    }
    
    if (!/^[a-zA-Z0-9._-]+(?: [a-zA-Z0-9._-]+)*$/.test(nickname)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Nickname can only contain letters, numbers, spaces, underscores, hyphens, and dots',
          statusCode: 400
        }
      });
    }
    
    next();
  }

  static validateExperience(req, res, next) {
    const { experience } = req.body;
    
    if (typeof experience !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Experience must be a number',
          statusCode: 400
        }
      });
    }
    
    if (experience < 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Experience must be a non-negative number',
          statusCode: 400
        }
      });
    }
    
    if (experience > 10000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Experience cannot exceed 10000',
          statusCode: 400
        }
      });
    }
    
    next();
  }

  static validateRewardData(req, res, next) {
    const { type, body, level } = req.body;
    
    const validTypes = ['gold', 'powerup', 'profilePicture', 'profileBackground', 'profileAvatar'];
    
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid reward type. Must be one of: ${validTypes.join(', ')}`,
          statusCode: 400
        }
      });
    }
    
    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Reward body must be an object',
          statusCode: 400
        }
      });
    }
    
    if (level !== undefined && (typeof level !== 'number' || level < 1)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Level must be a positive number',
          statusCode: 400
        }
      });
    }
    
    // Validate body based on type
    switch (type) {
      case 'gold':
        if (typeof body.amount !== 'number' || body.amount <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Gold reward amount must be a positive number',
              statusCode: 400
            }
          });
        }
        break;
      case 'powerup':
        if (!body.powerup || typeof body.powerup !== 'string') {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Powerup reward must have a valid powerup name',
              statusCode: 400
            }
          });
        }
        if (typeof body.quantity !== 'number' || body.quantity <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Powerup quantity must be a positive number',
              statusCode: 400
            }
          });
        }
        break;
      case 'profilePicture':
      case 'profileBackground':
      case 'profileAvatar':
        if (typeof body.id !== 'number' || body.id <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Profile item ID must be a positive number',
              statusCode: 400
            }
          });
        }
        break;
    }
    
    next();
  }
}

module.exports = ValidationMiddleware;
