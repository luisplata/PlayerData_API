// middlewares/authMiddleware.js
const { expressjwt: expressJwt } = require('express-jwt');

const secretKey = 'your_secret_key';

const authenticate = expressJwt({ secret: secretKey, algorithms: ['HS256'] });

module.exports = authenticate;