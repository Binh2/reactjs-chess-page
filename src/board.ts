import { white, black, DEBUG } from './global'
import React, { useState, useEffect } from 'react';

export type BoardType = string[][];
export type PossibleMovesType = ({
    from: [number, number],
    to: [number, number],
    // isCapture?: boolean,
    isCastling?: boolean,
    isEnPassant?: boolean
})[];

export function pawnForwardMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, from: [number, number]) {
    let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];
    let direction = piece === white.pawn ? 1 : -1;
    console.log("piece: ", piece, piece === white.pawn, direction)

    // Pawn: Move 1 square forward
    if (board[fromRow + direction][fromCol] === '.') {
        moves.push({ from, to: [fromRow + direction, fromCol] });

        // Pawn: Move 2 squares forward from starting position
        if ((piece === white.pawn && fromRow === 1) || (piece === black.pawn && fromRow === 6)) {
            if (board[fromRow + 2 * direction][fromCol] === '.') {
                moves.push({ from, to: [fromRow + 2 * direction, fromCol] });
            }
        }
    }

    // Pawn: Normal captures
    if (fromCol > 0 && board[fromRow + direction][fromCol - 1] !== '.' &&
        ((piece === white.pawn && Object.values(black).includes(board[fromRow + direction][fromCol - 1])) ||
        (piece === black.pawn && Object.values(white).includes(board[fromRow + direction][fromCol - 1])))) {
        moves.push({ from, to: [fromRow + direction, fromCol - 1] });
    }
    if (fromCol < 7 && board[fromRow + direction][fromCol + 1] !== '.' &&
        ((piece === white.pawn && Object.values(black).includes(board[fromRow + direction][fromCol + 1])) ||
        (piece === black.pawn && Object.values(white).includes(board[fromRow + direction][fromCol + 1])))) {
        moves.push({ from, to: [fromRow + direction, fromCol + 1] });
    }

    // Pawn: En passant captures
    if (!prevMove) return moves;
    if (
        prevMove.piece === (piece === white.pawn ? black.pawn : white.pawn) &&
        Math.abs(prevMove.from[0] - prevMove.to[0]) === 2 && // last move was a 2-square pawn move
        prevMove.to[0] === fromRow && // last move ended on the same row as the pawn
        Math.abs(prevMove.to[1] - fromCol) === 1) { // last move ended next to the pawn
        moves.push({ from, to: [fromRow + direction, prevMove.to[1]], isEnPassant: true }); // true indicates en passant
    }
    return moves;
}
export function pawnBackwardMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, to: [number, number], allowMoveOnSelf=false): PossibleMovesType {
    let [toRow, toCol] = to;
    let moves: PossibleMovesType = [];
    let direction = piece === white.pawn ? 1 : -1;
    if (DEBUG) console.log("piece: ", piece, piece === white.pawn)
    if (DEBUG) console.log("direction: ", direction)
    let allowedToSquares = allowMoveOnSelf ? [ '.', piece ] : [ '.' ];

    // if (DEBUG) console.log("Pawn backward moves: ", moves);
    // Pawn: Move 2 squares backward
    if (allowedToSquares.includes(board[toRow - 2 * direction][toCol]) && 
    board[toRow][toCol] === '.' ||
    ((isWhiteTurn && toRow - 2 * direction === 1) || 
    (!isWhiteTurn && toRow - 2 * direction === 6))) {
        moves.push({ from: [toRow - 2 * direction, toCol], to });
    }
    // Pawn: Move 1 square backward
    if (allowedToSquares.includes(board[toRow - direction][toCol]) &&
    board[toRow][toCol] === '.') {
        moves.push({ from: [toRow - direction, toCol], to });
    }
    // Pawn: Capture diagonally backward from left
    if (toCol > 0 && board[toRow - direction][toCol - 1] === piece &&
        ((piece === white.pawn && board[toRow - direction][toCol - 1] === white.pawn && 'RNBQP'.toLowerCase().split('').includes(board[toRow][toCol])) ||
        (piece === black.pawn && board[toRow - direction][toCol - 1] === black.pawn && 'rnbqp'.toUpperCase().split('').includes(board[toRow][toCol])))) {
        moves.push({ from: [toRow - direction, toCol - 1], to });
    }
    // Pawn: Capture diagonally backward from right
    if (toCol < 7 && board[toRow - direction][toCol + 1] === piece &&
        ((piece === white.pawn && board[toRow - direction][toCol + 1] === white.pawn && 'RNBQP'.toLowerCase().split('').includes(board[toRow][toCol])) ||
        (piece === black.pawn && board[toRow - direction][toCol + 1] === black.pawn && 'rnbqp'.toUpperCase().split('').includes(board[toRow][toCol])))) {
        moves.push({ from: [toRow - direction, toCol + 1], to });
    }

    return moves;
}
export function rookBackwardMoves(board: BoardType, piece: string, to: [number, number]) { return rookMoves(board, piece, to, true); }
export function rookMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.') { // Rook: Move to empty square
                if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ from, to: [r, c] });
            } else if (allowMoveOnSelf && board[r][c] === piece) {
                moves.push({ from: [r, c], to: [fromRow, fromCol] });
                break;
            } else { // Rook: Capture
                if ((Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) ||
                    (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                    if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                    else moves.push({ from, to: [r, c] });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}
export function knightBackwardMoves(board: BoardType, piece: string, to: [number, number]) { return knightMoves(board, piece, to, true); }
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
                if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ from, to: [r, c] });
            }
        }
    }
    return moves;
}
export function bishopBackwardMoves(board: BoardType, piece: string, to: [number, number]) { return bishopMoves(board, piece, to, true); }
export function bishopMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    console.log(from)
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    const directions = [[1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.') { // Bishop: Move to empty square
                if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ from, to: [r, c] });
            } else if (allowMoveOnSelf && board[r][c] === piece) {
                moves.push({ from: [r, c], to: [fromRow, fromCol] });
                break;
            } else { // Bishop: Capture
                if ((Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) ||
                    (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                    if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                    else moves.push({ from, to: [r, c] });
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
export function queenBackwardMoves(board: BoardType, piece: string, to: [number, number]) { return queenMoves(board, piece, to, true); }
export function queenMoves(board: BoardType, piece: string, from: [number, number], allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    const directions = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.') { // Queen: Move to empty square
                if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ from, to: [r, c] });
            } else if (allowMoveOnSelf && board[r][c] === piece) {
                moves.push({ from: [r, c], to: [fromRow, fromCol] });
                break;
            } else { // Queen: Capture
                if ((Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) ||
                    (Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
                    if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                    else moves.push({ from, to: [r, c] });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}
export function kingNormalBackwardMoves(board: BoardType, piece: string, to: [number, number]) { return kingNormalMoves(board, piece, to, true); }
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
                if (allowMoveOnSelf) moves.push({ from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ from, to: [r, c] });
            }
        }
    }
    return moves;
}
export function kingCastlingMoves(board: BoardType, piece: string, from: [number, number], castlingRights: CastlingRightsType) {
    if (DEBUG === true) console.log("kingCastlingMoves", piece, from, castlingRights)
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];
    
    if (piece === white.king && board[0][4] === white.king && // White king: Queenside castling
        castlingRights['Q'] && board[0][0] === white.rook &&
        board[0][1] === '.' && board[0][2] === '.' && board[0][3] === '.') {
        moves.push({ from, to: [0, 2], isCastling: true }); // true indicates castling
    } else if (piece === white.king && board[0][4] === white.king && // White king: Kingside castling
        castlingRights['K'] && board[0][7] === white.rook &&
        board[0][5] === '.' && board[0][6] === '.') {
        moves.push({ from, to: [0, 6], isCastling: true }); // true indicates castling
    } else if (piece === black.king && board[7][4] === black.king && // Black king: Queenside castling
        castlingRights['q'] &&
        board[7][0] === black.rook &&
        board[7][1] === '.' && board[7][2] === '.' && board[7][3] === '.') {
        moves.push({ from, to: [7, 2], isCastling: true }); // true indicates castling
    } else if (piece === black.king && board[7][4] === black.king && // Black king: Kingside castling
        castlingRights['k'] &&
        board[7][7] === black.rook &&
        board[7][5] === '.' && board[7][6] === '.') {
        moves.push({ from, to: [7, 6], isCastling: true }); // true indicates castling
    }
    return moves;
}
export function kingCastlingBackwardMoves(type: string, isWhiteTurn: boolean): PossibleMovesType {
    if (isWhiteTurn && type === 'longCastle') {
        return [ { from: [0, 4], to: [0, 2], isCastling: true } ];
    } else if (isWhiteTurn && type === 'shortCastle') {
        return [ { from: [0, 4], to: [0, 6], isCastling: true } ];
    } else if (!isWhiteTurn && type === 'longCastle') {
        return [ { from: [7, 4], to: [7, 2], isCastling: true } ];
    } else if (!isWhiteTurn && type === 'shortCastle') {
        return [ { from: [7, 4], to: [7, 6], isCastling: true } ];
    }
    return [];
}
export function kingMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, castlingRights: CastlingRightsType, from: [number, number]) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    moves.push(...kingNormalMoves(board, piece, from));
    moves.push(...kingCastlingMoves(board, piece, from, castlingRights));
    return moves;
}
type PrevMoveType = {piece: string, capturedPiece: string, from: [number, number], to: [number, number]} | null;
export function getPossibleMoves(board: BoardType, piece: string, prevMove: PrevMoveType, isWhiteTurn: boolean, castlingRights: CastlingRightsType, from: [number, number] ) {
	let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];
	
	// selected piece is white
	if (isWhiteTurn && !Object.values(white).includes(piece)) return [];
	// selected piece is black
	if (!isWhiteTurn && !Object.values(black).includes(piece)) return [];

    if (piece === white.pawn || piece === black.pawn) 
        return pawnForwardMoves(board, piece, prevMove, isWhiteTurn, from);
	else if (piece === white.rook || piece === black.rook) { // Rook moves
		return rookMoves(board, piece, from);
	} else if (piece === white.knight || piece === black.knight) { // Knight moves
		return knightMoves(board, piece, from);
	} else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
		return bishopMoves(board, piece, from);
	} else if (piece === white.queen || piece === black.queen) { // Queen moves
		return queenMoves(board, piece, from);
	} else if (piece === white.king || piece === black.king) { // King moves
		return kingMoves(board, piece, prevMove, isWhiteTurn, castlingRights, from);
	}
	return []; 
}

