
//math.js
var threshold = 1.15

var equal = function (a, b) {
  b = b || 0.01
  return b >= 0 ? ((a >= b / threshold) && (a <= b * threshold))
    : ((a >= b * threshold) && (a <= b / threshold))
}
var greatThan = function (a, b) {
  return b >= 0 ? (a >= (b + 0.1) * threshold) : (a >= (b + 0.1) / threshold) // 注意处理b为0的情况，通过加一个0.1 做简单的处理
}
var greatOrEqualThan = function (a, b) {
  return equal(a, b) || greatThan(a, b)
}
var littleThan = function (a, b) {
  return b >= 0 ? (a <= (b - 0.1) / threshold) : (a <= (b - 0.1) * threshold)
}
var littleOrEqualThan = function (a, b) {
  return equal(a, b) || littleThan(a, b)
}

var math = {
  equal: equal,
  greatThan: greatThan,
  greatOrEqualThan: greatOrEqualThan,
  littleThan: littleThan,
  littleOrEqualThan: littleOrEqualThan
}


//evaluate_point.js
/*
 * 启发式评价函数
 * 这个是专门给某一个位置打分的，不是给整个棋盘打分的
 * 并且是只给某一个角色打分
 */
/*
 * 表示在当前位置下一个棋子后的分数
 * 为了性能考虑，增加了一个dir参数，如果没有传入则默认计算所有四个方向，如果传入值，则只计算其中一个方向的值
 */

/**
 * 
 * @param {*} b this board
 * @param {*} px 当前点行
 * @param {*} py 当前点列
 * @param {*} role 当前角色
 * @param {*} dir 
 * 围绕当前点寻找周围的局面分
 */
var s = function (b, px, py, role, dir) {
  var board = b.board
  var result = 0,
    radius = 8,
    empty = 0
  var count = 0, block = 0, secondCount = 0  //另一个方向的count

  var len = board.length

  function reset() {
    count = 1
    block = 0
    empty = -1
    secondCount = 0  //另一个方向的count
  }


  if (dir === undefined || dir === 0) {
    reset()

    // -

    for (var i = py + 1; true; i++) {
      if (i >= len) {
        block++
        break
      }
      var t = board[px][i]
      if (t === R.empty) {
        if (empty == -1 && i < len - 1 && board[px][i + 1] == role) {
          empty = count
          continue
        } else {
          break
        }
      }
      if (t === role) {
        count++
        continue
      } else {
        block++
        break
      }
    }


    for (var i = py - 1; true; i--) {
      if (i < 0) {
        block++
        break
      }
      var t = board[px][i]
      if (t === R.empty) {
        if (empty == -1 && i > 0 && board[px][i - 1] == role) {
          empty = 0  //注意这里是0，因为是从右往左走的
          continue
        } else {
          break
        }
      }
      if (t === role) {
        secondCount++
        empty !== -1 && empty++  //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
        continue
      } else {
        block++
        break
      }
    }

    count += secondCount

    b.scoreCache[role][0][px][py] = countToScore(count, block, empty)
  }
  result += b.scoreCache[role][0][px][py]

  if (dir === undefined || dir === 1) {

    // |
    reset()

    for (var i = px + 1; true; i++) {
      if (i >= len) {
        block++
        break
      }
      var t = board[i][py]
      if (t === R.empty) {
        if (empty == -1 && i < len - 1 && board[i + 1][py] == role) {
          empty = count
          continue
        } else {
          break
        }
      }
      if (t === role) {
        count++
        continue
      } else {
        block++
        break
      }
    }

    for (var i = px - 1; true; i--) {
      if (i < 0) {
        block++
        break
      }
      var t = board[i][py]
      if (t === R.empty) {
        if (empty == -1 && i > 0 && board[i - 1][py] == role) {
          empty = 0
          continue
        } else {
          break
        }
      }
      if (t === role) {
        secondCount++
        empty !== -1 && empty++  //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
        continue
      } else {
        block++
        break
      }
    }

    count += secondCount

    b.scoreCache[role][1][px][py] = countToScore(count, block, empty)
  }
  result += b.scoreCache[role][1][px][py]


  // \
  if (dir === undefined || dir === 2) {
    reset()

    for (var i = 1; true; i++) {
      var x = px + i, y = py + i
      if (x >= len || y >= len) {
        block++
        break
      }
      var t = board[x][y]
      if (t === R.empty) {
        if (empty == -1 && (x < len - 1 && y < len - 1) && board[x + 1][y + 1] == role) {
          empty = count
          continue
        } else {
          break
        }
      }
      if (t === role) {
        count++
        continue
      } else {
        block++
        break
      }
    }

    for (var i = 1; true; i++) {
      var x = px - i, y = py - i
      if (x < 0 || y < 0) {
        block++
        break
      }
      var t = board[x][y]
      if (t === R.empty) {
        if (empty == -1 && (x > 0 && y > 0) && board[x - 1][y - 1] == role) {
          empty = 0
          continue
        } else {
          break
        }
      }
      if (t === role) {
        secondCount++
        empty !== -1 && empty++  //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
        continue
      } else {
        block++
        break
      }
    }

    count += secondCount

    b.scoreCache[role][2][px][py] = countToScore(count, block, empty)
  }
  result += b.scoreCache[role][2][px][py]


  // /
  if (dir === undefined || dir === 3) {
    reset()

    for (var i = 1; true; i++) {
      var x = px + i, y = py - i
      if (x < 0 || y < 0 || x >= len || y >= len) {
        block++
        break
      }
      var t = board[x][y]
      if (t === R.empty) {
        if (empty == -1 && (x < len - 1 && y < len - 1) && board[x + 1][y - 1] == role) {
          empty = count
          continue
        } else {
          break
        }
      }
      if (t === role) {
        count++
        continue
      } else {
        block++
        break
      }
    }

    for (var i = 1; true; i++) {
      var x = px - i, y = py + i
      if (x < 0 || y < 0 || x >= len || y >= len) {
        block++
        break
      }
      var t = board[x][y]
      if (t === R.empty) {
        if (empty == -1 && (x > 0 && y > 0) && board[x - 1][y + 1] == role) {
          empty = 0
          continue
        } else {
          break
        }
      }
      if (t === role) {
        secondCount++
        empty !== -1 && empty++  //注意这里，如果左边又多了己方棋子，那么empty的位置就变大了
        continue
      } else {
        block++
        break
      }
    }

    count += secondCount

    b.scoreCache[role][3][px][py] = countToScore(count, block, empty)
  }
  result += b.scoreCache[role][3][px][py]

  return result
}


