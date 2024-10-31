FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Exponemos el puerto donde correrá la API
EXPOSE 8080

# Corremos el comando para iniciar la API
CMD ["node", "index.js"]