// Board is flip horizontally
const _initialBoard = [
    [black.rook, black.knight, black.bishop, black.queen, black.king, black.bishop, black.knight, black.rook],
	[black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	['.', '.', '.', '.', '.', '.', '.', '.'],
	[white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn],
    [white.rook, white.knight, white.bishop, white.queen, white.king, white.bishop, white.knight, white.rook],
].splice(0).reverse();


type HistoryType = string[][][];
type CastlingRightsType = { K: boolean, Q: boolean, k: boolean, q: boolean }; // Like FEN notation
export function useBoard({ initialBoard = _initialBoard, initialIsWhiteTurn = true, initialCastlingRights = { K: false, Q: false, k: false, q: false } }: { initialBoard?: BoardType, initialIsWhiteTurn?: boolean, initialCastlingRights?: CastlingRightsType }) {
	const [ board, setBoard ] = useState<BoardType>(initialBoard);
	const [ history, setHistory ] = useState<HistoryType>(initialIsWhiteTurn ? [initialBoard] : [initialBoard, initialBoard]); // Temporary solution so there's an index at 1
	const [ historyIndex, setHistoryIndex ] = useState<number>(initialIsWhiteTurn ? 0 : 1);
	const [ prevMove, setPrevMove ] = useState<PrevMoveType>(null);
	const [ castlingRights, setCastlingRights ] = useState<CastlingRightsType>(initialCastlingRights);

	function isWhiteTurn() {
		return historyIndex % 2 === 0;
	}

	function updateBoard(newBoard: BoardType) {
		setBoard(newBoard);
		setHistory([...history, newBoard]);
		setHistoryIndex(historyIndex + 1);
	}
    

    function parseMove(move: string): {type: 'shortCastle' | 'longCastle' | 'normal', piece: string, fromRow?: number, fromCol?: number, to: [number, number], promotionPiece?: string} {
        if (move === 'O-O') return { 
            type: 'shortCastle', 
            piece: isWhiteTurn() ? white.king : black.king,
            fromRow: isWhiteTurn() ? 0 : 7,
            fromCol: 4,
            to: isWhiteTurn() ? [0, 6] : [7, 6],
        };
        if (move === 'O-O-O') return { 
            type: 'longCastle', 
            piece: isWhiteTurn() ? white.king : black.king,
            fromRow: isWhiteTurn() ? 0 : 7,
            fromCol: 4,
            to: isWhiteTurn() ? [0, 2] : [7, 2],
        };

        const re = /(?<piece>[RNBQK])?(?<from>[a-h]?[1-8]?)(?<isCaptured>x?)(?<to>[a-h][1-8])(=(?<promotionPiece>[RNBQ]))?(?<isCheck>\+?)(?<isCheckMate>#?)/g;
        const match = re.exec(move);
        if (!match) throw new Error(`Invalid move format: ${move}`);
        const { groups } = match;
        if (!groups) throw new Error(`Invalid move format: ${move}`);
        let piece = groups.piece || (isWhiteTurn() ? white.pawn : black.pawn);
        piece = isWhiteTurn() ? piece.toUpperCase() : piece.toLowerCase();
        if (!piece) throw new Error(`Invalid move format: ${move}`);
        let fromRow = undefined;
        let fromCol = undefined;
        if (groups.from.length === 1 && 'abcdefgh'.includes(groups.from[0])) {
            fromCol = colNum(groups.from[0]);
        } else if (groups.from.length === 1 && '12345678'.includes(groups.from[0])) {
            fromRow = rowNum(groups.from[0]);
        } else if (groups.from.length === 2) {
            fromRow = rowNum(groups.from[1]);
            fromCol = colNum(groups.from[0]);
        }
        if (DEBUG) console.log('parseMove fromRow, fromCol: ', fromRow, fromCol);
        if (DEBUG) console.log(groups);

        return { 
            type: 'normal', 
            piece: piece, 
            fromRow,
            fromCol,
            to: [rowNum(groups.to[1]), colNum(groups.to[0])] as [number, number],  
            promotionPiece: groups.promotionPiece && (isWhiteTurn() ? groups.promotionPiece.toUpperCase() : groups.promotionPiece.toLowerCase())
        };
    }
    

	function move(move: string) {
        let parsedMove = parseMove(move);
        let { piece, fromRow, fromCol, to, promotionPiece } = parsedMove;
        let from = [fromRow, fromCol] as [number, number];
        let [ toRow, toCol ] = to;
        let possibleMoves = [] as PossibleMovesType;
        let isCastling = parsedMove.type === 'shortCastle' || parsedMove.type === 'longCastle' ? true : false;
        let isEnPassant = false;

        if (DEBUG === true) console.log('parsedMove', parsedMove);
        if (parsedMove.type === 'shortCastle') { // Handle short castling
            possibleMoves.push(...kingCastlingBackwardMoves('shortCastle', isWhiteTurn()));
            // possibleMoves.push([0,4])
        }
        else if (parsedMove.type === 'longCastle') { // Handle long castling
            possibleMoves.push(...kingCastlingBackwardMoves('longCastle', isWhiteTurn()));
        }
        else if (parsedMove.type !== 'normal' || !parsedMove.to) throw new Error(`Invalid move type: ${move}`);
        else if (parsedMove.promotionPiece && 'QBNRqbnr'.includes(parsedMove.promotionPiece)) {
            // not implemented calling possible moves
            // throw new Error(`Pawn promotion not implemented yet: ${move}`);
            possibleMoves.push(...pawnBackwardMoves(board, piece, prevMove, isWhiteTurn(), to, true));
        } else {
            // Handle normal moves
            if (parsedMove.piece === white.pawn || parsedMove.piece === black.pawn) {
                if (DEBUG) console.log("pawn moves")
                possibleMoves.push(...pawnBackwardMoves(board, piece, prevMove, isWhiteTurn(), to, true));
            }
            else {
                if (piece === white.rook || piece === black.rook) { // Rook moves
                    possibleMoves.push(...rookBackwardMoves(board, piece, to));
                } else if (piece === white.knight || piece === black.knight) { // Knight moves
                    possibleMoves.push(...knightBackwardMoves(board, piece, to));
                } else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
                    possibleMoves.push(...bishopBackwardMoves(board, piece, to));
                } else if (piece === white.queen || piece === black.queen) { // Queen moves
                    possibleMoves.push(...queenBackwardMoves(board, piece, to));
                } else if (piece === white.king || piece === black.king) { // King moves
                    possibleMoves.push(...kingNormalBackwardMoves(board, piece, to));
                }
            }
        }
        if (DEBUG) console.log("possibleMoves", possibleMoves)
        possibleMoves = possibleMoves.filter(possibleMove => {
            if (DEBUG) console.log(parsedMove.fromRow, parsedMove.fromCol,
                parsedMove.fromRow !== undefined ? parsedMove.fromRow : possibleMove.from[0],
                parsedMove.fromCol !== undefined ? parsedMove.fromCol : possibleMove.from[1],
                board[parsedMove.fromRow !== undefined ? parsedMove.fromRow : possibleMove.from[0]][parsedMove.fromCol !== undefined ? parsedMove.fromCol : possibleMove.from[1]],
                board[parsedMove.fromRow !== undefined ? parsedMove.fromRow : possibleMove.from[0]][parsedMove.fromCol !== undefined ? parsedMove.fromCol : possibleMove.from[1]] === piece,
                piece)

            // return false;
            return board[possibleMove.from[0]][possibleMove.from[1]] === piece && 
            (parsedMove.fromRow !== undefined ? parsedMove.fromRow == possibleMove.from[0]: true) &&
            (parsedMove.fromCol !== undefined ? parsedMove.fromCol == possibleMove.from[1]: true);
        });
        if (DEBUG) console.log("filtered possibleMoves", possibleMoves)
        if (possibleMoves.length === 0) throw new Error(`Invalid move (${move}): no valid moves found`);
        if (possibleMoves.length > 1) throw new Error(`Invalid move (${move}): ambiguous move, multiple same piece can move to the target square`);
        from = possibleMoves[0].from;
        if (!from) throw new Error(`Invalid move (${move}): piece not found or move not possible`);
        console.log(board)

        handleMove(board, from, to, promotionPiece, isCastling);
	}

    function handleMove(board: string[][], from: [number, number], to: [number, number], promotionPiece?: string, isCastling?: boolean) {
        console.log("handleMove", from, to);
        let newBoard = movePiece(board, from, to);

		// const from = possibleMoves.filter(m => board[m[0]][m[1]] === piece)[0]; // Still need to fix
		// if (!from) throw new Error(`Invalid move (${move}): piece not found or move not possible`);
        // movePiece(board, from as [number, number], [toRow, toCol])
		if (isCastling) newBoard = updateRookAfterCastling(newBoard, from, to);
        newBoard = updateOtherPawnAfterEnPassant(newBoard, from, to);
        if (promotionPiece) newBoard = updatePawnToPromotedPiece(newBoard, from, to, promotionPiece);

        console.log(newBoard)
        setBoard(newBoard);
        setPrevMove({ piece: board[from[0]][from[1]], capturedPiece: board[to[0]][to[1]], from, to });
		setHistory([...history, newBoard]);
		setHistoryIndex(historyIndex + 1);
        updateCastlingRights();
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft') {
            moveHistoryBackward();
        } else if (event.key === 'ArrowRight') {
            moveHistoryForward();
        }
    }
    function useKeyDownEvent() {
        useEffect(() => {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [moveHistoryBackward, moveHistoryForward,historyIndex]);
    }

    function moveHistoryBackward() {
        console.log('moveHistoryBackward');
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setBoard(history[historyIndex - 1]);
        }
    }
    function moveHistoryForward() {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setBoard(history[historyIndex + 1]);
        }
    }

    function updateCastlingRights() {
        // First white Rook or King moved
        if (board[0][0] !== white.rook) setCastlingRights({...castlingRights, Q: false});
        if (board[0][7] !== white.rook) setCastlingRights({...castlingRights, K: false});
        if (board[0][4] !== white.king) setCastlingRights({...castlingRights, Q: false, K: false});
        // First black Rook or King moved
        if (board[7][0] !== black.rook) setCastlingRights({...castlingRights, q: false});
        if (board[7][7] !== black.rook) setCastlingRights({...castlingRights, k: false});
        if (board[7][4] !== black.king) setCastlingRights({...castlingRights, q: false, k: false});
    }

    const useAutoMove = (moves: string[], delay: number) => {
        // if (DEBUG)debugger;
        useEffect(() => {
            const _move = moves.shift();
            if (!_move) return;
            const timeout = setTimeout(() => {
                if (_move) {
                    move(_move);
                }
            }, delay)
            return () => { clearTimeout(timeout); }
        }, [moves, historyIndex]);
	}

    function updatePawnToPromotedPiece(newBoard: string[][], from: [number, number], to: [number, number], promotionPiece: string) {
        if (DEBUG == true) console.log("updatePawnToPromotedPiece", to, promotionPiece);
        newBoard = changePiece(newBoard, to, promotionPiece);
        return newBoard;
    }

	function updateRookAfterCastling(newBoard: string[][], from: [number, number], to: [number, number]) {
		// King: Castling
        if (DEBUG == true) console.log("handleMove", from, to);
		if ((board[from[0]][from[1]] === white.king || board[from[0]][from[1]] === black.king)){
			if (to[1] === 2) { // Queenside castling
				// newBoard = movePiece(newBoard, from, to);// move the king
				newBoard = movePiece(newBoard, [from[0], 0], [from[0], 3]); // move the rook
                setCastlingRights({ ...castlingRights, [isWhiteTurn() ? 'K' : 'k']: false, [isWhiteTurn() ? 'Q' : 'q']: false });
			} else if (to[1] === 6) { // kingside castling
				// newBoard = movePiece(newBoard, from, to); // move the king
				newBoard = movePiece(newBoard, [from[0], 7], [from[0], 5]); // move the rook
                setCastlingRights({ ...castlingRights, [isWhiteTurn() ? 'K' : 'k']: false, [isWhiteTurn() ? 'Q' : 'q']: false });
			}
			return newBoard;
		}
        return newBoard;
	}
    function updateOtherPawnAfterEnPassant(newBoard: string[][], from: [number, number], to: [number, number]) {
        // Pawn: En passant capture
		if ((newBoard[from[0]][from[1]] === white.pawn || 
			newBoard[from[0]][from[1]] === black.pawn) && 
			getPossibleMoves(newBoard, newBoard[from[0]][from[1]], prevMove, isWhiteTurn(), castlingRights, from).some(p => p.from[0] === to[0] && p.from[1] === to[1] && p.isEnPassant === true)) {
			let direction = newBoard[from[0]][from[1]] === white.pawn ? 1 : -1;
			return removePiece(movePiece(newBoard, from, to), [to[0] - direction, to[1]]);
		}
        return newBoard;
    }

	return { 
		board, history, historyIndex, prevMove, isWhiteTurn: isWhiteTurn(), castlingRights, handleMove, updateBoard, move, useAutoMove,
        moveHistoryBackward, moveHistoryForward,
        useKeyDownEvent,
		getPossibleMoves: (from: [number, number]) => getPossibleMoves(board, board[from[0]][from[1]], prevMove, isWhiteTurn(), castlingRights, from)
	};
}

