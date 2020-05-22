function Stack() {
    this.top = 0;
    this.dataStore = [];
    this.push = function push(element) {
        this.dataStore[this.top++] = element;
    };
    this.pop = function pop() {
        return this.dataStore[--this.top];
    };
    this.peek = function peek() {
        return this.dataStore[this.top - 1];
    };
    this.length = function length() {
        return this.top;
    };
    this.clear = function clear() {
        this.dataStore.length = 0;
        this.top = 0;
    };
}

var canvas = document.getElementById("chess");
var context = canvas.getContext("2d");
var me = true;              // true为玩家落子权，false为电脑
var chessBoard = [];        // 棋盘二维数组,存储棋盘信息
var steps = new Stack();    // 步数数组，存储步数信息
var initFinished = false;     //判断是否完成初始化，来判断是否接受点击信息


/**
 * 开始按钮逻辑:初始化棋盘,并让电脑黑棋先行(7,7)位置
 * 
 * 电脑开局位置不变，可改动
 */
function initGame() {
    initFinished = true;
    board.init(15)

    // 清除棋盘
    cleanChess();

    // 初始化棋盘信息
    for (var i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (var j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
        }
    }
    // 轮到玩家(白棋)行棋
    me = true;
}


function meFirst(isFirst) {
    initGame();
    // 绘制棋盘
    drawChess();
    //设置按钮的可见性
    // console.log(document.getElementsByName("restart"));
    // console.log(document.getElementsByName("restart").style.cssText);
    document.getElementsByName("restart")[0].style.cssText = "display:inline-block;";
    document.getElementsByName("meFirst")[0].style.cssText = "display:none;";
    document.getElementsByName("computerFirst")[0].style.cssText = "display:none;";
    document.getElementsByName("goBack")[0].style.cssText = "display:inline-block;";

    if (!isFirst) {
        // 让电脑先行，(7,7)处绘制黑棋，并存储信息
        oneStep(7, 7, false);
        chessBoard[7][7] = 2;
        steps.push([7, 7]);
        var p = [7, 7];
        board.put(p, R.com);
    }
}

/**
 * 清除棋盘
 */
function cleanChess() {
    //设置按钮的可见性
    document.getElementsByName("restart")[0].style.cssText = "display:none;";
    document.getElementsByName("meFirst")[0].style.cssText = "display:inline-block;";
    document.getElementsByName("computerFirst")[0].style.cssText = "display:inline-block;";
    document.getElementsByName("goBack")[0].style.cssText = "display:none;";

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制棋盘
 */
function drawChess() {
    for (var i = 0; i < 15; i++) {
        context.strokeStyle = "#BFBFBF";
        context.beginPath();
        context.moveTo(15 + i * 30, 15);
        context.lineTo(15 + i * 30, canvas.height - 15);
        context.closePath();
        context.stroke();

        context.beginPath();
        context.moveTo(15, 15 + i * 30);
        context.lineTo(canvas.width - 15, 15 + i * 30);
        context.closePath();
        context.stroke();
    }
}

/**
 * 绘制棋子
 * @param i     棋子x轴位置
 * @param j     棋子y轴位置
 * @param me    棋子颜色
 */
function oneStep(i, j, me) {
    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    context.closePath();
    var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
    if (me) {
        //我执黑棋
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(1, "#636766");
    } else {
        //电脑执白棋
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
    }

    context.fillStyle = gradient;
    context.fill();
}

//判断游戏是否结束
function isOver() {
    var x_move = [1, 0, 1, -1]
    var y_move = [0, 1, 1, 1]
    for (var i = 0; i < 15; i++) {

        for (var j = 0; j < 15; j++) {
            for (var k = 0; k < 4; k++) {
                var cnt_1 = 0;
                var cnt_2 = 0;
                for (var m = 1; m <= 5; m++) {
                    var y_now = i + m * y_move[k];
                    var x_now = j + m * x_move[k];
                    if (y_now >= 0 && y_now < 15 && x_now >= 0 && x_now < 15 && chessBoard[y_now][x_now] != 0) {
                        if (chessBoard[y_now][x_now] == 1) {
                            cnt_1++;
                        }
                        else if (chessBoard[y_now][x_now] == 2) {
                            cnt_2++;
                        }
                    }
                }
                if (cnt_1 == 5) {
                    return 1;
                }
                else if (cnt_2 == 5) {
                    return 2;
                }
            }
        }
    }

    return 0;
}

/**
 * canvas 鼠标点击事件
 * @param e
 * 
 * 鼠标点击落子，改变对应赢法，电脑行棋
 * chess board[i][j] = 1 //玩家落子
 * chess board[i][j] = 2 //电脑落子
 * 需改动
 */
canvas.onclick = function (e) {

    if (!me)
        return;
    if (initFinished == false)
        return;

    var x = e.offsetX;
    var y = e.offsetY;
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);

    // 如果该位置没有棋子,则允许落子
    if (chessBoard[i][j] == 0) {

        // 绘制棋子(玩家)
        oneStep(i, j, true);
        // 改变棋盘信息(该位置有棋子)
        chessBoard[i][j] = 1;
        steps.push([i, j]);
        var p = [i, j];
        board.put(p, R.hum);
        if (isOver() == 1) {
            alert("玩家获胜！")
            chessBoard = [];
            initFinished = false;
            document.getElementsByName("restart")[0].style.cssText = "display:none;";
        }
        me = !me;
        calculate();
        if (isOver() == 2) {
            alert("电脑获胜！")
            chessBoard = [];
            initFinished = false;
            document.getElementsByName("goBack")[0].style.cssText = "display:none;";
        }

    }//end of if
};//end of function

