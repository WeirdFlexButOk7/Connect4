const http = require("http");
const express = require("express");
const websocketServer = require("websocket").server;
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const httpServer = http.createServer(app);
const wsServer = new websocketServer({ httpServer });

const clients = {};
const games = {};

wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("Connection opened!"));
  connection.on("close", () => console.log("Connection closed!"));
  connection.on("message", (message) => {
    const result = JSON.parse(message.utf8Data);

    if (result.method === "create") {
      const clientId = result.clientId;
      const gameId = guid();
      console.log("in server.js " + gameId);
      games[gameId] = {
        id: gameId,
        clients: [[clientId, 1]], // client id, client player id
        prevPlayer: null,
      };

      const payload = {
        method: "create",
        game: games[gameId],
      };

      const con = clients[clientId].connection;
      con.send(JSON.stringify(payload));
    }

    if (result.method === "join") {
      const clientId = result.clientId;
      const gameId = result.gameId;
      console.log(gameId);
      if (!gameId) return;

      if (games[gameId].clients.length === 1) {
        if (!(games[gameId].clients[0][0] === clientId)) {
          games[gameId].clients.push([clientId, 2]);

          const joinPayload = {
            method: "join",
            game: games[gameId],
          };
          clients[clientId].connection.send(JSON.stringify(joinPayload));

          const notifyPayload = {
            method: "player-joined",
            game: games[gameId],
          };
          clients[games[gameId].clients[0][0]].connection.send(
            JSON.stringify(notifyPayload)
          );
        }
      } else if (games[gameId].clients.length === 2) {
        console.log("Game already started with 2 players!");
      } else {
        console.log("Invalid game id");
      }
    }

    if (result.method === "play") {
      const gameId = result.gameId;
      const col = result.col;
      let player;

      for (const [clientId, playerId] of games[gameId].clients) {
        if (clientId == result.clientId) player = playerId;
      }

      if (games[gameId].prevPlayer === player) return;
      games[gameId].prevPlayer = player;

      console.log(games[gameId].clients);

      for (const [clientId, playerId] of games[gameId].clients) {
        console.log(clientId);
        const payload = {
          method: "play",
          player: player,
          col: col,
        };
        clients[clientId].connection.send(JSON.stringify(payload));
      }
    }

    if (result.method === "end") {
      const gameId = result.gameId;
      let player;

      for (const [clientId, playerId] of games[gameId].clients) {
        if (clientId == result.clientId) player = playerId;
      }

      for (const [clientId, playerId] of games[gameId].clients) {
        console.log(clientId);
        const payload = {
          method: "end",
          player: player, //winner
          playerId: playerId,
        };
        clients[clientId].connection.send(JSON.stringify(payload));
      }
    }
  });

  const clientId = guid();
  clients[clientId] = { connection };

  const payload = {
    method: "connect",
    clientId: clientId,
  };

  connection.send(JSON.stringify(payload));
});

app.get("/server-status", (req, res) => {
  res.json({ status: "ready" });
});

const PORT = 9090;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function guid() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substring(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}
