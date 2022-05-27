const canvas = document.querySelector('#tetrix')
const loop = new kk.Loop(canvas.getContext('2d'))
const music = new Audio('tetris1.ogg');

const startButton = document.querySelector('#startButton')
const overlay = document.querySelector('#overlay')
startButton.addEventListener('mousedown', startHandler)

function startHandler() {
  overlay.className = 'hidden'
  music.volume = 0.2
  music.play();
  loop.start()
}

const pixelWidth = 480
const pixelHeight = 800
const boardHeight = 25
const boardWidth = 15 
let board = new Array(boardHeight).fill(0).map(() => new Array(boardWidth).fill(0))
const boardStartX = 7
const boardStartY = 1
const blockSize = 32
let points = 0
let level = 1

const pointFlash = new kk.FlashText({
  x: pixelWidth / 2,
  y: pixelHeight / 3,
  color: '#5d7141',
  speed: 10,
  timeout: 2000,
  font: '800 40px Tahoma',
  shadowBlur: 2
})

const background = {
  tick(ctx) {
    ctx.fillStyle = '#EDECB6'
    ctx.fillRect(0, 0, pixelWidth, pixelHeight)
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const teePiece = {
  shapes: [
    [[0,1],[1,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[1,2]],
    [[1,0],[1,1],[1,2],[2,1]],
    [[1,0],[0,1],[1,1],[2,1]],
  ],
  offset: [-1,-1],
  type: 0,
  direction: 2
}

const straightPiece = {
  shapes: [
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,1],[1,1],[2,1],[3,1]],
  ],
  offset: [-2,-1],
  type: 1,
  direction: 0
}

const squarePiece = {
  shapes: [
    [[0,0],[0,1],[1,1],[1,0]],
  ],
  offset: [0, 0],
  type: 1,
  direction: 0
}

const ellPiece = {
  shapes: [
    [[0,0],[1,0],[2,0],[2,1]],
    [[1,0],[1,1],[1,2],[0,2]],
    [[0,1],[1,1],[2,1],[0,0]],
    [[0,0],[0,1],[0,2],[1,0]],
  ],
  offset: [-1, 0],
  type: 1,
  direction: 0
}

const jeyPiece = {
  shapes: [
    [[0,1],[1,1],[2,1],[2,0]],
    [[0,0],[0,1],[0,2],[1,2]],
    [[0,0],[0,1],[1,0],[2,0]],
    [[0,0],[1,0],[1,1],[1,2]],
  ],
  offset: [-1, 0],
  type: 1,
  direction: 0
}

const squigglePieceA = {
  shapes: [
    [[1,0],[1,1],[0,1],[0,2]],
    [[0,0],[1,0],[1,1],[2,1]],
  ],
  offset: [-1, -1],
  type: 1,
  direction: 0
}


const squigglePieceB = {
  shapes: [
    [[0,0],[0,1],[1,1],[1,2]],
    [[0,1],[1,1],[1,0],[2,0]],
  ],
  offset: [-1, -1],
  type: 1,
  direction: 0
}

const allPieces = [teePiece, straightPiece, squarePiece, ellPiece, jeyPiece, squigglePieceA, squigglePieceB]

let currentPiece;
function nextPiece() {
  const randomPieceNumber = getRandomInt(0, allPieces.length - 1)
  const randomPiece = allPieces[randomPieceNumber]
  currentPiece = Object.assign({
    position: [boardStartY, boardStartX]
  }, randomPiece)

  if(checkCollision()) {
    renderPieceToBoard(currentPiece)
    currentPiece = null
    gameOver()
  }
}
nextPiece()

function checkCollision () {
  return currentPiece.shapes[currentPiece.direction].some(element => {
    const y = currentPiece.position[0] + element[0] + currentPiece.offset[0]
    const x = currentPiece.position[1] + element[1] + currentPiece.offset[1]

    if (y >= boardHeight) {
      return true
    }

    if (board[y][x] === 1) {
      return true
    }

    return false
  })
} 

const checkBorders = () => {
  for (let element of currentPiece.shapes[currentPiece.direction]) {
    const x = currentPiece.position[1] + element[1] + currentPiece.offset[1]

    if (x < 0) {
      return 1
    }

    if ( x > boardWidth - 1) {
      return 2
    }
  }

  return false
} 

const renderPieceToBoard = (piece) => {
  piece.shapes[piece.direction].forEach(element => {
    const y = piece.position[0] + element[0] + piece.offset[0]
    const x = piece.position[1] + element[1] + piece.offset[1]

    board[y][x] = 1
  })
}

const scoring = [0, 100, 300, 500, 800]

const addScore = (linesCleared) => {
  const gained = scoring[linesCleared]
  if (gained > 0) {
    pointFlash.msg(gained.toString())
  }
  points += gained

  console.log(points)
}

const pieceDone = (piece) => {
  renderCurrentPiece.timeout = 1500

  renderPieceToBoard(piece)

  board = board.filter(line => !line.every(tile => tile === 1))
  const linesCleared = boardHeight - board.length

  addScore(linesCleared)

  console.log('linesCleared', linesCleared, 'height', boardHeight, 'board length', board.length)
  board.splice(0, 0, ...(new Array(linesCleared).fill(0).map(() => new Array(boardWidth).fill(0))))
  console.log(board.length, board[0])

  setTimeout(() => {
    renderCurrentPiece.currentTime = 1500
    nextPiece()
  }, 250)
}

const gameOver = () => {
  console.log('game over')
}

const renderCurrentPiece = {
  tick(ctx, timeDiff) {
    if (!currentPiece) {
      return
    }

    if(this.currentTime >= this.timeout) {
      this.currentTime = 0
      currentPiece.position[0] += 1
      
      if (checkCollision()) {
        console.log('collsion')
        currentPiece.position[0] -= 1
        pieceDone(currentPiece)
        currentPiece = null
        return
      }
    }

    currentPiece.shapes[currentPiece.direction].forEach(element => {
      this.currentTime += timeDiff

      const y = currentPiece.position[0] + element[0] + currentPiece.offset[0]
      const x = currentPiece.position[1] + element[1] + currentPiece.offset[1]

      ctx.fillStyle = 'blue'

      ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)
    })
  },
  timeout: 1500,
  currentTime: 0
}

