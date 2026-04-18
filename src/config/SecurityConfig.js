function isWeakJwtSecret(secret) {
  if (!secret || typeof secret !== 'string') {
    return true;
  }

  const normalized = secret.trim().toLowerCase();
  return normalized.length < 16 || normalized === 'your_secret_key' || normalized === 'changeme';
}

function validateSecurityConfig(env = process.env) {
  if (isWeakJwtSecret(env.JWT_SECRET)) {
    throw new Error('JWT_SECRET must be configured with a strong non-default value');
  }
}

module.exports = {
  validateSecurityConfig,
  isWeakJwtSecret
};