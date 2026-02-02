FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json .

RUN npm install

# Copiar el resto de los archivos
COPY . .

# Crear knexfile.js desde el ejemplo si no existe
RUN if [ ! -f knexfile.js ] && [ -f knexfile.js.example ]; then \
    cp knexfile.js.example knexfile.js; \
    fi

# Copiar y dar permisos al script de espera (convertir line endings)
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh || sed -i 's/\r$//' /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer el puerto donde correrá la API
EXPOSE 8080

# Usar el script de entrada para iniciar la aplicación
ENTRYPOINT ["/entrypoint.sh"]
