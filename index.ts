import { Application, Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";

interface Player {
  playerId: number;
  nickname: string;
}

const players: Player[] = [];

const router = new Router();

router
  .post("/api/player", (context) => {
    const body = context.request.body();
    if (body.type === "json") {
      body.value.then((player: Player) => {
        const existingPlayer = players.find(p => p.nickname === player.nickname);
        if (existingPlayer) {
          context.response.status = 409;
          context.response.body = { message: "Nickname already exists" };
        } else {
          players.push(player);
          context.response.status = 201;
          context.response.body = player;
        }
      });
    }
  })
  .get("/api/player/validate/:nickname", (context) => {
    const { nickname } = context.params;
    const exists = players.some(p => p.nickname === nickname);
    context.response.body = !exists;
  })
  .get("/api/player/:nickname", (context) => {
    const { nickname } = context.params;
    const player = players.find(p => p.nickname === nickname);
    if (player) {
      context.response.body = player.playerId;
    } else {
      context.response.status = 404;
      context.response.body = { message: "Player not found" };
    }
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8080");
await app.listen({ port: 8080 });