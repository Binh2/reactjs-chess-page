import { white, black, DEBUG } from './global'
import React, { useState, useEffect } from 'react';

export type BoardType = string[][];
export type PossibleMovesType = PossibleMoveType[];
type HistoryType = string[][][];
type CastlingRightsType = { K: boolean, Q: boolean, k: boolean, q: boolean }; // Like FEN notation
export type PossibleMoveType = {
    type: 'move' | 'remove' | 'change',
    from: [number, number],
    to: [number, number],
    isCapture?: boolean,
    // isCastling?: boolean,
    // isEnPassant?: boolean,
    newPiece?: string,
    child?: PossibleMoveType
}
export function generalMovesFrom(board: BoardType, piece: string, from: [number, number], isWhiteTurn: boolean, directions: [number, number][], maxSteps: number, canCapture = true) {
    let [fromRow, fromCol] = from;
    // Piece: exists on the from square
    if (board[fromRow][fromCol] !== piece) return [];
    let moves: PossibleMovesType = [];
    
    for (let [dr, dc] of directions) {
        let toRow = fromRow + dr;
        let toCol = fromCol + dc;
        
        for (let step = 0; step < maxSteps; step++) {
            if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) break; // Out of bounds

            // Piece: Move to empty square
            if (board[toRow][toCol] === '.') {
                moves.push({ type: 'move', from, to: [toRow, toCol] });
            }
            // Piece: Blocked by own piece
            else if (isWhiteTurn && white.all.split('').includes(board[toRow][toCol]) ||
                (!isWhiteTurn && black.all.split('').includes(board[toRow][toCol]))) {
                break;
            }
            // Piece: Can't capture opponent piece
            else if (!canCapture && 
                ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) ||
                (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol])))) {
                break;
            }
            // Piece: Capture opponent piece
            else if (canCapture && 
                ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) ||
                (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol])))) {
                console.log('Capture', piece, 'from', from, 'to', [toRow, toCol]);
                moves.push({ type: 'move', from, to: [toRow, toCol], isCapture: true });
                break;
                
            }
            toRow += dr;
            toCol += dc;
        }
    }
    return moves;
}
export function pawnMovesFrom(board: BoardType, from: [number, number], isWhiteTurn: boolean, enPassantTarget: [number, number] | null) {
    let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];
    let direction = isWhiteTurn ? 1 : -1;
    let piece = isWhiteTurn ? white.pawn : black.pawn;

    // Pawn: Move 2 square forward
    if (fromRow === (isWhiteTurn ? 1 : 6)) { moves.push(...generalMovesFrom(board, piece, from, isWhiteTurn, [[direction, 0]], 2, false)) }
    // Pawn: Move 1 square forward
    else { moves.push(...generalMovesFrom(board, piece, from, isWhiteTurn, [[direction, 0]], 1, false)) }

    // Pawn: Capture diagonally from left to right
    let toRow = fromRow + direction, toCol = fromCol + 1;
    if ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) || 
    (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol]))) {
        moves.push(...generalMovesFrom(board, piece, from, isWhiteTurn, [[direction, 1]], 1));
    }

    // Pawn: Capture diagonally from right to left
    toRow = fromRow + direction, toCol = fromCol - 1;
    if ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) || 
    (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol]))) {
        moves.push(...generalMovesFrom(board, piece, from, isWhiteTurn, [[direction, -1]], 1));
    }

    // Pawn: En passant captures from left to right
    toRow = fromRow + direction, toCol = fromCol + 1;
    let capturedPieceRow = fromRow, capturedPieceCol = toCol;
    if (fromRow === (piece === white.pawn ? 4 : 3) && 
        enPassantTarget && enPassantTarget[0] === toRow && enPassantTarget[1] === toCol &&
        fromCol < 7 && board[capturedPieceRow][capturedPieceCol] === (piece === white.pawn ? black.pawn : white.pawn)
    ){
        let child: PossibleMoveType = { 
            type: 'remove', 
            from: [capturedPieceRow, capturedPieceCol],
            to: [capturedPieceRow, capturedPieceCol]
        };
        moves.push({ type: 'move', from, to: [toRow, toCol], isCapture: true, child }); // true indicates en passant
    }
    // Pawn: En passant captures from right to left
    if (!enPassantTarget) return moves;
    toRow = fromRow + direction, toCol = fromCol - 1;
    capturedPieceRow = fromRow, capturedPieceCol = toCol;
    if (fromRow === (isWhiteTurn ? 4 : 3) && 
        enPassantTarget && enPassantTarget[0] === toRow && enPassantTarget[1] === toCol &&
        fromCol > 0 && board[capturedPieceRow][capturedPieceCol] === (isWhiteTurn ? black.pawn : white.pawn)
    ){
        let child = {
            type: 'remove' as const,
            from: [capturedPieceRow, capturedPieceCol] as [number, number],
            to: [capturedPieceRow, capturedPieceCol] as [number, number]
        };
        moves.push({ type: 'move', from, to: [toRow, toCol], isCapture: true, child }); // true indicates en passant
    }
    return moves;
}
export function rookMovesFrom(board: BoardType, from: [number, number], isWhiteTurn: boolean) {
    return generalMovesFrom(board, isWhiteTurn ? white.rook : black.rook, from, isWhiteTurn, [[0,1], [1,0], [0,-1], [-1,0]], 8);
}
export function knightMovesFrom(board: BoardType, from: [number, number], isWhiteTurn: boolean) {
    return generalMovesFrom(board, isWhiteTurn ? white.knight : black.knight, from, isWhiteTurn, [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]], 1);
}
export function bishopMovesFrom(board: BoardType, from: [number, number], isWhiteTurn: boolean) {
    return generalMovesFrom(board, isWhiteTurn ? white.bishop : black.bishop, from, isWhiteTurn, [[1,1], [1,-1], [-1,1], [-1,-1]], 8);
}
export function queenMovesFrom(board: BoardType, from: [number, number], isWhiteTurn: boolean) {
    return generalMovesFrom(board, isWhiteTurn ? white.queen : black.queen, from, isWhiteTurn, [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]], 8);
}
export function kingNormalMovesFrom(board: BoardType, from: [number, number], isWhiteTurn: boolean) {
    return generalMovesFrom(board, isWhiteTurn ? white.king : black.king, from, isWhiteTurn, [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]], 1);
}
export function kingCastlingMovesFrom(board: BoardType, isWhiteTurn: boolean, castlingRights: CastlingRightsType) {
    let moves: PossibleMovesType = [];
    // White king: Queenside castling
    if (isWhiteTurn && castlingRights['Q'] && 
        board[0][0] === white.rook && board[0][1] === '.' && 
        board[0][2] === '.' && board[0][3] === '.' && board[0][4] === white.king) {
        const child: PossibleMoveType = { type: "move", from: [0, 0], to: [0, 3] };
        moves.push({ type: 'move', from: [0, 4], to: [0, 2], child });
    }
    // White king: Kingside castling
    else if (isWhiteTurn && castlingRights['K'] && 
        board[0][4] === white.king && board[0][5] === '.' && 
        board[0][6] === '.' && board[0][7] === white.rook) {
        const child: PossibleMoveType = { type: "move", from: [0, 7], to: [0, 5] };
        moves.push({ type: 'move', from: [0, 4], to: [0, 6], child });
    } 
    // Black king: Queenside castling
    else if (!isWhiteTurn && castlingRights['q'] && 
        board[7][0] === black.rook && board[7][1] === '.' && 
        board[7][2] === '.' && board[7][3] === '.' && board[7][4] === black.king) {
        const child: PossibleMoveType = { type: "move", from: [7, 0], to: [7, 3] };
        moves.push({ type: 'move', from: [7, 4], to: [7, 2], child });
    } 
    // Black king: Kingside castling
    else if (!isWhiteTurn && castlingRights['k'] && 
        board[7][4] === black.king && board[7][5] === '.' && 
        board[7][6] === '.' && board[7][7] === black.rook ) {
        const child: PossibleMoveType = { type: "move", from: [7, 7], to: [7, 5] };
        moves.push({ type: 'move', from: [7, 4], to: [7, 6], child });
    }
    return moves;
}
export function kingMovesFrom(board: BoardType, from: [number, number], isWhiteTurn: boolean, castlingRights: CastlingRightsType) {
    let moves: PossibleMovesType = [];

    moves.push(...kingNormalMovesFrom(board, from, isWhiteTurn));
    moves.push(...kingCastlingMovesFrom(board, isWhiteTurn, castlingRights));
    return moves;
}


