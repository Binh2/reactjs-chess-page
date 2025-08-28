import { white, black } from './global'
import React, { useState } from 'react';

export type BoardType = string[][];
export type PossibleMovesType = ([number, number] | [number, number, boolean])[];
type HasMovedType = { wK: boolean, wR1: boolean, wR2: boolean, bK: boolean, bR1: boolean, bR2: boolean };

export function movePiece(board: BoardType, from: [number, number], to: [number, number]) {
    console.log("movePiece", from, to);
	let [fromRow, fromCol] = from;
	let [toRow, toCol] = to;

	let newBoard = board.map(r => r.slice())
	newBoard[toRow][toCol] = board[fromRow][fromCol];
	newBoard[fromRow][fromCol] = '.';
	return newBoard;
}
export function removePiece(board: BoardType, at: [number, number]) { // for en passant
	console.log("removePiece", at)
	let [row, col] = at;
	let newBoard = board.map(r => r.slice())
	newBoard[row][col] = '.';
	return newBoard;
}
export function pawnForwardMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, hasMoved: HasMovedType, from: [number, number]) {
    let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];
    
    let direction = piece === white.pawn ? -1 : 1;

    // Pawn: Move 1 square forward
    if (board[fromRow + direction][fromCol] === '.') {
        moves.push([fromRow + direction, fromCol]);

        // Pawn: Move 2 squares forward from starting position
        if ((piece === white.pawn && fromRow === 6) || (piece === black.pawn && fromRow === 1)) {
            if (board[fromRow + 2 * direction][fromCol] === '.') {
                moves.push([fromRow + 2 * direction, fromCol]);
            }
        }
    }

    // Pawn: Normal captures
    if (fromCol > 0 && board[fromRow + direction][fromCol - 1] !== '.' &&
        ((piece === white.pawn && Object.values(black).includes(board[fromRow + direction][fromCol - 1])) ||
        (piece === black.pawn && Object.values(white).includes(board[fromRow + direction][fromCol - 1])))) {
        moves.push([fromRow + direction, fromCol - 1]);
    }
    if (fromCol < 7 && board[fromRow + direction][fromCol + 1] !== '.' &&
        ((piece === white.pawn && Object.values(black).includes(board[fromRow + direction][fromCol + 1])) ||
        (piece === black.pawn && Object.values(white).includes(board[fromRow + direction][fromCol + 1])))) {
        moves.push([fromRow + direction, fromCol + 1]);
    }

    // Pawn: En passant captures
    if (!prevMove) return moves;
    if (
        prevMove.piece === (piece === white.pawn ? black.pawn : white.pawn) &&
        Math.abs(prevMove.from[0] - prevMove.to[0]) === 2 && // last move was a 2-square pawn move
        prevMove.to[0] === fromRow && // last move ended on the same row as the pawn
        Math.abs(prevMove.to[1] - fromCol) === 1) { // last move ended next to the pawn
        moves.push([fromRow + direction, prevMove.to[1], true]); // true indicates en passant
    }
    return moves;
}
export function pawnBackwardMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, hasMoved: HasMovedType, from: [number, number], allowMoveOnSelf=false): PossibleMovesType {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];
    let direction = piece === white.pawn ? -1 : 1;

    // Pawn: Move 2 squares backward
    if (board[fromRow - 2 * direction][fromCol] === '.' || (allowMoveOnSelf && board[fromRow - 2 * direction][fromCol] === piece)) {
        moves.push([fromRow - 2 * direction, fromCol]);
    }
    // Pawn: Move 1 square backward
    if (board[fromRow - direction][fromCol] === '.' || (allowMoveOnSelf && board[fromRow - direction][fromCol] === piece)) {
        moves.push([fromRow - direction, fromCol]);
    }
    // Pawn: Capture diagonally backward left
    if (fromCol > 0 && board[fromRow - direction][fromCol - 1] !== '.' &&
        ((piece === white.pawn && Object.values(black).includes(board[fromRow - direction][fromCol - 1])) ||
        (piece === black.pawn && Object.values(white).includes(board[fromRow - direction][fromCol - 1])))) {
        moves.push([fromRow - direction, fromCol - 1]);
    }
    // Pawn: Capture diagonally backward right
    if (fromCol < 7 && board[fromRow - direction][fromCol + 1] !== '.' &&
        ((piece === white.pawn && Object.values(black).includes(board[fromRow - direction][fromCol + 1])) ||
        (piece === black.pawn && Object.values(white).includes(board[fromRow - direction][fromCol + 1])))) {
        moves.push([fromRow - direction, fromCol + 1]);
    }

    return moves;
}
export function rookMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.' || (allowMoveOnSelf && board[r][c] === piece)) { // Rook: Move to empty square
                moves.push([r, c]);
            } else { // Rook: Capture
                if ((Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) ||
                    (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                    moves.push([r, c]);
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}
export function knightMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];

    const knightMoves = [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]];	
    for (let [dr, dc] of knightMoves) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.' || (allowMoveOnSelf && board[r][c] === piece) || // Knight: Move to empty square or capture
                (Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) || // Knight: Capture
                (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                moves.push([r, c]);
            }
        }
    }
    return moves;
}
export function bishopMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    console.log(from)
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    const directions = [[1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.' || (allowMoveOnSelf && board[r][c] === piece)) { // Bishop: Move to empty square
                moves.push([r, c]);
            } else { // Bishop: Capture
                if ((Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) ||
                    (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                    moves.push([r, c]);
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    console.log(moves)
    return moves;
}
export function queenMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    const directions = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.' || (allowMoveOnSelf && board[r][c] === piece)) { // Queen: Move to empty square
                moves.push([r, c]);
            } else { // Queen: Capture
                if ((Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) ||
                    (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                    moves.push([r, c]);
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}
export function kingNormalMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    // King: Moves one square in any direction
    const kingMoves = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of kingMoves) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.' || (allowMoveOnSelf && board[r][c] === piece) || // King: Move to empty square or capture
                (Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) || // King: Capture
                (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                moves.push([r, c]);
            }
        }
    }
    return moves;
}
export function kingCastlingMoves(board: BoardType, piece: string, from: [number, number], hasMoved: HasMovedType) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];
    
    if (piece === white.king && board[7][4] === white.king && // White king: Queenside castling
        !hasMoved['wK'] &&
        !hasMoved['wR1'] && board[7][0] === white.rook &&
        board[7][1] === '.' && board[7][2] === '.' && board[7][3] === '.') {
        moves.push([7, 2, true]); // true indicates castling
    } else if (piece === white.king && board[7][4] === white.king && // White king: Kingside castling
        !hasMoved['wK'] &&
        !hasMoved['wR2'] && board[7][7] === white.rook &&
        board[7][5] === '.' && board[7][6] === '.') {
        moves.push([7, 6, true]); // true indicates castling
    } else if (piece === black.king && board[0][4] === black.king && // Black king: Queenside castling
        !hasMoved['bK'] &&
        !hasMoved['bR1'] && board[0][0] === black.rook &&
        board[0][1] === '.' && board[0][2] === '.' && board[0][3] === '.') {
        moves.push([0, 2, true]); // true indicates castling
    } else if (piece === black.king && board[0][4] === black.king && // Black king: Kingside castling
        !hasMoved['bK'] &&
        !hasMoved['bR2'] && board[0][7] === black.rook &&
        board[0][5] === '.' && board[0][6] === '.') {
        moves.push([0, 6, true]); // true indicates castling
    }
    return moves;
}
export function kingMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, hasMoved: HasMovedType, from: [number, number]) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    moves.push(...kingNormalMoves(board, piece, from));
    moves.push(...kingCastlingMoves(board, piece, from, hasMoved));
    return moves;
}
type PrevMoveType = {piece: string, capturedPiece: string, from: [number, number], to: [number, number]} | null;
export function getPossibleMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, hasMoved: HasMovedType, from: [number, number] ) {
	let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];
	
	// selected piece is white
	if (isWhiteTurn && !Object.values(white).includes(piece)) return [];
	// selected piece is black
	if (!isWhiteTurn && !Object.values(black).includes(piece)) return [];

    if (piece === white.pawn || piece === black.pawn) 
        return pawnForwardMoves(board, piece, prevMove, isWhiteTurn, hasMoved, from);
	else if (piece === white.rook || piece === black.rook) { // Rook moves
		return rookMoves(board, piece, from);
	} else if (piece === white.knight || piece === black.knight) { // Knight moves
		return knightMoves(board, piece, from);
	} else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
		return bishopMoves(board, piece, from);
	} else if (piece === white.queen || piece === black.queen) { // Queen moves
		return queenMoves(board, piece, from);
	} else if (piece === white.king || piece === black.king) { // King moves
		return kingMoves(board, piece, prevMove, isWhiteTurn, hasMoved, from);
	}
	return []; 
}