var countToScore = function (count, block, empty) {

  if (empty === undefined) empty = 0

  //没有空位
  if (empty <= 0) {
    if (count >= 5) return S.FIVE
    if (block === 0) {
      switch (count) {
        case 1: return S.ONE
        case 2: return S.TWO
        case 3: return S.THREE
        case 4: return S.FOUR
      }
    }

    if (block === 1) {
      switch (count) {
        case 1: return S.BLOCKED_ONE
        case 2: return S.BLOCKED_TWO
        case 3: return S.BLOCKED_THREE
        case 4: return S.BLOCKED_FOUR
      }
    }

  } else if (empty === 1 || empty == count - 1) {
    //第1个是空位
    if (count >= 6) {
      return S.FIVE
    }
    if (block === 0) {
      switch (count) {
        case 2: return S.TWO / 2
        case 3: return S.THREE
        case 4: return S.BLOCKED_FOUR
        case 5: return S.FOUR
      }
    }

    if (block === 1) {
      switch (count) {
        case 2: return S.BLOCKED_TWO
        case 3: return S.BLOCKED_THREE
        case 4: return S.BLOCKED_FOUR
        case 5: return S.BLOCKED_FOUR
      }
    }
  } else if (empty === 2 || empty == count - 2) {
    //第二个是空位
    if (count >= 7) {
      return S.FIVE
    }
    if (block === 0) {
      switch (count) {
        case 3: return S.THREE
        case 4:
        case 5: return S.BLOCKED_FOUR
        case 6: return S.FOUR
      }
    }

    if (block === 1) {
      switch (count) {
        case 3: return S.BLOCKED_THREE
        case 4: return S.BLOCKED_FOUR
        case 5: return S.BLOCKED_FOUR
        case 6: return S.FOUR
      }
    }

    if (block === 2) {
      switch (count) {
        case 4:
        case 5:
        case 6: return S.BLOCKED_FOUR
      }
    }
  } else if (empty === 3 || empty == count - 3) {
    if (count >= 8) {
      return S.FIVE
    }
    if (block === 0) {
      switch (count) {
        case 4:
        case 5: return S.THREE
        case 6: return S.BLOCKED_FOUR
        case 7: return S.FOUR
      }
    }

    if (block === 1) {
      switch (count) {
        case 4:
        case 5:
        case 6: return S.BLOCKED_FOUR
        case 7: return S.FOUR
      }
    }

    if (block === 2) {
      switch (count) {
        case 4:
        case 5:
        case 6:
        case 7: return S.BLOCKED_FOUR
      }
    }
  } else if (empty === 4 || empty == count - 4) {
    if (count >= 9) {
      return S.FIVE
    }
    if (block === 0) {
      switch (count) {
        case 5:
        case 6:
        case 7:
        case 8: return S.FOUR
      }
    }

    if (block === 1) {
      switch (count) {
        case 4:
        case 5:
        case 6:
        case 7: return S.BLOCKED_FOUR
        case 8: return S.FOUR
      }
    }

    if (block === 2) {
      switch (count) {
        case 5:
        case 6:
        case 7:
        case 8: return S.BLOCKED_FOUR
      }
    }
  } else if (empty === 5 || empty == count - 5) {
    return S.FIVE
  }

  return 0
}

