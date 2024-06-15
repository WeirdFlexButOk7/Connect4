let board = document.getElementById("board");
let rows = 6;
let cols = 7;
let curr_board = []; //col x rows
// curr_board[i][j] = player1 (1) / player2 (2) / unvisited (0)
let player = 1;


function modalHide() {
    document.getElementById("modal").style.display = "none";
}

for (let i = 0; i < cols; i++) {
    let col = document.createElement("div");
    col.classList.add("column");
    col.id = i;
    let temp = [];
    for (let j = 0; j < rows; j++) {
        let cell = document.createElement("div");  
        cell.id = `${i}-${j}`;
        cell.classList.add("cell");
        cell.classList.add("unvisited");
        col.appendChild(cell);
        temp.push(0);
    }
    curr_board.push(temp);
    col.addEventListener("click", (e) => {
        handleClick(e);
    });
    board.appendChild(col);
}

function move (col) {
    let i = col;
    let j = -1;
    for(let k = rows-1; k >= 0; k--) {
        if(curr_board[col][k] == 0) {
            j = k;
            break;
        }
    }
    if(j == -1) return;

    let cell = document.getElementById(`${i}-${j}`);
    cell.classList.remove("unvisited");
    if(player == 1) {
        cell.classList.add("player1");
    } else {
        cell.classList.add("player2");
    }
    curr_board[i][j] = player;
    player ^= 3;
    console.log(curr_board);
}

// unvisisted cells -> has class unvisisted
// if col is clicked, get all children of unvisited class, remove unvisited class from last element

function check_index(i,j) {
    return (0 <= i && i < cols && 0 <= j && j < rows);
}

function check_status() { //return player who won, 0 if draw, -1 if game continues.
    //horizontal check
    for(let i = 0; i < cols; i++) {
        let c = 0; let maxc = 0;
        for(let k = 1; k <= 2; k++){
            c = 0;
            for(let j = 0; j < rows;  j++) {
                if(curr_board[i][j] == k) c++;
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
                if(curr_board[i][j] == k) c++;
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
                            if(curr_board[i+it][j+it*sign] == k) c++;
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
            if(curr_board[i][j] == 0) return -1;
        }
    }
    //draw
    return 0;
}

function handleClick(e) {
    let id = e.target.id.toString()[0];
    move(id);
    let c = check_status();
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
}