const initialBoard = [
	[black.rook, black.knight, black.bishop, black.queen, black.king, black.bishop, black.knight, black.rook],
	[black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	[white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn],
	[white.rook, white.knight, white.bishop, white.queen, white.king, white.bishop, white.knight, white.rook],
]


type HistoryType = string[][][];
export function useBoard() {
	const [ board, setBoard ] = useState<BoardType>(initialBoard);
	const [ history, setHistory ] = useState<HistoryType>([initialBoard]);
	const [ historyIndex, setHistoryIndex ] = useState<number>(0);
	const [ prevMove, setPrevMove ] = useState<PrevMoveType>(null);
	const [ hasMoved, setHasMoved ] = useState<HasMovedType>({ wK: false, wR1: false, wR2: false, bK: false, bR1: false, bR2: false });

	function isWhiteTurn() {
		return historyIndex % 2 === 0;
	}

	function updateBoard(newBoard: BoardType) {
		setBoard(newBoard);
		setHistory([...history, newBoard]);
		setHistoryIndex(historyIndex + 1);
	}
    

	function move(move: string) {
		let possibleMoves: PossibleMovesType = [];
        let piece: string = '.';
        let toRow = -1, toCol = -1, to: [number, number] = [-1, -1];
        if (move.length === 2) {
            piece = isWhiteTurn() ? white.pawn : black.pawn;
            toRow = rowNum(move[1]);
            toCol = colNum(move[0]);
            to = [toRow, toCol];
            
            possibleMoves.push(...pawnBackwardMoves(board, piece, prevMove, isWhiteTurn(), hasMoved, to, true));
        }
        else if (move == 'O-O') return; // Short castle: i dont want implement it just yet
        else if (move == 'O-O-O') return; // Short castle: i dont want implement it just yet
        else if (move.length === 3) {
            piece = move[0];
            toCol = colNum(move[1]);
            toRow = rowNum(move[2]);
            to = [ toRow, toCol ];
            
            if (piece === white.rook || piece === black.rook) { // Rook moves
                possibleMoves.push(...rookMoves(board, piece, to, true));
            } else if (piece === white.knight || piece === black.knight) { // Knight moves
                possibleMoves.push(...knightMoves(board, piece, to, true));
            } else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
                // movePiece(board, piece, to);
                possibleMoves.push(...bishopMoves(board, piece, to, true));
            } else if (piece === white.queen || piece === black.queen) { // Queen moves
                possibleMoves.push(...queenMoves(board, piece, to, true));
            } else if (piece === white.king || piece === black.king) { // King moves
                possibleMoves.push(...kingNormalMoves(board, piece, to, true));
            }
        }

        console.log("possibleMoves", possibleMoves)
        possibleMoves = possibleMoves.filter(from => {
            console.log(board[from[0]][from[1]], piece)
            return board[from[0]][from[1]] === piece
        });
        console.log("filtered possibleMoves", possibleMoves)
        if (possibleMoves.length === 0) throw new Error(`Invalid move (${move}): no valid moves found`);
        if (possibleMoves.length > 1) throw new Error(`Invalid move (${move}): ambiguous move, multiple same piece can move to the target square`);
        const newBoard = movePiece(board, possibleMoves[0] as [number, number], to);
        setBoard(newBoard);

		// const from = possibleMoves.filter(m => board[m[0]][m[1]] === piece)[0]; // Still need to fix
		// if (!from) throw new Error(`Invalid move (${move}): piece not found or move not possible`);
        // movePiece(board, from as [number, number], [toRow, toCol])
		handleMove(possibleMoves[0] as [number, number], [toRow, toCol]);
	}

	function handleMove(from: [number, number], to: [number, number]) {
		let newBoard = board;
		// First white Rook or King moved
		if (board[from[0]][from[1]] === white.rook) {
			if (from[0] === 7 && from[1] === 0) setHasMoved({...hasMoved, wR1: true});
			else if (from[0] === 7 && from[1] === 7) setHasMoved({...hasMoved, wR2: true});
		} else if (board[from[0]][from[1]] === white.king) {
			if (from[0] === 7 && from[1] === 4) setHasMoved({...hasMoved, wK: true});
		}
		// First black Rook or King moved
		else if (board[from[0]][from[1]] === black.rook) {
			if (from[0] === 0 && from[1] === 0) setHasMoved({...hasMoved, bR1: true});
			else if (from[0] === 0 && from[1] === 7) setHasMoved({...hasMoved, bR2: true});
		} else if (board[from[0]][from[1]] === black.king) {
			if (from[0] === 0 && from[1] === 4) setHasMoved({...hasMoved, bK: true});
		}

		// King: Castling
		if ((board[from[0]][from[1]] === white.king || board[from[0]][from[1]] === black.king) && 
			getPossibleMoves(board, board[from[0]][from[1]], prevMove, isWhiteTurn(), hasMoved, from).some(p => p[0] === to[0] && p[1] === to[1] && p[2] === true)) {
			if (to[1] === 2) { // Queenside castling
				newBoard = movePiece(newBoard, from, to);// move the king
				newBoard = movePiece(newBoard, [from[0], 0], [from[0], 3]); // move the rook
			} else if (to[1] === 6) { // kingside castling
				newBoard = movePiece(newBoard, from, to); // move the king
				newBoard = movePiece(newBoard, [from[0], 7], [from[0], 5]); // move the rook
			}
			setBoard(newBoard);
		}

		// Pawn: En passant capture
		else if ((board[from[0]][from[1]] === white.pawn || 
			board[from[0]][from[1]] === black.pawn) && 
			getPossibleMoves(board, board[from[0]][from[1]], prevMove, isWhiteTurn(), hasMoved, from).some(p => p[0] === to[0] && p[1] === to[1] && p[2] === true)) {
			let direction = board[from[0]][from[1]] === white.pawn ? -1 : 1;
			setBoard(removePiece(movePiece(board, from, to), [to[0] - direction, to[1]]));
		}

		// normal move or capture
		else setBoard(movePiece(board, from, to));

		setPrevMove({ piece: board[from[0]][from[1]], capturedPiece: board[to[0]][to[1]], from, to });
		setHistory([...history, newBoard]);
		setHistoryIndex(historyIndex + 1);
	}

	return { 
		board, history, historyIndex, prevMove, isWhiteTurn: isWhiteTurn(), hasMoved, handleMove, updateBoard, move,
		getPossibleMoves: (from: [number, number]) => getPossibleMoves(board, board[from[0]][from[1]], prevMove, isWhiteTurn(), hasMoved, from)
	};
}

function rowChar(row: number) {
    return String.fromCharCode(56 - row); // 49 is '1'; 7 -> '1', ..., 0 -> '8'
}
function colChar(col: number) {
    return String.fromCharCode(97 + col); // 97 is 'a'; 0 -> 'a', 1 -> 'b', ..., 7 -> 'h'
}
function rowNum(row: string) {
    return 7 - (parseInt(row) - 1); // '1' -> 7, ..., '8' -> 0
}
function colNum(col: string) {
    return col.charCodeAt(0) - 97; // 'a' -> 0, ..., 'h' -> 7
}
function isUppercase(char: string) {
    return char === char.toUpperCase();
}
function isLowercase(char: string) {
    return char === char.toLowerCase();
}