var scorePoint = s






//board.js
var R = {
  com: 1,
  hum: 2,
  empty: 0,
  reverse: function (r) {
    return r == 1 ? 2 : 1;
  }
}

/*
 * 棋型表示
 * 用一个6位数表示棋型，从高位到低位分别表示
 * 连五，活四，眠四，活三，活二/眠三，活一/眠二, 眠一
 */

// 给单个棋型打分

var S = {
  ONE: 10,
  TWO: 100,
  THREE: 1000,
  FOUR: 100000,
  FIVE: 10000000,
  BLOCKED_ONE: 1,
  BLOCKED_TWO: 10,
  BLOCKED_THREE: 100,
  BLOCKED_FOUR: 10000
}

// 总分数
var score = {
  TWO: 'TWO', // 活二
  TWO_THREE: 'TWO_THREE', // 双三
  BLOCK_FOUR: 'BLOCKED_FOUR', // 冲四
  FOUR_THREE: 'FOUR_THREE', // 冲四活三
  FOUR: 'FOUR', // 活四
  FIVE: 'FIVE', // 连五
}

var config = {
  opening: true, // 使用开局库
  searchDeep: 8,  //搜索深度
  countLimit: 20, //gen函数返回的节点数量上限，超过之后将会按照分数进行截断
  timeLimit: 100, // 时间限制，秒
  vcxDeep: 5,  //算杀深度
  random: false,// 在分数差不多的时候是不是随机选择一个走
  log: false,
  // 下面几个设置都是用来提升搜索速度的
  spreadLimit: 1,// 单步延伸 长度限制
  star: true, // 是否开启 starspread
  // TODO: 目前开启缓存后，搜索会出现一些未知的bug
  cache: true, // 使用缓存, 其实只有搜索的缓存有用，其他缓存几乎无用。因为只有搜索的缓存命中后就能剪掉一整个分支，这个分支一般会包含很多个点。而在其他地方加缓存，每次命中只能剪掉一个点，影响不大。
  window: false, // 启用期望窗口，由于用的模糊比较，所以和期望窗口是有冲突的

  // 调试
  debug: false, // 打印详细的debug信息
}

var array = {
  create: function (w, h) {
    var r = []
    for (var i = 0; i < w; i++) {
      var row = new Array()
      for (var j = 0; j < h; j++) {
        row.push(0)
      }
      r.push(row)
    }
    return r
  }
}

var count = 0
var total = 0

//冲四的分其实肯定比活三高，但是如果这样的话容易形成盲目冲四的问题，所以如果发现电脑有无意义的冲四，则将分数降低到和活三一样
//而对于冲四活三这种杀棋，则将分数提高。
var fixScore = function (type) {
  if (type < S.FOUR && type >= S.BLOCKED_FOUR) {

    if (type >= S.BLOCKED_FOUR && type < (S.BLOCKED_FOUR + S.THREE)) {
      //单独冲四，意义不大
      return S.THREE
    } else if (type >= S.BLOCKED_FOUR + S.THREE && type < S.BLOCKED_FOUR * 2) {
      return S.FOUR  //冲四活三，比双三分高，相当于自己形成活四
    } else {
      //双冲四 比活四分数也高
      return S.FOUR * 2
    }
  }
  return type
}

