let board = document.getElementById("board");
document.getElementById("multi-player").style.display = "none";
document.getElementById("single-player").style.display = "none";
document.getElementById("await-player").style.display = "none";
let rows = 6;
let cols = 7;
let curr_board = []; //col x rows
let available_row = [];
// curr_board[i][j] = player1 (1) / player2 (2) / unvisited (0)
let player = 1;
let weights = [];
const baseDepth = 9; 
const incDepth = 5;
let Depth = baseDepth;
let moves_elapsed = 0;
const directions = [
  [0, 1], [1, 1], [1, 0], [1, -1],
  [0, -1], [-1, -1], [-1, 0], [-1, 1]
];

let clientId = null;
let gameId = null;
let ws;

for (let i = 0; i < cols; i++) {
  let col = document.createElement("div");
  col.classList.add("column");
  col.id = i;
  let temp = [];
  let t2 = [];
  for (let j = 0; j < rows; j++) {
    let cell = document.createElement("div");
    cell.id = `${i}-${j}`;
    cell.classList.add("cell");
    cell.classList.add("unvisited");
    col.appendChild(cell);
    temp.push(0);
    t2.push(0);
  }
  available_row.push(5);
  curr_board.push(t2);
  weights.push(temp);
  col.addEventListener("click", (e) => {
    handleClick(e);
  });
  board.appendChild(col);
}

initWeights();

// functions

