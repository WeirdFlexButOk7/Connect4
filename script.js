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

init(); 

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
        let result;
        if (c == 0) result = document.getElementById("draw"); 
        else if(c == 1) result = document.getElementById("win"); 
        else result = document.getElementById("lost"); 
        result.classList.add("show");
        result.addEventListener("click", (e) => {
            location.reload();
        })
    }
    AI_move();
    c = check_status(curr_board);
    if (c >= 0) {
        let result = document.getElementById("win"); 
        result.classList.add("show");
        result.addEventListener("click", (e) => {
            location.reload();
        })
    }
}

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
    let temp_board = curr_board.map(row => row.slice());

    for(let i = 0; i < cols; i++) {
        let j = available_row[i];
        if(j < 0) continue;
        temp_board[i][j] = 2;
        let res = check_status(temp_board);
        temp_board[i][j] = 0;
        if(res == 2) {
            move(i); return;
        }
        temp_board[i][j] = 1;
        res = check_status(temp_board);
        temp_board[i][j] = 0;
        if(res == 1) {
            move(i); return;
        }
    }

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
    }

    let t_j = available_row[col];
    temp_board[col][t_j] = 1;
    available_row[col]--;
    let dont = 0;
    for(let i = 0; i < cols; i++) {
        let j = available_row[i];
        if(j < 0) continue;
        temp_board[i][j] = 2;
        let res = check_status(temp_board);
        temp_board[i][j] = 0;
        if(res == 2) {
            dont = 1; break;
        }
    }

    temp_board[col][t_j] = 0;
    available_row[col]++;

    if(dont) {
        for(let i = 0; i < cols; i++) {
            if(i == col) continue;
            let j = available_row[i];
            if(j < 0) continue; 

            temp_board[i][j] = 1;
            available_row[i]--;
            dont = 0;
            
            for(let k = 0; k < cols; k++) {
                let l = available_row[i];
                if(l < 0) continue;
                temp_board[k][l] = 2;
                let res = check_status(temp_board);
                temp_board[k][l] = 0;
                if(res == 2) {
                    dont = 1; break;
                }
            }   
            temp_board[i][j] = 0;
            available_row[i]++;

            if(dont) continue;
            move(i); return;
        }
    }

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