export function generalMovesTo(board: BoardType, piece: string, to: [number, number], isWhiteTurn: boolean, directions: [number, number][], maxSteps: number, canCapture = true) {
    console.log('generalMovesTo', to, directions);
    let [toRow, toCol] = to;
    // Piece: blocked by own piece
    if (isWhiteTurn && white.all.split('').includes(board[toRow][toCol])) return [];
    if (!isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) return [];
    let moves: PossibleMovesType = [];
    
    for (let [dr, dc] of directions) {
        let fromRow = toRow - dr;
        let fromCol = toCol - dc;
        let from = [fromRow, fromCol] as [number, number];
        console.log('generalMovesTo from', [dr, dc], 'from', from, 'to', to);

        for (let step = 0; step < maxSteps; step++) {
            if (fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8) break; // Out of bounds
            console.log('Checking from', from, 'to', to, 'for piece', piece, 'condition', canCapture && 
                ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) ||
                (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol]))));
            // Piece: Found a piece
            if (board[fromRow][fromCol] === piece) { 
                moves.push({ type: 'move', from, to });
                break;
            }
            // Piece: Blocked by any piece
            else if (board[fromRow][fromCol] !== '.') {
                break;
            }
            // Piece: Can't capture opponent piece
            else if (!canCapture && 
                ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) ||
                (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol])))) {
                break;
            }
            // Piece: Captured opponent piece
            else if (canCapture && 
                ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol]) && white.all.split('').includes(board[fromRow][fromCol])) ||
                (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol]) && black.all.split('').includes(board[fromRow][fromCol])))) {
                moves.push({ type: 'move', from, to, isCapture: true });
                break;
            }
            fromRow -= dr;
            fromCol -= dc;
            from = [fromRow, fromCol] as [number, number];
        }
    }
    return moves;
}

