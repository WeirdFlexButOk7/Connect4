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

  fetch("http://localhost:9090/server-status")
    .then((response) => response.json())
    .then((data) => {
      console.log("Server status:", data.status);
      ws = new WebSocket("ws://localhost:9090");

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
          document.getElementById("modal").style.display = "none";
        }

        if (response.method === "player-joined") {
          console.log("Second player has joined! Starting game...");
          document.getElementById("modal").style.display = "none";
        }

        if (response.method === "play") {
          const col = response.col;
          player = response.player;
          console.log("move from " + player + " " + clientId);
          move(col);
          console.log("made move");
        }

        if (response.method === "end") {
          const thisPlayer = response.playerId;
          const winner = response.player;
          declareWinner(thisPlayer, winner);
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
  console.log(payLoad);
  ws.send(JSON.stringify(payLoad));
}

function joinGame() {
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
  return 1;
}

function handleClick(e) {
  let id = e.target.id.toString()[0];

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
    let c = check_status(curr_board);
    if (c >= 0) {
      const payload = {
        method: "end",
        gameId: gameId,
        clientId: clientId,
      };
      ws.send(JSON.stringify(payload));
    }
  } else {
    let status = move(id);
    if (status == 0) return;
    let c = check_status(curr_board);
    if (c >= 0) declareWinner(c, 1);
    AI_move();
    c = check_status(curr_board);
    if (c >= 0) declareWinner(c, 1);
  }
}

function declareWinner(c, winner) {
  let result;
  if (c == 0) result = document.getElementById("draw");
  else if (c == winner) result = document.getElementById("win");
  else result = document.getElementById("lost");
  result.classList.add("show");
  result.addEventListener("click", (e) => {
    location.reload();
  });
}

function minimax(to_max, depth, alpha, beta) {
  let x = to_max ? -Infinity : Infinity;

  if (to_max) {
    for (let i = 0; i < cols; i++) {
      let j = available_row[i];
      if (j < 0) continue;

      if (depth == 0) {
        x = Math.max(x, weights[i][j]);
        continue;
      }

      available_row[i]--;
      let val = -minimax(!to_max, depth - 1, alpha, beta);
      available_row[i]++;
      val += weights[i][j];

      x = Math.max(x, val);
      alpha = Math.max(alpha, x);

      if (beta <= alpha) break;
    }
  } else {
    for (let i = 0; i < cols; i++) {
      let j = available_row[i];
      if (j < 0) continue;

      if (depth == 0) {
        x = Math.min(x, weights[i][j]);
        continue;
      }

      available_row[i]--;
      let val = minimax(!to_max, depth - 1, alpha, beta);
      available_row[i]++;
      val -= weights[i][j];

      x = Math.min(x, val);
      beta = Math.min(beta, x);

      if (beta <= alpha) break;
    }
  }
  return x;
}

function AI_move() {
  let temp_board = curr_board.map((row) => row.slice());

  for (let i = 0; i < cols; i++) {
    let j = available_row[i];
    if (j < 0) continue;
    temp_board[i][j] = 2;
    let res = check_status(temp_board);
    temp_board[i][j] = 0;
    if (res == 2) {
      move(i);
      return;
    }
    temp_board[i][j] = 1;
    res = check_status(temp_board);
    temp_board[i][j] = 0;
    if (res == 1) {
      move(i);
      return;
    }
  }

  let x = -Infinity;
  let poss = [];

  for (let i = 0; i < cols; i++) {
    poss.push(0);
    let j = available_row[i];
    if (j < 0) continue;

    available_row[i]--;
    let val = -minimax(false, 12, -Infinity, Infinity);
    available_row[i]++;
    val += weights[i][j];
    poss[i] = val;
  }

  let dont = [];

  for (let i = 0; i < cols; i++) {
    dont.push(1);
    let j = available_row[i];
    if (j < 0) continue;

    temp_board[i][j] = 1;
    available_row[i]--;
    let dont2 = 0;
    for (let k = 0; k < cols; k++) {
      let l = available_row[k];
      if (l < 0) continue;
      temp_board[k][l] = 2;
      let res = check_status(temp_board);
      temp_board[k][l] = 0;
      if (res == 2) {
        dont2 = 1;
        break;
      }
    }
    temp_board[i][j] = 0;
    available_row[i]++;
    dont[i] = dont2;
  }

  let col = -1;
  let cant_col = -1;
  let val = -Infinity;

  for (let i = 0; i < cols; i++) {
    let j = available_row[i];
    if (j < 0) continue;
    if (cant_col == -1) cant_col = i;
    if (dont[i]) continue;
    if (val < poss[i]) {
      val = poss[i];
      col = i;
    }
  }

  if (col == -1) move(cant_col);
  move(col);
}

function check_index(i, j) {
  return 0 <= i && i < cols && 0 <= j && j < rows;
}

function check_status(board_) {
  //return player who won, 0 if draw, -1 if game continues.
  //horizontal check
  for (let i = 0; i < cols; i++) {
    let c = 0;
    let maxc = 0;
    for (let k = 1; k <= 2; k++) {
      c = 0;
      for (let j = 0; j < rows; j++) {
        if (board_[i][j] == k) c++;
        else c = 0;
        maxc = Math.max(maxc, c);
      }
      if (maxc == 4) return k;
    }
  }
  //vertical check
  for (let j = 0; j < rows; j++) {
    let c = 0;
    let maxc = 0;
    for (let k = 1; k <= 2; k++) {
      c = 0;
      for (let i = 0; i < cols; i++) {
        if (board_[i][j] == k) c++;
        else c = 0;
        maxc = Math.max(maxc, c);
      }
      if (maxc == 4) return k;
    }
  }
  //diagonal check
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      for (let k = 1; k <= 2; k++) {
        for (let sign of [-1, 1]) {
          let c = 0;
          if (check_index(i + 3, j + 3 * sign)) {
            for (let it = 0; it < 4; it++) {
              if (board_[i + it][j + it * sign] == k) c++;
              else break;
            }
            if (c == 4) return k;
          }
        }
      }
    }
  }
  // game continues
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (board_[i][j] == 0) return -1;
    }
  }
  //draw
  return 0;
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
}
