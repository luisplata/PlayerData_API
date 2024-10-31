FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json .

RUN npm install

# Copiar el resto de los archivos
COPY . .

# Copiar y dar permisos al script de espera
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer el puerto donde correrá la API
EXPOSE 8080

# Usar el script de entrada para iniciar la aplicación
ENTRYPOINT ["/entrypoint.sh"]
