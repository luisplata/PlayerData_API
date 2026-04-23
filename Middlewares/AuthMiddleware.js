const { expressjwt } = require('express-jwt');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

if (!secretKey || secretKey === 'your_secret_key') {
  throw new Error(
    'JWT_SECRET must be configured before loading AuthMiddleware'
  );
}

const authenticate = expressjwt({
  secret: secretKey,
  algorithms: ['HS256']
});

module.exports = authenticate;