export function pawnMovesTo(board: BoardType, to: [number, number], isWhiteTurn: boolean, enPassantTarget: [number, number] | null, promotionPiece?: string): PossibleMovesType {
    let [toRow, toCol] = to;
    // Pawn: blocked by own piece
    if (isWhiteTurn && white.all.split('').includes(board[toRow][toCol])) return [];
    if (!isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) return [];
    let direction = isWhiteTurn ? 1 : -1;
    let piece = isWhiteTurn ? white.pawn : black.pawn;
    let moves: PossibleMovesType = [];

    // Pawn: Move 2 square forward
    let fromRow = toRow - direction * 2, fromCol = toCol;
    if (fromRow === (isWhiteTurn ? 1 : 6)) {
        moves.push(...generalMovesTo(board, piece, to, isWhiteTurn, [[direction, 0]], 2, false));
    } 
    // Pawn: Move 1 square forward
    else {
        moves.push(...generalMovesTo(board, piece, to, isWhiteTurn, [[direction, 0]], 1, false));
    }
    
    // Pawn: Capture diagonally backward from right to left
    fromRow = toRow - direction, fromCol = toCol + 1;
    if ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) || 
    (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol]))) {
        moves.push(...generalMovesTo(board, piece, to, isWhiteTurn, [[direction, -1]], 1));
    }
    // Pawn: Capture diagonally backward from left to right
    fromRow = toRow - direction, fromCol = toCol - 1;
    if ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) || 
    (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol]))) {
        moves.push(...generalMovesTo(board, piece, to, isWhiteTurn, [[direction, 1]], 1));
    }

    // Pawn: En passant capture from right to left
    fromRow = toRow - direction, fromCol = toCol + 1;
    let capturedPieceRow = fromRow, capturedPieceCol = toCol;
    if (fromCol < 7 && board[fromRow][fromCol] === piece && 
        enPassantTarget && to[0] == enPassantTarget[0] && to[1] === enPassantTarget[1] &&
        ((isWhiteTurn && black.all.split('').includes(board[capturedPieceRow][capturedPieceCol])) || 
        (!isWhiteTurn && white.all.split('').includes(board[capturedPieceRow][capturedPieceCol])))) {
        const child: PossibleMoveType = { type: 'remove', from: [capturedPieceRow, capturedPieceCol], to: [capturedPieceRow, capturedPieceCol] };
        moves.push({ type: 'move', from: [fromRow, fromCol], to, isCapture: true, child });
    }

    // Pawn: En passant capture from left to right
    fromRow = toRow - direction, fromCol = toCol - 1;
    capturedPieceRow = fromRow, capturedPieceCol = toCol;
    if (fromCol > 0 && board[fromRow][fromCol] === piece && 
        enPassantTarget && to[0] == enPassantTarget[0] && to[1] === enPassantTarget[1] &&
        ((isWhiteTurn && black.all.split('').includes(board[capturedPieceRow][capturedPieceCol])) ||
        (!isWhiteTurn && white.all.split('').includes(board[capturedPieceRow][capturedPieceCol])))) {
        const child: PossibleMoveType = { type: 'remove', from: [capturedPieceRow, capturedPieceCol], to: [capturedPieceRow, capturedPieceCol] };
        moves.push({ type: 'move', from: [fromRow, fromCol], to, isCapture: true, child });
    }

    // Pawn: Promotion
    moves = moves.map(m => {
        if (m.to[0] === (isWhiteTurn ? 7 : 0) && promotionPiece) {
            m.child = { type: 'change', from: m.to, to: m.to, 
                newPiece: isWhiteTurn ? white.turnWhite(promotionPiece) : black.turnBlack(promotionPiece),
            };
        }
        return m;
    });

    return moves;
}
export function rookMovesTo(board: BoardType, to: [number, number], isWhiteTurn: boolean) { 
    return generalMovesTo(board, isWhiteTurn ? white.rook : black.rook, to, isWhiteTurn, [[0,1], [1,0], [0,-1], [-1,0]], 8);
}
export function knightMovesTo(board: BoardType, to: [number, number], isWhiteTurn: boolean) { 
    return generalMovesTo(board, isWhiteTurn ? white.knight : black.knight, to, isWhiteTurn, [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]], 1);
}
export function bishopMovesTo(board: BoardType, to: [number, number], isWhiteTurn: boolean) { 
    return generalMovesTo(board, isWhiteTurn ? white.bishop : black.bishop, to, isWhiteTurn, [[1,1], [1,-1], [-1,1], [-1,-1]], 8);
}
export function queenMovesTo(board: BoardType, to: [number, number], isWhiteTurn: boolean) { 
    return generalMovesTo(board, isWhiteTurn ? white.queen : black.queen, to, isWhiteTurn, [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]], 8);
}
export function kingNormalMovesTo(board: BoardType, to: [number, number], isWhiteTurn: boolean) { 
    return generalMovesTo(board, isWhiteTurn ? white.king : black.king, to, isWhiteTurn, [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]], 1);
 }
