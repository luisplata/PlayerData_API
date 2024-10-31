FROM denoland/deno:alpine-1.35.0

WORKDIR /app

COPY . .

# Exponemos el puerto donde correrá la API
EXPOSE 8080

# Corremos el comando para iniciar la API
CMD ["run", "--allow-net", "index.ts"]