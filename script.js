const boardElement = document.getElementById('board');
const turnText = document.getElementById('turn-text');
const turnDot = document.getElementById('turn-dot');
const resetButton = document.getElementById('reset-btn');
const scoreWhiteEl = document.getElementById('score-white');
const scoreBlackEl = document.getElementById('score-black');
const gameStatusEl = document.getElementById('game-status');

// Chat Elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

const pieces = {
    r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
    R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
};

const pieceValues = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
    P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0
};

// Initial Board State
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
let scores = { white: 0, black: 0 };
let validMoves = [];

function initGame() {
    board = JSON.parse(JSON.stringify(initialBoard));
    currentPlayer = 'white';
    selectedSquare = null;
    scores = { white: 0, black: 0 };
    validMoves = [];
    updateTurnDisplay();
    updateScoreDisplay();
    gameStatusEl.textContent = "Game in progress";
    renderBoard();
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

function updateScoreDisplay() {
    scoreWhiteEl.textContent = scores.white;
    scoreBlackEl.textContent = scores.black;
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

            // Highlight selected square
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
            }

            // Highlight valid moves
            if (selectedSquare) {
                const isMove = validMoves.some(m => m.row === row && m.col === col);
                if (isMove) {
                    if (piece) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}

function isWhite(piece) {
    if (!piece) return false;
    return piece === piece.toUpperCase();
}

function handleSquareClick(row, col) {
    const piece = board[row][col];

    // If a square is already selected
    if (selectedSquare) {
        // Deselect if clicking same square
        if (selectedSquare.row === row && selectedSquare.col === col) {
            selectedSquare = null;
            validMoves = [];
            renderBoard();
            return;
        }

        // Attempt move
        if (validMoves.some(m => m.row === row && m.col === col)) {
            movePiece(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            validMoves = [];
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
            validMoves = getValidMoves(row, col, piece);
            renderBoard();
        }
    }
}

function getValidMoves(row, col, piece) {
    const moves = [];
    const type = piece.toLowerCase();
    const isPieceWhite = isWhite(piece);

    // Helper to check if a square is on board
    const onBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

    // Helper to add move if valid (empty or enemy)
    const addIfValid = (r, c) => {
        if (!onBoard(r, c)) return false;
        const target = board[r][c];
        if (!target) {
            moves.push({ row: r, col: c });
            return true; // Continue sliding
        } else if (isWhite(target) !== isPieceWhite) {
            moves.push({ row: r, col: c });
            return false; // Stop sliding (capture)
        }
        return false; // Stop sliding (blocked by friend)
    };

    if (type === 'p') {
        const direction = isPieceWhite ? -1 : 1;
        const startRow = isPieceWhite ? 6 : 1;

        // Move forward 1
        if (onBoard(row + direction, col) && !board[row + direction][col]) {
            moves.push({ row: row + direction, col: col });
            // Move forward 2
            if (row === startRow && onBoard(row + direction * 2, col) && !board[row + direction * 2][col]) {
                moves.push({ row: row + direction * 2, col: col });
            }
        }
        // Captures
        [[direction, -1], [direction, 1]].forEach(([dr, dc]) => {
            const r = row + dr, c = col + dc;
            if (onBoard(r, c)) {
                const target = board[r][c];
                if (target && isWhite(target) !== isPieceWhite) {
                    moves.push({ row: r, col: c });
                }
            }
        });
    } else if (type === 'n') {
        const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        offsets.forEach(([dr, dc]) => addIfValid(row + dr, col + dc));
    } else if (type === 'k') {
        const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        offsets.forEach(([dr, dc]) => addIfValid(row + dr, col + dc));
    } else {
        // Sliding pieces (R, B, Q)
        const directions = [];
        if (type === 'r' || type === 'q') directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        if (type === 'b' || type === 'q') directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);

        directions.forEach(([dr, dc]) => {
            let r = row + dr, c = col + dc;
            while (addIfValid(r, c)) {
                r += dr;
                c += dc;
            }
        });
    }

    return moves;
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    const targetPiece = board[toRow][toCol];

    // Capture logic
    if (targetPiece) {
        const value = pieceValues[targetPiece];
        if (isWhite(targetPiece)) {
            scores.black += value;
        } else {
            scores.white += value;
        }
        updateScoreDisplay();
        addChatMessage('System', `${currentPlayer === 'white' ? 'White' : 'Black'} captured ${targetPiece}!`);
    }

    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '';
}

function switchTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnDisplay();
}

// Chat Logic
function addChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'text-sm mb-1';

    const senderSpan = document.createElement('span');
    senderSpan.className = 'font-bold mr-1 ' + (sender === 'System' ? 'text-yellow-400' : 'text-indigo-400');
    senderSpan.textContent = sender + ':';

    const textSpan = document.createElement('span');
    textSpan.className = 'text-slate-300';
    textSpan.textContent = text;

    msgDiv.appendChild(senderSpan);
    msgDiv.appendChild(textSpan);

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatSend() {
    const text = chatInput.value.trim();
    if (text) {
        const sender = currentPlayer === 'white' ? 'Player 1' : 'Player 2';
        addChatMessage(sender, text);
        chatInput.value = '';
    }
}

chatSend.addEventListener('click', handleChatSend);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSend();
});

resetButton.addEventListener('click', () => {
    initGame();
    addChatMessage('System', 'Game reset.');
});

// Start the game
initGame();
addChatMessage('System', 'Game started. White to move.');
