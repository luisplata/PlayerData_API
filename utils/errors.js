class RewardNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RewardNotFoundError';
    this.statusCode = 404;
  }
}

class RewardAlreadyAwardedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RewardAlreadyAwardedError';
    this.statusCode = 409;
  }
}

module.exports = {
  RewardNotFoundError,
  RewardAlreadyAwardedError
};