export function kingCastlingMovesTo(board: BoardType, type: string, isWhiteTurn: boolean, castlingRights: CastlingRightsType): PossibleMovesType {
    if (isWhiteTurn && type === 'longCastle' && castlingRights['Q'] && 
        board[0][0] === white.rook && board[0][1] === '.' && board[0][2] === '.' && board[0][3] === '.' && board[0][4] == white.king) {
        const child: PossibleMoveType = { type: "move", from: [0, 0], to: [0, 3] };
        return [ { type: 'move', from: [0, 4], to: [0, 2], child } ];
    } else if (isWhiteTurn && type === 'shortCastle' && castlingRights['K'] &&
        board[0][4] == white.king && board[0][5] == '.' && board[0][6] == '.' && board[0][7] == white.rook) {
        const child: PossibleMoveType = { type: "move", from: [0, 7], to: [0, 5]};
        return [ { type: 'move', from: [0, 4], to: [0, 6], child } ];
    } else if (!isWhiteTurn && type === 'longCastle' && castlingRights['q'] && 
        board[7][0] === black.rook && board[7][1] === '.' && board[7][2] === '.' && board[7][3] === '.' && board[7][4] == black.king) {
        const child: PossibleMoveType = { type: "move", from: [7, 0], to: [7, 3] };
        return [ { type: 'move', from: [7, 4], to: [7, 2], child } ];
    } else if (!isWhiteTurn && type === 'shortCastle' && castlingRights['k'] &&
        board[7][4] == black.king && board[7][5] == '.' && board[7][6] == '.' && board[7][7] == black.rook) {
        const child: PossibleMoveType = { type: "move", from: [7, 7], to: [7, 5] };
        return [ { type: 'move', from: [7, 4], to: [7, 6], child } ];
    }
    return [];
}

