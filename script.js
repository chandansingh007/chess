const boardElement = document.getElementById('board');
const turnText = document.getElementById('turn-text');
const turnDot = document.getElementById('turn-dot');
const resetButton = document.getElementById('reset-btn');

const pieces = {
    r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
    R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
};

// Initial Board State (Fen-like representation or 2D array)
// Lowercase: Black, Uppercase: White
const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let board = [];
let selectedSquare = null;
let currentPlayer = 'white'; // 'white' or 'black'

const scoreWhiteEl = document.getElementById('score-white');
const scoreBlackEl = document.getElementById('score-black');

const pieceValues = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
    P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0
};

let scores = { white: 0, black: 0 };

function initGame() {
    // Deep copy initial board
    board = JSON.parse(JSON.stringify(initialBoard));
    currentPlayer = 'white';
    selectedSquare = null;
    scores = { white: 0, black: 0 };
    updateTurnDisplay();
    updateScoreDisplay();
    renderBoard();
}

function updateScoreDisplay() {
    scoreWhiteEl.textContent = scores.white;
    scoreBlackEl.textContent = scores.black;
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    const targetPiece = board[toRow][toCol];

    // Capture logic
    if (targetPiece) {
        const value = pieceValues[targetPiece];
        if (isWhite(targetPiece)) {
            scores.black += value; // Black captured White piece
        } else {
            scores.white += value; // White captured Black piece
        }
        updateScoreDisplay();
    }

    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '';
}

function updateTurnDisplay() {
    turnText.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
    if (currentPlayer === 'white') {
        turnDot.classList.remove('bg-slate-900', 'border-slate-600');
        turnDot.classList.add('bg-white', 'border-slate-300');
    } else {
        turnDot.classList.remove('bg-white', 'border-slate-300');
        turnDot.classList.add('bg-slate-900', 'border-slate-600');
    }
}

function renderBoard() {
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];
            if (piece) {
                const pieceSpan = document.createElement('span');
                pieceSpan.className = `piece ${isWhite(piece) ? 'white' : 'black'}`;
                pieceSpan.textContent = pieces[piece];
                square.appendChild(pieceSpan);
            }

            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}

function isWhite(piece) {
    return piece === piece.toUpperCase();
}

function handleSquareClick(row, col) {
    const piece = board[row][col];

    // If a square is already selected
    if (selectedSquare) {
        // If clicking the same square, deselect
        if (selectedSquare.row === row && selectedSquare.col === col) {
            selectedSquare = null;
            renderBoard();
            return;
        }

        // Move logic (simplified for now - allows any move to empty or enemy square)
        // TODO: Add proper validation logic
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            movePiece(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            switchTurn();
            renderBoard();
            return;
        }
    }

    // Select a piece
    if (piece) {
        // Only allow selecting own pieces
        if ((currentPlayer === 'white' && isWhite(piece)) ||
            (currentPlayer === 'black' && !isWhite(piece))) {
            selectedSquare = { row, col };
            renderBoard();
        }
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    // Basic validation: Don't capture own pieces
    const targetPiece = board[toRow][toCol];
    const movingPiece = board[fromRow][fromCol];

    if (targetPiece) {
        if (isWhite(movingPiece) === isWhite(targetPiece)) {
            return false; // Cannot capture own piece
        }
    }

    return true; // Allow all other moves for now (prototype)
}

function switchTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnDisplay();
}

resetButton.addEventListener('click', initGame);

// Start the game
initGame();
