const canvas = document.querySelector('#tetrix')
const loop = new kk.Loop(canvas.getContext('2d'))

const boardHeight = 25
const boardWidth = 15 
let board = new Array(boardHeight).fill(0).map(() => new Array(boardWidth).fill(0))
const boardStartX = 7
const boardStartY = 1
const blockSize = 32

const background = {
  tick(ctx) {
    ctx.fillStyle = 'fuchsia'
    ctx.fillRect(0, 0, 480, 800)
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
  direction: 2
}

const straightPiece = {
  shapes: [
    [[0,0],[0,1],[0,2],[0,3]],
    [[0,0],[1,0],[2,0],[3,0]],
  ],
  offset: [-1,0],
  direction: 0
}

const allPieces = [teePiece, straightPiece]

let currentPiece;
function nextPiece() {
  const randomPieceNumber = getRandomInt(0, allPieces.length - 1)
  const randomPiece = allPieces[randomPieceNumber]
  currentPiece = Object.assign({
    position: [boardStartY, boardStartX]
  }, randomPiece)
}
nextPiece()

const checkCollision = () => {
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
  return currentPiece.shapes[currentPiece.direction].some(element => {
    const x = currentPiece.position[1] + element[1] + currentPiece.offset[1]

    if (x < 0 || x > boardWidth - 1) {
      return true
    }
    return false
  })
} 

const renderPieceToBoard = (piece) => {
  renderCurrentPiece.timeout = 1500
  let crashed = false
  piece.shapes[piece.direction].forEach(element => {
    const y = piece.position[0] + element[0] + piece.offset[0]
    const x = piece.position[1] + element[1] + piece.offset[1]
    if (y < 0) {
      crashed = true
      return
    }
    board[y][x] = 1
  })

  if (crashed) {
    gameOver()
    return
  }

  board = board.filter(line => !line.every(tile => tile === 1))
  const linesToAdd = boardHeight - board.length
  console.log('linesToAdd', linesToAdd, 'height', boardHeight, 'board length', board.length)
  board.splice(0, 0, ...(new Array(linesToAdd).fill(0).map(() => new Array(boardWidth).fill(0))))
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
        renderPieceToBoard(currentPiece)
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

  if(checkBorders()) {
    piece.position[1] += 1
  }
}

const shiftRight = (piece) => {
  piece.position[1] += 1

  if(checkBorders()) {
    piece.position[1] -= 1
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
          renderPieceToBoard(currentPiece)
          currentPiece = null
          return
        }
        
        if (checkBorders()) {
          rotateRight(currentPiece)
        }
      }
      
      break;
    case 'KeyD':
      if (currentPiece) {
        rotateRight(currentPiece)

        if (checkCollision()) {
          rotateLeft(currentPiece)
          renderPieceToBoard(currentPiece)
          currentPiece = null
          return
        }

        if (checkBorders()) {
          rotateLeft(currentPiece)
        }
      }
      break;

    case 'ArrowLeft':
      if (currentPiece) {
        shiftLeft(currentPiece)
      }
      
      break;
    case 'ArrowRight':
      if (currentPiece) {
        shiftRight(currentPiece)
      }
    break;

    case 'ArrowDown':
      if (currentPiece) {
        renderCurrentPiece.timeout = 125
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
loop.start()