export function getFenNotation(board: string[][], isWhiteTurn: boolean, castlingRights: CastlingRightsType) {
    let fen = '';
    for (let row = 7; row >= 0; row--) {
        let emptySquares = 0;
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece === '.') {
                emptySquares++;
            } else {
                if (emptySquares > 0) {
                    fen += emptySquares;
                    emptySquares = 0;
                }
                fen += piece;
            }
        }
        if (emptySquares > 0) {
            fen += emptySquares;
        }
        if (row > 0) {
            fen += '/';
        }
    }
    fen += ` ${isWhiteTurn ? 'w' : 'b'}`;
    fen += ` ${castlingRights.K ? 'K' : ''}${castlingRights.Q ? 'Q' : ''}${castlingRights.k ? 'k' : ''}${castlingRights.q ? 'q' : ''}`;
    fen += ` - 0 1`
    return fen;
}
export function readFenNotation(fen: string) {
    const parts = fen.split(' ');
    const board = parts[0].split('/').map(row => {
        const expanded = row.split('').map(char => {
            const num = parseInt(char);
            return isNaN(num) ? char : '.'.repeat(num);
        }).join('');
        return expanded.split('');
    }).splice(0).reverse();
    const isWhiteTurn = parts[1] === 'w';
    const castlingRights: CastlingRightsType = {
        K: parts[2].includes('K'),
        Q: parts[2].includes('Q'),
        k: parts[2].includes('k'),
        q: parts[2].includes('q'),
    };
    return { board, isWhiteTurn, castlingRights };
}