var starTo = function (point, points) {
  if (!points || !points.length) return false
  const a = point
  for (var i = 0; i < points.length; i++) {
    // 距离必须在5步以内
    const b = points[i]
    if ((Math.abs(a[0] - b[0]) > 4 || Math.abs(a[1] - b[1]) > 4)) return false
    // 必须在米子方向上
    if (!(a[0] === b[0] || a[1] === b[1] || (Math.abs(a[0] - b[0]) === Math.abs(a[1] - b[1])))) return false
  }
  return true
}

class Board {

  init(sizeOrBoard) {
    this.evaluateCache = {}
    this.currentSteps = [] // 当前一次思考的步骤
    this.allSteps = []
    this.stepsTail = []

    this._last = [false, false] // 记录最后一步
    this.count = 0;// chessman count
    var size
    if (sizeOrBoard.length) {
      this.board = sizeOrBoard
      size = this.board.length
      for (var i = 0; i < this.board.length; i++) this.count += this.board[i].filter(d => d > 0).length
    } else {
      size = sizeOrBoard
      this.board = []
      for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
          row.push(0)
        }
        this.board.push(row)
      }
    }


    // 存储双方得分
    this.comScore = array.create(size, size)
    this.humScore = array.create(size, size)

    // scoreCache[role][dir][row][column]
    this.scoreCache = [
      [], // placeholder
      [ // for role 1
        array.create(size, size),
        array.create(size, size),
        array.create(size, size),
        array.create(size, size)
      ],
      [ // for role 2
        array.create(size, size),
        array.create(size, size),
        array.create(size, size),
        array.create(size, size)
      ]
    ]

    this.initScore()

  }

  initScore() {

    var board = this.board
    if (board.count <= 0) {
      for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
          this.comScore[i][j] = 0;
          this.humScore[i][j] = 0;
        }
      }//end of for
      return
    }

    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        // 空位，对双方都打分
        if (board[i][j] == R.empty) {
          if (this.hasNeighbor(i, j, 2, 2)) { //必须是有邻居的才行
            var cs = scorePoint(this, i, j, R.com)
            var hs = scorePoint(this, i, j, R.hum)
            this.comScore[i][j] = cs
            this.humScore[i][j] = hs
          }

        } else if (board[i][j] == R.com) { // 对电脑打分，玩家此位置分数为0
          this.comScore[i][j] = scorePoint(this, i, j, R.com)
          this.humScore[i][j] = 0
        } else if (board[i][j] == R.hum) { // 对玩家打分，电脑位置分数为0
          this.humScore[i][j] = scorePoint(this, i, j, R.hum)
          this.comScore[i][j] = 0
        }
      }
    }
  }

  //只更新一个点附近的分数
  // 参见 evaluate point 中的代码，为了优化性能，在更新分数的时候可以指定只更新某一个方向的分数
  updateScore(p) {
    var radius = 4,
      board = this.board,
      self = this,
      len = this.board.length

    function update(x, y, dir) {
      var role = self.board[x][y]
      if (role !== R.reverse(R.com)) {
        var cs = scorePoint(self, x, y, R.com, dir)
        self.comScore[x][y] = cs
      } else self.comScore[x][y] = 0
      if (role !== R.reverse(R.hum)) {
        var hs = scorePoint(self, x, y, R.hum, dir)
        self.humScore[x][y] = hs
      } else self.humScore[x][y] = 0

    }
    // 无论是不是空位 都需要更新
    // -
    for (var i = -radius; i <= radius; i++) {
      var x = p[0], y = p[1] + i
      if (y < 0) continue
      if (y >= len) break
      update(x, y, 0)
    }

    // |
    for (var i = -radius; i <= radius; i++) {
      var x = p[0] + i, y = p[1]
      if (x < 0) continue
      if (x >= len) break
      update(x, y, 1)
    }

    // \
    for (var i = -radius; i <= radius; i++) {
      var x = p[0] + i, y = p[1] + i
      if (x < 0 || y < 0) continue
      if (x >= len || y >= len) break
      update(x, y, 2)
    }

    // /
    for (var i = -radius; i <= radius; i++) {
      var x = p[0] + i, y = p[1] - i
      if (x < 0 || y < 0) continue
      if (x >= len || y >= len) continue
      update(x, y, 3)
    }


  }

  //下子
  put(p, role) {
    p.role = role
    config.debug && console.log('put [' + p + ']' + ' ' + role)
    this.board[p[0]][p[1]] = role
    this.updateScore(p)
    this.allSteps.push(p)
    this.currentSteps.push(p)
    this.stepsTail = []
    this.count++
  }

  //移除棋子
  remove(p) {
    var r = this.board[p[0]][p[1]]
    config.debug && console.log('remove [' + p + ']' + ' ' + r)
    this.board[p[0]][p[1]] = R.empty
    this.updateScore(p)
    this.allSteps.pop()
    this.currentSteps.pop()
    this.count--
  }

  //悔棋
  backward() {
    if (this.allSteps.length < 2) return
    var i = 0;
    while (i < 2) {
      var s = this.allSteps[this.allSteps.length - 1]
      this.remove(s)
      this.stepsTail.push(s)
      i++
    }
  }

  //前进
  forward() {
    if (this.stepsTail.length < 2) return
    var i = 0;
    while (i < 2) {
      var s = this.stepsTail.pop()
      this.put(s, s.role)
      i++
    }
  }


  logSteps() {
    console.log("steps:" + this.allSteps.map((d) => '[' + d[0] + ',' + d[1] + ']').join(','))
  }

  //棋面估分
  //这里只算当前分，而不是在空位下一步之后的分
  evaluate(role) {

    // 这里都是用正整数初始化的，所以初始值是0
    this.comMaxScore = 0
    this.humMaxScore = 0

    var board = this.board

    //遍历出最高分，开销不大
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        if (board[i][j] == R.com) {
          this.comMaxScore += fixScore(this.comScore[i][j])
        } else if (board[i][j] == R.hum) {
          this.humMaxScore += fixScore(this.humScore[i][j])
        }
      }
    }

    var result = (role == R.com ? 1 : -1) * (this.comMaxScore - this.humMaxScore)

    return result

  }

  //启发函数
  /*
   * 变量starBread的用途是用来进行米子计算
   * 所谓米子计算，只是，如果第一步尝试了一个位置A，那么接下来尝试的位置有两种情况：
   * 1: 大于等于活三的位置
   * 2: 在A的米子位置上
   * 注意只有对小于活三的棋才进行starSpread优化
   */

  /*
   * gen 函数的排序是非常重要的，因为好的排序能极大提升AB剪枝的效率。
   * 而对结果的排序，是要根据role来的
   */


  log() {
    config.log && console.log('star: ' + (count / total * 100).toFixed(2) + '%, ' + count + '/' + total)
  }

  /**
   * 根据当前角色生成应该计入考虑的落子位置
   * 
   * @param {*} role 角色
   * @param {*} onlyThrees 
   * @param {*} starSpread 
   */
  gen(role, onlyThrees, starSpread) {

    //尚未开始
    if (this.count <= 0) return [7, 7]

    var fives = []  //连五
    var comfours = [] //电脑连四
    var humfours = [] //玩家连四
    var comblockedfours = []  //电脑眠四
    var humblockedfours = []  //玩家眠四
    var comtwothrees = [] //电脑双三
    var humtwothrees = [] //玩家双三
    var comthrees = []  //电脑活三
    var humthrees = []  //玩家活三
    var comtwos = []  //电脑活二
    var humtwos = []  //玩家活二
    var neighbors = []  //记录搜索范围

    //当前board为局部变量
    var board = this.board
    var reverseRole = R.reverse(role)
    // 找到双方的最后进攻点
    const attackPoints = [] // 进攻点
    const defendPoints = [] // 防守点


    // 默认情况下 我们遍历整个棋盘。但是在开启star模式下，我们遍历的范围就会小很多
    // 只需要遍历以两个点为中心正方形。
    // 注意除非专门处理重叠区域，否则不要把两个正方形分开算，因为一般情况下这两个正方形会有相当大的重叠面积，别重复计算了
    if (starSpread && config.star) {

      var i = this.currentSteps.length - 1
      while (i >= 0) {
        var p = this.currentSteps[i]
        if (reverseRole === R.com && p.scoreCom >= S.THREE
          || reverseRole === R.hum && p.scoreHum >= S.THREE) {
          defendPoints.push(p)
          break
        }
        i -= 2
      }

      var i = this.currentSteps.length - 2
      while (i >= 0) {
        var p = this.currentSteps[i]
        if (role === R.com && p.scoreCom >= S.THREE
          || role === R.hum && p.scoreHum >= S.THREE) {
          attackPoints.push(p)
          break;
        }
        i -= 2
      }

      if (!attackPoints.length) attackPoints.push(this.currentSteps[0].role === role ? this.currentSteps[0] : this.currentSteps[1])
      if (!defendPoints.length) defendPoints.push(this.currentSteps[0].role === reverseRole ? this.currentSteps[0] : this.currentSteps[1])
    }

    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board.length; j++) {
        if (board[i][j] == R.empty) {

          if (this.allSteps.length < 6) {
            if (!this.hasNeighbor(i, j, 1, 1)) continue
          } else if (!this.hasNeighbor(i, j, 2, 2)) continue

          var scoreHum = this.humScore[i][j]
          var scoreCom = this.comScore[i][j]
          var maxScore = Math.max(scoreCom, scoreHum)

          if (onlyThrees && maxScore < S.THREE) continue

          var p = [i, j]
          p.scoreHum = scoreHum
          p.scoreCom = scoreCom
          p.score = maxScore
          p.role = role

          total++
          /* 双星延伸，以提升性能
           * 思路：每次下的子，只可能是自己进攻，或者防守对面（也就是对面进攻点）
           * 我们假定任何时候，绝大多数情况下进攻的路线都可以按次序连城一条折线，那么每次每一个子，一定都是在上一个己方棋子的八个方向之一。
           * 因为既可能自己进攻，也可能防守对面，所以是最后两个子的米子方向上
           * 那么极少数情况，进攻路线无法连成一条折线呢?很简单，我们对前双方两步不作star限制就好，这样可以 兼容一条折线中间伸出一段的情况
           */
          if (starSpread && config.star) {
            var roleScore = role === R.com ? p.scoreCom : p.scoreHum
            var deRoleScore = role === R.com ? p.scoreHum : p.scoreCom

            if (maxScore >= S.FOUR) {
            } else if (maxScore >= S.BLOCKED_FOUR && starTo(this.currentSteps[this.currentSteps.length - 1])) {
              //star 路径不是很准，所以考虑冲四防守对手最后一步的棋
            } else if (
              starTo(p, attackPoints) || starTo(p, defendPoints)
            ) {
            } else {
              count++
              continue
            }
          }

          if (scoreCom >= S.FIVE) {//先看电脑能不能连成5
            fives.push(p)
          } else if (scoreHum >= S.FIVE) {//再看玩家能不能连成5
            //别急着返回，因为遍历还没完成，说不定电脑自己能成五。
            fives.push(p)
          } else if (scoreCom >= S.FOUR) {
            comfours.push(p)
          } else if (scoreHum >= S.FOUR) {
            humfours.push(p)
          } else if (scoreCom >= S.BLOCKED_FOUR) {
            comblockedfours.push(p)
          } else if (scoreHum >= S.BLOCKED_FOUR) {
            humblockedfours.push(p)
          } else if (scoreCom >= 2 * S.THREE) {
            //能成双三也行
            comtwothrees.push(p)
          } else if (scoreHum >= 2 * S.THREE) {
            humtwothrees.push(p)
          } else if (scoreCom >= S.THREE) {
            comthrees.push(p)
          } else if (scoreHum >= S.THREE) {
            humthrees.push(p)
          } else if (scoreCom >= S.TWO) {
            comtwos.unshift(p)
          } else if (scoreHum >= S.TWO) {
            humtwos.unshift(p)
          } else neighbors.push(p)
        }
      }
    }

    //如果成五，是必杀棋，直接返回
    if (fives.length) return fives

    // 自己能活四，则直接活四，不考虑冲四
    if (role === R.com && comfours.length) return comfours
    if (role === R.hum && humfours.length) return humfours

    // 对面有活四冲四，自己冲四都没，则只考虑对面活四 （此时对面冲四就不用考虑了)

    if (role === R.com && humfours.length && !comblockedfours.length) return humfours
    if (role === R.hum && comfours.length && !humblockedfours.length) return comfours

    // 对面有活四自己有冲四，则都考虑下
    var fours = role === R.com ? comfours.concat(humfours) : humfours.concat(comfours)
    var blockedfours = role === R.com ? comblockedfours.concat(humblockedfours) : humblockedfours.concat(comblockedfours)
    if (fours.length) return fours.concat(blockedfours)

    var result = []
    if (role === R.com) {
      result =
        comtwothrees
          .concat(humtwothrees)
          .concat(comblockedfours)
          .concat(humblockedfours)
          .concat(comthrees)
          .concat(humthrees)
    }
    if (role === R.hum) {
      result =
        humtwothrees
          .concat(comtwothrees)
          .concat(humblockedfours)
          .concat(comblockedfours)
          .concat(humthrees)
          .concat(comthrees)
    }

    // result.sort(function(a, b) { return b.score - a.score })

    //双三很特殊，因为能形成双三的不一定比一个活三强
    if (comtwothrees.length || humtwothrees.length) {
      return result
    }


    // 只返回大于等于活三的棋
    if (onlyThrees) {
      return result
    }


    var twos
    if (role === R.com) twos = comtwos.concat(humtwos)
    else twos = humtwos.concat(comtwos)

    twos.sort(function (a, b) { return b.score - a.score })
    result = result.concat(twos.length ? twos : neighbors)

    //这种分数低的，就不用全部计算了
    if (result.length > config.countLimit) {
      return result.slice(0, config.countLimit)
    }

    return result
  }

  hasNeighbor(x, y, distance, count) {
    var board = this.board
    var len = board.length
    var startX = x - distance
    var endX = x + distance
    var startY = y - distance
    var endY = y + distance
    for (var i = startX; i <= endX; i++) {
      if (i < 0 || i >= len) continue
      for (var j = startY; j <= endY; j++) {
        if (j < 0 || j >= len) continue
        if (i == x && j == y) continue
        if (board[i][j] != R.empty) {
          count--
          if (count <= 0) return true
        }
      }
    }
    return false
  }

  toString() {
    return this.board.map(function (d) { return d.join(',') }).join('\n')
  }
}