function multiPlayer() {
  document.getElementById("menu-page").style.display = "none";
  document.getElementById("multi-player").style.display = "flex";

  // fetch("http://localhost:9090/server-status")  //if you want to use in localhost
  fetch("https://connect-four-now.up.railway.app/server-status")
    .then((response) => response.json())
    .then((data) => {
      console.log("Server status:", data.status);
      // ws = new WebSocket("ws://localhost:9090");  //if you want to use in localhost
      ws = new WebSocket("wss://connect-four-now.up.railway.app");

      ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.onmessage = (message) => {
        const response = JSON.parse(message.data);
        console.log("WebSocket message:", response);

        if (response.method === "connect") {
          clientId = response.clientId;
          console.log("Client id Set successfully " + clientId);
        }

        if (response.method === "create") {
          gameId = response.game.id;
          console.log("game successfully created with id " + response.game.id);
          document.getElementById("multi-player").style.display = "none";
          document.getElementById("single-player").style.display = "none";
          document.getElementById("menu-page").style.display = "none";
          document.getElementById("await-player").style.display = "flex";
          document.getElementById("game-id").textContent = "game id: " + gameId;
        }

        if (response.method === "join") {
          gameId = response.game.id;
          console.log("game successfully joined with id " + response.game.id);
          gameStarts("You joined the game successfully!");
        }

        if (response.method === "player-joined") {
          console.log("Second player has joined! Starting game...");
          gameStarts("Someone joined your game!");
        }

        if (response.method === "play") {
          const col = response.col;
          player = response.player;
          console.log("move from " + player + " " + clientId);
          move(col);

          const info_player = document.getElementById("info-player");
          const thisPlayer = response.playerId;

          if(player === 1) { //red
            info_player.style.color = "red";
            info_player.textContent = (player === thisPlayer ? "Your" : "Red");
          } else { //blue
            info_player.style.color = "blue";
            info_player.textContent = (player === thisPlayer ? "Your" : "Blue");
          }

          document.getElementById("info-turn").textContent = (player === thisPlayer ? "" : "\' s") + " turn";
        }

        if (response.method === "check-status") {
          const col = +response.col;
          const c = check_8_directions(col, available_row[col]+1);
          console.log(c, col, available_row[col]+1);
          if (c >= 0) {
            const payload = {
              method: "end",
              gameId: gameId,
              player: c,
              col: col
            };
            ws.send(JSON.stringify(payload));
          }
        }

        if (response.method === "end") {
          const thisPlayer = response.playerId;
          const winner = response.player;
          const col = response.col;
          declareWinner(thisPlayer, winner, col);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        alert("Could not connect to game server. Please try again later.");
      };
    })
    .catch((error) => {
      console.error("Error connecting to server:", error);
      alert("Game server is not running. Please start the server first.");
      document.getElementById("menu-page").style.display = "flex";
      document.getElementById("multi-player").style.display = "none";
    });
}

function gameStarts(msg) {
  console.log(msg);
  document.getElementById("multi-player").style.display = "none";
  await_player = document.getElementById("await-player");
  await_player.style.display = "flex";
  await_player.innerHTML = "";

  const message = document.createElement("h2");
  message.textContent = msg;
  message.style.color = "green";
  await_player.appendChild(message);

  const countdown = document.createElement("h1");
  countdown.style.color = "red";
  await_player.appendChild(countdown);

  let seconds = 3;

  const interval = setInterval(() => {
      countdown.textContent = "Game starts in " + seconds;

      if (seconds === 0) {
          countdown.textContent = "Go!";
          document.getElementById("modal").style.display = "none";
          const infoDiv = document.getElementById("info");
          const infoText = document.createElement("h2");
          const playerText = document.createElement("span"); playerText.id = "info-player"; 
          const turnText = document.createElement("span"); turnText.id = "info-turn";
          turnText.textContent = "Anyone can start";
          infoText.appendChild(playerText);
          infoText.appendChild(turnText);
          infoDiv.appendChild(infoText); 
          infoDiv.style.display = "block"; 
          clearInterval(interval);
      }

      seconds--;
  }, 1000);

}

function singlePlayer() {
  document.getElementById("menu-page").style.display = "none";
  document.getElementById("single-player").style.display = "flex";
}

function userFirst() {
  document.getElementById("modal").style.display = "none";
  player ^= 3;
}

function aiFirst() {
  document.getElementById("modal").style.display = "none";
  move(3);
}

function createGame() {
  const payLoad = {
    method: "create",
    clientId: clientId,
  };
  ws.send(JSON.stringify(payLoad));
}

function joinGame() {
  if(!document.getElementById("gameIdInput").value) return;
  if (gameId === null) gameId = document.getElementById("gameIdInput").value;
  const payLoad = {
    method: "join",
    clientId: clientId,
    gameId: gameId,
  };
  ws.send(JSON.stringify(payLoad));
}

function move(col) {
  let i = col;
  let j = available_row[i];
  if (j < 0) return 0;
  if (moves_elapsed === 42) return 0;

  let cell = document.getElementById(`${i}-${j}`);
  available_row[i]--;
  cell.classList.remove("unvisited");
  if (player == 1) {
    cell.classList.add("player1");
  } else {
    cell.classList.add("player2");
  }
  curr_board[i][j] = player;
  player ^= 3;
  ++moves_elapsed;
  Depth = Math.floor(moves_elapsed / incDepth) + baseDepth;
  return 1;
}

function handleClick(e) {
  let id = +e.target.id.toString()[0];

  if (gameId !== null) {
    //multiplayer mode
    console.log("at manual play");
    const payload = {
      method: "play",
      gameId: gameId,
      col: id,
      clientId: clientId,
    };
    ws.send(JSON.stringify(payload));
  } else {
    let status = move(id);
    if (status == 0) return;
    let c = check_8_directions(id, available_row[id]+1);
    if (c >= 0) {
      declareWinner(2, c, id);
      return;
    }
    id = AI_move();
    c = check_8_directions(id, available_row[id]+1);
    if (c >= 0) declareWinner(2, c, id);
  }
}

function declareWinner(thisPlayer, winner, col) {
  let result;
  if (winner === 0) result = document.getElementById("draw");
  else {
    showWinningBoard(col);
    setTimeout(() => {
      if (winner === thisPlayer) result = document.getElementById("win");
      else result = document.getElementById("lost");
      result.classList.add("show");
    }, 3000);
  }
}

function showWinningBoard(col) {
  const i = col; const j = available_row[col]+1;
  let cells = [[i,j]];
  const target = curr_board[i][j];
  let found = 0;

  for (let [dx, dy] of directions) {
    const ni = i + dx * 3;
    const nj = j + dy * 3;
    if (0 <= ni && ni < cols && 0 <= nj && nj < rows) {
      let match = true;
      for (let z = 1; z < 4; z++) {
        if (curr_board[i + dx * z][j + dy * z] !== target) {
          match = false;
          break;
        }
        if(z == 2 && 0 <= i-dx && i-dx < cols && 0 <= j-dy && j-dy < rows) {
          if (curr_board[i-dx][j-dy] === target) {
            cells.push([i-dx, j-dy]);
            cells.push([i+dx, j+dy]);
            cells.push([i+dx+dx, j+dy+dy]);
            found = 1; break;
          }
        }
      }
      if(found) break;
      if (match) {
        for (let k = 1; k < 4; k++) cells.push([i+dx*k, j+dy*k]);
        found = 1; break;
      }
    }
  }
  for (let [x,y] of cells) {
    cell = document.getElementById(`${x}-${y}`);
    cell.classList.add("mark");
  }
  moves_elapsed = 42;
}

function minimax(to_max, depth, alpha, beta, co) {
  let x = to_max ? -Infinity : Infinity;
  let chk = check_8_directions(co, available_row[co]+1);
  // console.log(to_max, depth, alpha, beta, co, chk);
  if(chk >= 1) return x;
  if(chk === 0) return 0;

  if (to_max) {
    for (let i = 0; i < cols; i++) {
      if (available_row[i] < 0) continue;

      if (depth == 0) {
        x = Math.max(x, weights[i][available_row[i]]);
        continue;
      }

      curr_board[i][available_row[i]] = 1;
      available_row[i]--;
      let val = minimax(!to_max, depth - 1, alpha, beta, i);
      available_row[i]++;
      curr_board[i][available_row[i]] = 0;
      val += (2 * depth / Depth / 3) * weights[i][available_row[i]];

      x = Math.max(x, val);
      alpha = Math.max(alpha, x);

      if (beta <= alpha) break;
    }
  } else {
    for (let i = 0; i < cols; i++) {
      if (available_row[i] < 0) continue;

      if (depth == 0) {
        x = Math.min(x, weights[i][available_row[i]]);
        continue;
      }

      curr_board[i][available_row[i]] = 2;
      available_row[i]--;
      let val = minimax(!to_max, depth - 1, alpha, beta, i);
      available_row[i]++;
      curr_board[i][available_row[i]] = 0;
      val += (2 * depth / Depth / 3) * weights[i][available_row[i]];

      x = Math.min(x, val);
      beta = Math.min(beta, x);

      if (beta <= alpha) break;
    }
  }
  return x;
}

function AI_move() {
  let poss = [];

  for (let i = 0; i < cols; i++) {
    poss.push(-Infinity);
    if (available_row[i] < 0) continue;

    curr_board[i][available_row[i]] = 1;
    available_row[i]--;
    let val = minimax(false, Depth, -Infinity, Infinity, i);
    available_row[i]++;
    curr_board[i][available_row[i]] = 0;

    val += weights[i][available_row[i]];
    poss[i] = val;
  }

  console.log(poss);

  let col = -1; let val = -Infinity;
  let vals = [];

  for (let i = 0; i < cols; i++) {
    if (available_row[i] < 0) continue;
    if (val < poss[i]) {
      val = poss[i]; col = i;
      vals = [[available_row[i], i]];
    } else if(val === poss[i]) {
      vals.push([available_row[i], i]);
    }
  }

  vals.sort((a, b) => b[0] - a[0]);
  move(vals[0][1]);
  return vals[0][1];

}

function check_8_directions(i, j) {
  if (moves_elapsed === 42) {
    return 0;
  }
  const target = curr_board[i][j];
  for (let [dx, dy] of directions) {
    const ni = i + dx * 3;
    const nj = j + dy * 3;
    if (0 <= ni && ni < cols && 0 <= nj && nj < rows) {
      let match = true;
      for (let z = 1; z < 4; z++) {
        if (curr_board[i + dx * z][j + dy * z] !== target) {
          match = false;
          break;
        }
        if(z == 2 && 0 <= i-dx && i-dx < cols && 0 <= j-dy && j-dy < rows) {
          if (curr_board[i-dx][j-dy] === target) return target;
        }
      }
      if (match) return target;
    }
  }

  return -1;
}

function initWeights() {
  //initialise weights
  for (let i = 0; i < cols; i++) {
    for (let j = 3; j < rows; j++) {
      for (let k = 0; k < 4; k++) {
        weights[i][j - k]++;
      }
    }
  }

  for (let j = 0; j < rows; j++) {
    for (let i = 3; i < cols; i++) {
      for (let k = 0; k < 4; k++) {
        weights[i - k][j]++;
      }
    }
  }

  for (let i = 3; i < cols; i++) {
    for (let j = 3; j < rows; j++) {
      for (let k = 0; k < 4; k++) {
        weights[i - k][j - k]++;
      }
    }
  }

  for (let i = 0; i < cols - 3; i++) {
    for (let j = 3; j < rows; j++) {
      for (let k = 0; k < 4; k++) {
        weights[i + k][j - k]++;
      }
    }
  }

  let tmp;

  for (let i = cols - 1; i >= 0; --i) {
    tmp = 1;
    for (let j = rows - 1 - Math.abs(i - cols + 4); j >= 0; --j) {
      weights[i][j]+=tmp++;
    }
  }
  for (let j = rows - 2; j >= 0; --j) {
    weights[3][j]++;
  }
  for (let j = 4; j >= 1; --j) {
    for (let i = 1; i <= 5; i++) {
      weights[i][j]+=5-j;
    }
  }
  weights[3][0] = 6;
  for (let i of weights) {
    console.log(i);
  }
}