export function getPossibleMoves(board: BoardType, piece: string, enPassantTarget: [number, number] | null, isWhiteTurn: boolean, castlingRights: CastlingRightsType, from: [number, number] ) {
	let moves: PossibleMovesType = [];
	
	// selected piece is white
	if (isWhiteTurn && !Object.values(white).includes(piece)) return [];
	// selected piece is black
	if (!isWhiteTurn && !Object.values(black).includes(piece)) return [];

    if (piece === white.pawn || piece === black.pawn) 
        return pawnMovesFrom(board, from, isWhiteTurn, enPassantTarget);
	else if (piece === white.rook || piece === black.rook) { // Rook moves
		return rookMovesFrom(board, from, isWhiteTurn);
	} else if (piece === white.knight || piece === black.knight) { // Knight moves
		return knightMovesFrom(board, from, isWhiteTurn);
	} else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
		return bishopMovesFrom(board, from, isWhiteTurn);
	} else if (piece === white.queen || piece === black.queen) { // Queen moves
		return queenMovesFrom(board, from, isWhiteTurn);
	} else if (piece === white.king || piece === black.king) { // King moves
		return kingMovesFrom(board, from, isWhiteTurn, castlingRights);
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


export function useBoard({ initialBoard = _initialBoard, initialIsWhiteTurn = true, initialCastlingRights = { K: true, Q: true, k: true, q: true } }: { initialBoard?: BoardType, initialIsWhiteTurn?: boolean, initialCastlingRights?: CastlingRightsType }) {
	const [ board, setBoard ] = useState<BoardType>(initialBoard);
	const [ history, setHistory ] = useState<HistoryType>([initialBoard]);
	const [ historyIndex, setHistoryIndex ] = useState<number>(0);
    const [ isWhiteTurn, setIsWhiteTurn ] = useState<boolean>(initialIsWhiteTurn);
    const [ enPassantTarget, setEnPassantTarget ] = useState<[number, number] | null>(null);
	const [ castlingRights, setCastlingRights ] = useState<CastlingRightsType>(initialCastlingRights);
    const [ halfMovesNum, setHalfMovesNum ] = useState<number>(0);
    const [ fullMovesNum, setFullMovesNum ] = useState<number>(1);

    const [ fenNotations, setFenNotations ] = useState<{move: string, fen: string}[]>([{move: '', fen: getFenNotation(initialBoard, initialIsWhiteTurn, initialCastlingRights, enPassantTarget, 0, 1)}]);
    

    function parseMove(move: string): {type: 'shortCastle' | 'longCastle' | 'normal', piece: string, fromRow?: number, fromCol?: number, to: [number, number], isCapture: boolean, promotionPiece?: string} {
        if (move === 'O-O') return { 
            type: 'shortCastle', 
            piece: isWhiteTurn ? white.king : black.king,
            fromRow: isWhiteTurn ? 0 : 7,
            fromCol: 4,
            to: isWhiteTurn ? [0, 6] : [7, 6],
            isCapture: false
        };
        if (move === 'O-O-O') return { 
            type: 'longCastle', 
            piece: isWhiteTurn ? white.king : black.king,
            fromRow: isWhiteTurn ? 0 : 7,
            fromCol: 4,
            to: isWhiteTurn ? [0, 2] : [7, 2],
            isCapture: false
        };

        const re = /(?<piece>[RNBQK])?(?<from>[a-h]?[1-8]?)(?<isCaptured>x?)(?<to>[a-h][1-8])(=(?<promotionPiece>[RNBQ]))?(?<isCheck>\+?)(?<isCheckMate>#?)/g;
        const match = re.exec(move);
        if (!match) throw new Error(`Invalid move format: ${move}`);
        const { groups } = match;
        if (!groups) throw new Error(`Invalid move format: ${move}`);
        let piece = groups.piece || (isWhiteTurn ? white.pawn : black.pawn);
        console.log('parseMove() isWhiteTurn', isWhiteTurn);
        console.log('piece', piece);
        piece = isWhiteTurn ? white.turnWhite(piece) : black.turnBlack(piece);
        console.log('piece',piece)
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
            isCapture: groups.isCaptured === 'x',
            promotionPiece: groups.promotionPiece && (isWhiteTurn ? white.turnWhite(groups.promotionPiece) : black.turnBlack(groups.promotionPiece))
        };
    }
    

	function move(move: string) {
        if (move === '') return; // Skip empty move (initial state)
        let parsedMove = parseMove(move);
        let { piece, fromRow, fromCol, to, promotionPiece, isCapture } = parsedMove;
        let from = [fromRow, fromCol] as [number, number];
        let [ toRow, toCol ] = to;
        let possibleMoves = [] as PossibleMovesType;
        let isCastling = parsedMove.type === 'shortCastle' || parsedMove.type === 'longCastle' ? true : false;

        let isEnPassant = false;

        if (DEBUG) console.log('parsedMove', parsedMove);
        if (parsedMove.type === 'shortCastle') { // Handle short castling
            possibleMoves.push(...kingCastlingMovesTo(board, 'shortCastle', isWhiteTurn, castlingRights));
        }
        else if (parsedMove.type === 'longCastle') { // Handle long castling
            possibleMoves.push(...kingCastlingMovesTo(board, 'longCastle', isWhiteTurn, castlingRights));
        }
        else if (parsedMove.type !== 'normal' || !parsedMove.to) throw new Error(`Invalid move type: ${move}`);
        else if (parsedMove.promotionPiece && 'QBNRqbnr'.includes(parsedMove.promotionPiece)) {
            possibleMoves.push(...pawnMovesTo(board, to, isWhiteTurn, enPassantTarget, promotionPiece));
        } else {
            // Handle normal moves
            if (parsedMove.piece === white.pawn || parsedMove.piece === black.pawn) {
                if (DEBUG) console.log("pawn moves")
                possibleMoves.push(...pawnMovesTo(board, to, isWhiteTurn, enPassantTarget, promotionPiece));
            }
            else {
                if (piece === white.rook || piece === black.rook) { // Rook moves
                    possibleMoves.push(...rookMovesTo(board, to, isWhiteTurn));
                } else if (piece === white.knight || piece === black.knight) { // Knight moves
                    possibleMoves.push(...knightMovesTo(board, to, isWhiteTurn));
                } else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
                    possibleMoves.push(...bishopMovesTo(board, to, isWhiteTurn));
                } else if (piece === white.queen || piece === black.queen) { // Queen moves
                    possibleMoves.push(...queenMovesTo(board, to, isWhiteTurn));
                } else if (piece === white.king || piece === black.king) { // King moves
                    possibleMoves.push(...kingNormalMovesTo(board, to, isWhiteTurn));
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

        setFenNotations([
            ...fenNotations.slice(0, fenNotations.length - 1), 
            {move: fenNotations[fenNotations.length - 1].move, fen: getFenNotation(board, isWhiteTurn, castlingRights, enPassantTarget, halfMovesNum, fullMovesNum)},
            {move, fen: ""}
        ]);
        console.log('move() enPassantTarget isEnPassant', enPassantTarget, isEnPassant)
        handleMove(possibleMoves[0],board, isWhiteTurn, isCapture);
        console.log('\n\n')
	}

    function handleMove(possibleMove: PossibleMoveType, board: string[][], isWhiteTurn: boolean, isCapture: boolean) {
        let { from, to } = possibleMove;
        let piece = board[from[0]][from[1]];
        let newBoard = movePiece(board, from, to);
        if (possibleMove.child && possibleMove.child.type == 'move') {
            let { from, to } = possibleMove.child
            newBoard = movePiece(newBoard, from, to);
        } else if (possibleMove.child && possibleMove.child.type == 'remove') {
            let { from, to } = possibleMove.child;
            newBoard = removePiece(newBoard, from);
        } else if (possibleMove.child && possibleMove.child.type === 'change') {
            if (possibleMove.child.newPiece) {
                let { from, to, newPiece } = possibleMove.child;
                newBoard = changePiece(newBoard, from, newPiece);
            }
        }

        setBoard(newBoard);
        // console.log("handleMove enPassantTarget", enPassantTarget)
        if ((piece === white.pawn || piece === black.pawn) && Math.abs(from[0] - to[0]) === 2) {
            // console.log("Setting enPassantTarget", to)
            const capturedPieceRow = from[0] + (isWhiteTurn ? 1 : -1);
            const capturedPieceCol = from[1];
            setEnPassantTarget([capturedPieceRow, capturedPieceCol]);
        } else setEnPassantTarget(null);
		setHistory([...history, newBoard]);
		setHistoryIndex(historyIndex + 1);
        setIsWhiteTurn(!isWhiteTurn);
        if (isCapture || piece == white.pawn || piece == black.pawn) setHalfMovesNum(0);
        else setHalfMovesNum(halfMovesNum + 1);
        if (!isWhiteTurn) setFullMovesNum(fullMovesNum + 1);
        updateCastlingRights(newBoard);
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'ArrowLeft') {
            moveHistoryBackward();
        } else if (event.key === 'ArrowRight') {
            moveHistoryForward();
        } else if (event.key === 'Enter') {
            console.log(JSON.stringify(
                [
                    ...fenNotations.slice(0, fenNotations.length - 1),
                    {move: fenNotations[fenNotations.length - 1].move, fen: getFenNotation(board, isWhiteTurn, castlingRights, enPassantTarget, halfMovesNum, fullMovesNum)}
                ]));
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
            setIsWhiteTurn(!isWhiteTurn);
            if (isWhiteTurn) setFullMovesNum(fullMovesNum - 1);
            setBoard(history[historyIndex - 1]);
        }
    }
    function moveHistoryForward() {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setIsWhiteTurn(!isWhiteTurn);
            if (isWhiteTurn) setFullMovesNum(fullMovesNum - 1);
            setBoard(history[historyIndex + 1]);
        }
    }

    function updateCastlingRights(board: string[][]) {
        if (isWhiteTurn) {
            // First white Rook or King moved
            if (board[0][4] !== white.king) setCastlingRights({...castlingRights, Q: false, K: false});
            else {
                if (board[0][0] !== white.rook) setCastlingRights({...castlingRights, Q: false});
                else if (board[0][7] !== white.rook) setCastlingRights({...castlingRights, K: false});
            }
        } else {
            // First black Rook or King moved
            if (board[7][4] !== black.king) setCastlingRights({...castlingRights, q: false, k: false}); else {
                if (board[7][0] !== black.rook) setCastlingRights({...castlingRights, q: false});
                else if (board[7][7] !== black.rook) setCastlingRights({...castlingRights, k: false});
            }
        }
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

	return { 
		board, history, historyIndex, enPassantTarget, isWhiteTurn, castlingRights, halfMovesNum, fullMovesNum, 
        handleMove, move, useAutoMove,
        moveHistoryBackward, moveHistoryForward,
        useKeyDownEvent,
		getPossibleMoves: (from: [number, number]) => getPossibleMoves(board, board[from[0]][from[1]], enPassantTarget, isWhiteTurn, castlingRights, from)
	};
}

export function getFenNotation(board: string[][], isWhiteTurn: boolean, castlingRights: CastlingRightsType, enPassantTarget: [number, number] | null, halfMovesNum: number, fullMovesNum: number) {
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
    const fenCastlingRights = `${castlingRights.K ? 'K' : ''}${castlingRights.Q ? 'Q' : ''}${castlingRights.k ? 'k' : ''}${castlingRights.q ? 'q' : ''}`;
    fen += ` ${fenCastlingRights || '-'}`;
    console.log('getFenNotation enPassantTarget', enPassantTarget);
    if (enPassantTarget) {
        fen += ` ${colChar(enPassantTarget[1]) + (enPassantTarget[0] + 1)}`;
    } else fen += ` -`;
    
    fen += ` ${halfMovesNum}`;
    fen += ` ${fullMovesNum}`;
    return fen;
}
export function parseFenNotation(fen: string) {
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
    const halfMovesNum = parseInt(parts[4]);
    const fullMovesNum = parseInt(parts[5]);
    return { board, isWhiteTurn, castlingRights, halfMovesNum, fullMovesNum };
}

function rowChar(row: number) {
    return String.fromCharCode(49 + row); // 49 is '1'; 0 -> '1', ..., 7 -> '8'
}
function colChar(col: number) {
    return String.fromCharCode(97 + col); // 97 is 'a'; 0 -> 'a', 1 -> 'b', ..., 7 -> 'h'
}
function rowNum(row: string) {
    return parseInt(row) - 1; // '1' -> 0, ..., '8' -> 7
}
function colNum(col: string) {
    return col.charCodeAt(0) - 97; // 'a' -> 0, ..., 'h' -> 7
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