var board = new Board()





















//AiringGo
var MAX = 1000000;
var MIN = -1 * MAX;

var r = function (deep, alpha, beta, role, step, steps, spread) {

  //当前的局势分
  var _e = board.evaluate(role)


  var leaf = {
    score: _e,
    step: step,
    steps: steps
  }

  count++
  if (deep <= 0 || math.greatOrEqualThan(_e, S.FIVE) || math.littleOrEqualThan(_e, -S.FIVE)) {
    return leaf
  }

  var best = {
    score: MIN,
    step: step,
    steps: steps
  }

  //减少复杂度，生成当前棋盘可以加入考虑的落子位置
  // 双方个下两个子之后，开启star spread 模式
  var points = board.gen(role, board.count > 10 ? step > 1 : step > 3, step > 1)

  if (!points.length) return leaf

  for (var i = 0; i < points.length; i++) {
    var p = points[i]
    board.put(p, role)

    var _deep = deep - 1

    var _spread = spread

    if (_spread < config.spreadLimit) {
      // 冲四延伸
      if ((role == R.com && p.scoreHum >= S.FIVE) || (role == R.hum && p.scoreCom >= S.FIVE)) {
        // _deep = deep+1
        _deep += 2
        _spread++
      }
    }

    var _steps = steps.slice(0)
    _steps.push(p)
    var v = r(_deep, -beta, -alpha, R.reverse(role), step + 1, _steps, _spread)
    //var r = function(deep, alpha, beta, role, step, steps, spread)
    v.score *= -1
    board.remove(p)

    //注意，这里决定了剪枝时使用的值必须比MAX小
    //更新best
    if (v.score > best.score) {
      best = v
    }

    //alpha剪枝，更新alpha值
    alpha = Math.max(best.score, alpha)

    //beta剪枝
    //用greatThan一方面避免浮点数产生的误差，一方面因为相邻两层取反，v.score可能正负两种
    if (math.greatThan(v.score, beta)) {
      v.score = MAX - 1
      return v
    }
  }
  return best
}

