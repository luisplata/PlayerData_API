const { expressjwt } = require('express-jwt');
require("dotenv").config();

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("❌ SECRET_KEY no está definido en variables de entorno");
}

// 👇 esto sí devuelve una función middleware en v7
const authenticate = expressjwt({
  secret: secretKey,
  algorithms: ['HS256'],
});

module.exports = authenticate;
