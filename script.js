let board = document.getElementById("board");
let rows = 6;
let cols = 7;
let curr_board = []; //col x rows
let available_row = [];
// curr_board[i][j] = player1 (1) / player2 (2) / unvisited (0)
let player = 1;
let weights = [];

function modalHide() {
    document.getElementById("modal").style.display = "none";
    move(3);
}

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

init(); console.log(weights);

function move (col) {
    let i = col;
    let j = available_row[i];
    if(j < 0) return;

    let cell = document.getElementById(`${i}-${j}`);
    available_row[i]--;
    cell.classList.remove("unvisited");
    if(player == 1) {
        cell.classList.add("player1");
    } else {
        cell.classList.add("player2");
    }
    curr_board[i][j] = player;
    player ^= 3;
}

// unvisisted cells -> has class unvisisted
// if col is clicked, get all children of unvisited class, remove unvisited class from last element

function check_index(i,j) {
    return (0 <= i && i < cols && 0 <= j && j < rows);
}

function check_status(board_) { //return player who won, 0 if draw, -1 if game continues.
    //horizontal check
    for(let i = 0; i < cols; i++) {
        let c = 0; let maxc = 0;
        for(let k = 1; k <= 2; k++){
            c = 0;
            for(let j = 0; j < rows;  j++) {
                if(board_[i][j] == k) c++;
                else c = 0;
                maxc = Math.max(maxc,c);
            }
            if(maxc == 4) return k;
        }
    }
    //vertical check
    for(let j = 0; j < rows; j++) {
        let c = 0; let maxc = 0;
        for(let k = 1; k <= 2; k++){
            c = 0;
            for(let i = 0; i < cols; i++) {
                if(board_[i][j] == k) c++;
                else c = 0;
                maxc = Math.max(maxc,c);
            }
            if(maxc == 4) return k;
        }
    }
    //diagonal check
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            for(let k = 1; k <= 2; k++) {
                for(let sign of [-1,1]) {
                    let c = 0;
                    if(check_index(i+3,j+3*sign)) {
                        for(let it = 0; it < 4; it++) {
                            if(board_[i+it][j+it*sign] == k) c++;
                            else break;
                        }
                        if(c == 4) return k;
                    }
                }
            }
        }
    }
    // game continues 
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            if(board_[i][j] == 0) return -1;
        }
    }
    //draw
    return 0;
}

function handleClick(e) {
    let id = e.target.id.toString()[0];
    move(id);
    let c = check_status(curr_board);
    if (c >= 0) {
        let win = document.getElementById("win");
        // board.classList.add("hidden");
        win.classList.add("show")
        let p = document.getElementById()
        if (c == 0) win.firstChild.innerHTML = "Draw!";
        else win.firstChild.innerHTML = `Player ${c} won!`;
        win.addEventListener("click", (e) => {
            location.reload();
        })
    }
    AI_move();
}

let temp_board = curr_board.map(row => row.slice());

function minimax(to_max, depth, alpha, beta) {
    let x = to_max ? -Infinity : Infinity;

    if(to_max){
        for(let i = 0; i < cols; i++) {
            let j = available_row[i];
            if(j < 0) continue;

            if(depth == 0) {
                x = Math.max(x, weights[i][j]);
                continue;
            }

            available_row[i]--;
            let val = - minimax(!to_max, depth-1, alpha, beta);
            available_row[i]++;
            val += weights[i][j];

            x = Math.max(x,val);
            // alpha = Math.max(alpha,x);

            // if(beta <= alpha) break;
        }
    } else {
        for(let i = 0; i < cols; i++) {
            let j = available_row[i];
            if(j < 0) continue;

            if(depth == 0) {
                x = Math.min(x, weights[i][j]);
                continue;
            }

            available_row[i]--;
            let val = minimax(!to_max, depth-1, alpha, beta);
            available_row[i]++;
            val -= weights[i][j];

            x = Math.min(x,val);
            // beta = Math.min(beta,x);

            // if(beta <= alpha) break; 
        }

    }
    return x;
}

function AI_move() {
    let x = -Infinity; 
    let col = -1;

    for(let i = 0; i < cols; i++) {
        let j = available_row[i];
        if(j < 0) continue;

        available_row[i]--;
        let val = - minimax(false,5,-Infinity,Infinity);
        available_row[i]++;
        val += weights[i][j];
        if(val > x) {
            x = val;
            col = i;
        }
        console.log(val,i);
    }
    if(col == -1) console.log("FAILURE");
    move(col);
}

function init() {
    for(let i = 0; i < cols; i++) {
        for(let j = 3; j < rows;  j++) {
            for(let k = 0; k < 4; k++) {
                weights[i][j-k]++;
            }
        }
    }
    
    for(let j = 0; j < rows;  j++) {
        for(let i = 3; i < cols; i++) {
            for(let k = 0; k < 4; k++) {
                weights[i-k][j]++;
            }
        }
    }

    for(let i = 3; i < cols; i++) {
        for(let j = 3; j < rows;  j++) {
            for(let k = 0; k < 4; k++) {
                weights[i-k][j-k]++;
            }
        }
    }

    for(let i = 0; i < cols - 3; i++) {
        for(let j = 3; j < rows; j++) {
            for(let k = 0; k < 4; k++) {
                weights[i+k][j-k]++;
            }
        }
    }
}