/**
 * 悔棋操作，填充空白
 * @param i
 * @param j
 */
function fillWhite(i, j) {
    //填充白色圈圈
    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 14, 0, 2 * Math.PI);
    context.closePath();
    var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
    gradient.addColorStop(1, "#FFFFFF");
    context.fillStyle = gradient;
    context.fill();
    //画横竖的线
    //画横竖的线
    //考虑到之前是黑线的部分如果再被描一次会很黑，所以先描一次白线
    context.strokeStyle = "#FFFFFF";
    context.beginPath();
    context.moveTo(15 + i * 30, 15);
    context.lineTo(15 + i * 30, canvas.height - 15);
    context.closePath();
    context.stroke();

    context.beginPath();
    context.moveTo(15, 15 + j * 30);
    context.lineTo(canvas.width - 15, 15 + j * 30);
    context.closePath();
    context.stroke();
    //绘制黑线
    context.strokeStyle = "#BFBFBF";
    context.beginPath();
    context.moveTo(15 + i * 30, 15);
    context.lineTo(15 + i * 30, canvas.height - 15);
    context.closePath();
    context.stroke();

    context.beginPath();
    context.moveTo(15, 15 + j * 30);
    context.lineTo(canvas.width - 15, 15 + j * 30);
    context.closePath();
    context.stroke();
    //填补被线覆盖的地方
    for (var k = 0; k < 15; k++) {
        if (chessBoard[i][k] == 1) {
            oneStep(i, k, true);
        }
        else if (chessBoard[i][k] == 2) {
            oneStep(i, k, false);
        }
    }
    for (var k = 0; k < 15; k++) {
        if (chessBoard[k][j] == 1) {
            oneStep(k, j, true);
        }
        else if (chessBoard[k][j] == 2) {
            oneStep(k, j, false);
        }
    }
}


//悔棋
function goBack() {
    if (steps.top < 2) {
        return;
    }

    back1 = steps.pop();
    back2 = steps.pop();
    chessBoard[back1[0]][back1[1]] = 0;
    chessBoard[back2[0]][back2[1]] = 0;
    board.backward();
    fillWhite(back1[0], back1[1]);
    fillWhite(back2[0], back2[1]);

}