/**
 * 
 * @param {*} candidates 参与考虑的结点（第一层的结点）
 * @param {*} role 当前层角色
 * @param {*} deep 深度
 * @param {*} alpha 
 * @param {*} beta 
 */
var negamax = function (candidates, role, deep, alpha, beta) {

  count = 0
  ABcut = 0
  PVcut = 0
  board.currentSteps = []

  for (var i = 0; i < candidates.length; i++) {
    var p = candidates[i]
    board.put(p, role)
    var steps = [p]
    var v = r(deep - 1, -beta, -alpha, R.reverse(role), 1, steps.slice(0), 0)
    //var r = function(deep, alpha, beta, role, step, steps, spread)
    v.score *= -1
    alpha = Math.max(alpha, v.score)
    board.remove(p)
    p.v = v

  }

  //console.log('迭代完成,deep=' + deep)
  /*console.log(candidates.map(function (d) {
    return '['+d[0]+','+d[1]+']'
      + ',score:' + d.v.score
      + ',step:' + d.v.step
      + ',steps:' + d.v.steps.join(';')
  }))*/

  return alpha
}

/**
 * 极大极小值算法
 */
var maxmin = function () {

  //role = computer
  role = R.com

  //选出当前局面的参考结点
  var candidates = board.gen(role)
  //先固定搜索四层

  bestScore = negamax(candidates, role, 4, MIN, MAX)
  // 美化一下
  candidates = candidates.map(function (d) {
    var r = [d[0], d[1]]
    r.score = d.v.score
    r.step = d.v.step
    r.steps = d.v.steps
    if (d.v.vct) r.vct = d.v.vct
    if (d.v.vcf) r.vcf = d.v.vcf
    return r
  })

  candidates.sort(function (a, b) {
    if (math.equal(a.score, b.score)) {
      // 大于零是优势，尽快获胜，因此取步数短的
      // 小于0是劣势，尽量拖延，因此取步数长的
      if (a.score >= 0) {
        if (a.step !== b.step) return a.step - b.step
        else return b.score - a.score // 否则 选取当前分最高的（直接评分)
      }
      else {
        if (a.step !== b.step) return b.step - a.step
        else return b.score - a.score // 否则 选取当前分最高的（直接评分)
      }
    }
    else return (b.score - a.score)
  })

  var result = candidates[0]
  return result
}