// function rowChar(row: number) {
//     return String.fromCharCode(49 + row); // 49 is '1'; 0 -> '1', ..., 7 -> '8'
// }
// function colChar(col: number) {
//     return String.fromCharCode(97 + col); // 97 is 'a'; 0 -> 'a', 1 -> 'b', ..., 7 -> 'h'
// }
function rowNum(row: string) {
    return parseInt(row) - 1; // '1' -> 0, ..., '8' -> 7
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

export function movePiece(board: BoardType, from: [number, number], to: [number, number]) {
    if (DEBUG) console.log("movePiece", from, to);
	let [fromRow, fromCol] = from;
	let [toRow, toCol] = to;

	let newBoard = board.map(r => r.slice())
	newBoard[toRow][toCol] = board[fromRow][fromCol];
	newBoard[fromRow][fromCol] = '.';
	return newBoard;
}
export function removePiece(board: BoardType, at: [number, number]) { // for en passant
	if (DEBUG) console.log("removePiece", at)
	let [row, col] = at;
	let newBoard = board.map(r => r.slice())
	newBoard[row][col] = '.';
	return newBoard;
}
export function changePiece(board: BoardType, at: [number, number], toPiece: string) { // for pawn promotion
	if (DEBUG) console.log("changePiece", at, toPiece);
	let [row, col] = at;
	let newBoard = board.map(r => r.slice())
	newBoard[row][col] = toPiece;
	return newBoard;
}