const renderBoard = {
  tick(ctx) {
    for(let y = 0; y < boardHeight; y++) {
      for(let x = 0; x < boardWidth; x++) {
        if (board[y][x] === 1) {
          ctx.fillStyle = 'blue'
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)
        }
      }
    }
  }
}

const rotateLeft = (piece) => {
  piece.direction -= 1
  if (piece.direction < 0) {
    piece.direction = piece.shapes.length - 1
  }
}

const rotateRight = (piece) => {
  piece.direction += 1
  if (piece.direction > piece.shapes.length - 1) {
    piece.direction = 0
  }
}

const shiftLeft = (piece) => {
  piece.position[1] -= 1
}

const shiftRight = (piece) => {
  piece.position[1] += 1
}

const handleRotateBorderCollision = () => {
  const borderCheck = checkBorders()

  if (borderCheck === 1) {
    shiftRight(currentPiece)
    return -1
  }

  if (borderCheck === 2) {
    shiftLeft(currentPiece)
    if (currentPiece.type === straightPiece.type) {
      shiftLeft(currentPiece)
      return 2
    }
    return 1
  }
}

const keyHandler = (evt) => {
  console.log(evt.code)
  switch (evt.code) {
    case 'KeyA':
      if (currentPiece) {
        rotateLeft(currentPiece)
        
        if (checkCollision()) {
          rotateRight(currentPiece)
          return
        }
        
        const revert = handleRotateBorderCollision()
        if (checkCollision()) {
          currentPiece.position[1] += revert
          rotateRight(currentPiece)
        }
      }
      
      break;
    case 'KeyD':
      if (currentPiece) {
        rotateRight(currentPiece)

        if (checkCollision()) {
          rotateLeft(currentPiece)
          return
        }

        const revert = handleRotateBorderCollision()
        if (checkCollision()) {
          currentPiece.position[1] += revert
          rotateLeft(currentPiece)
        }
      }
      break;

    case 'ArrowLeft':
      if (currentPiece) {
        shiftLeft(currentPiece)

        if(checkBorders() || checkCollision()) {
          shiftRight(currentPiece)
        }
      }
      break;

    case 'ArrowRight':
      if (currentPiece) {
        shiftRight(currentPiece)

        if(checkBorders() || checkCollision()) {
          shiftLeft(currentPiece)
        }
      }
    break;

    case 'ArrowDown':
      if (currentPiece) {
        renderCurrentPiece.timeout = 125
      }
    break;

    case 'KeyP':
      if (loop._tickTimeout === null) {
        loop.start()
        music.play()
      } else {
        music.pause()
        loop.stop()
      }
    break;
    default:
      break;
  }

}

document.addEventListener('keydown', keyHandler);

loop.push(background)
loop.push(renderCurrentPiece)
loop.push(renderBoard)
loop.push(pointFlash)