var wins = [];      // 赢法统计数组
var count = 0;      // 赢法统计数组的计数器

// 初始化赢法统计数组
for (var i = 0; i < 15; i++) {
  wins[i] = [];
  for (var j = 0; j < 15; j++) {
    wins[i][j] = []
  }
}

var myWin = [];
var airingWin = [];

// 阳线纵向90°的赢法
for (var i = 0; i < 15; i++) {
  for (var j = 0; j < 11; j++) {
    for (var k = 0; k < 5; k++) {
      wins[i][j + k][count] = true;
    }
    count++;
  }
}

// 阳线横向0°的赢法
for (var i = 0; i < 15; i++) {
  for (var j = 0; j < 11; j++) {
    for (var k = 0; k < 5; k++) {
      wins[j + k][i][count] = true;
    }
    count++;
  }
}

// 阴线斜向135°的赢法
for (var i = 0; i < 11; i++) {
  for (var j = 0; j < 11; j++) {
    for (var k = 0; k < 5; k++) {
      wins[i + k][j + k][count] = true;
    }
    count++;
  }
}

// 阴线斜向45°的赢法
for (var i = 0; i < 11; i++) {
  for (var j = 14; j > 3; j--) {
    for (var k = 0; k < 5; k++) {
      wins[i + k][j - k][count] = true;
    }
    count++;
  }
}

var calculate = function () {

  if (me) {
    console.log("computer not allowed to put");
    return;
  }

  //根据当前chess_board调用最大最小值算法计算当前落子位置
  p = maxmin();
  u = p[0];
  v = p[1];

  //落子
  //保留赢法数组用来统计当前局面是否结束
  oneStep(u, v, false);
  chessBoard[u][v] = 2;
  steps.push([u, v]);
  board.put(p, R.com);

  me = !me;
}
