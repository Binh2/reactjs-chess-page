import { white, black, DEBUG } from './global'
import React, { useState, useEffect } from 'react';

export type BoardType = string[][];
export type PossibleMovesType = PossibleMoveType[];
export type PossibleMoveType = {
    type: 'move' | 'remove' | 'change',
    from: [number, number],
    to: [number, number],
    // isCapture?: boolean,
    // isCastling?: boolean,
    // isEnPassant?: boolean,
    newPiece?: string,
    child?: PossibleMoveType
}

export function pawnForwardMoves(board: BoardType, from: [number, number], isWhiteTurn: boolean, enPassantTarget: [number, number] | null) {
    let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];
    let direction = isWhiteTurn ? 1 : -1;
    let piece = isWhiteTurn ? white.pawn : black.pawn;

    // Pawn: Move 1 square forward
    let toRow = fromRow + direction, toCol = fromCol;
    if (board[toRow][toCol] === '.') {
        moves.push({ type: 'move', from, to: [toRow, toCol] });
    
        // Pawn: Move 2 squares forward from starting position
        toRow = fromRow + 2 * direction, toCol = fromCol;
        if (board[toRow][toCol] === '.') {
            if ((piece === white.pawn && fromRow === 1) || (piece === black.pawn && fromRow === 6)) {
                moves.push({ type: 'move', from, to: [toRow, toCol] });
            }
        }
    }
    // Pawn: Normal captures from left to right
    toRow = fromRow + direction, toCol = fromCol + 1;
    if (fromCol < 7 && board[toRow][toCol] !== '.' &&
        ((piece === white.pawn && black.all.split('').includes(board[toRow][toCol])) ||
        (piece === black.pawn && white.all.split('').includes(board[toRow][toCol])))) {
        moves.push({ type: 'move', from, to: [toRow, toCol] });
    }
    // Pawn: Normal captures from right to left
    toRow = fromRow + direction, toCol = fromCol - 1;
    if (fromCol > 0 && board[toRow][toCol] !== '.' &&
        ((piece === white.pawn && black.all.split('').includes(board[toRow][toCol])) ||
        (piece === black.pawn && white.all.split('').includes(board[toRow][toCol])))) {
        moves.push({ type: 'move', from, to: [toRow, toCol] });
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
        moves.push({ type: 'move', from, to: [toRow, toCol], child }); // true indicates en passant
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
        moves.push({ type: 'move', from, to: [toRow, toCol], child }); // true indicates en passant
    }
    return moves;
}
export function pawnBackwardMoves(board: BoardType, to: [number, number], isWhiteTurn: boolean, enPassantTarget: [number, number] | null, promotionPiece?: string): PossibleMovesType {
    let [toRow, toCol] = to;
    let direction = isWhiteTurn ? 1 : -1;
    let piece = isWhiteTurn ? white.pawn : black.pawn;
    let moves: PossibleMovesType = [];

    // Pawn: Move 1 square backward
    let fromRow = toRow - direction, fromCol = toCol;
    if (board[fromRow][fromCol] === piece &&
    board[toRow][toCol] === '.') {
        moves.push({ type: "move", from: [toRow - direction, toCol], to });
    }
    // Pawn: Move 2 squares backward
    fromRow = toRow - 2 * direction, fromCol = toCol;
    let middleRow = toRow - direction, middleCol = toCol;
    if (board[fromRow][fromCol] === piece &&
        board[middleRow][middleCol] === '.' &&
        board[toRow][toCol] === '.' ||
        ((isWhiteTurn && fromRow === 1) ||
        (!isWhiteTurn && fromRow === 6))) {
        moves.push({type: "move", from: [fromRow, fromCol], to });
    }
    
    // Pawn: Capture diagonally backward from right to left
    fromRow = toRow - direction, fromCol = toCol + 1;
    if (toCol < 7 && board[fromRow][fromCol] === piece &&
        ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) ||
        (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol])))) {
        moves.push({ type: 'move', from: [fromRow, fromCol], to });
    }
    // Pawn: Capture diagonally backward from left to right
    fromRow = toRow - direction, fromCol = toCol - 1;
    if (toCol > 0 && board[fromRow][fromCol] === piece &&
        ((isWhiteTurn && black.all.split('').includes(board[toRow][toCol])) ||
        (!isWhiteTurn && white.all.split('').includes(board[toRow][toCol])))) {
        moves.push({ type: 'move', from: [fromRow, fromCol], to });
    }

    // Pawn: En passant capture from right to left
    fromRow = toRow - direction, fromCol = toCol + 1;
    let capturedPieceRow = fromRow, capturedPieceCol = toCol;
    if (fromCol < 7 && board[fromRow][fromCol] === piece && 
        enPassantTarget && to[0] == enPassantTarget[0] && to[1] === enPassantTarget[1] &&
        ((isWhiteTurn && black.all.split('').includes(board[capturedPieceRow][capturedPieceCol])) || 
        (!isWhiteTurn && white.all.split('').includes(board[capturedPieceRow][capturedPieceCol])))) {
        const child: PossibleMoveType = { type: 'remove', from: [capturedPieceRow, capturedPieceCol], to: [capturedPieceRow, capturedPieceCol] };
        moves.push({ type: 'move', from: [fromRow, fromCol], to, child });
    }

    // Pawn: En passant capture from left to right
    fromRow = toRow - direction, fromCol = toCol - 1;
    capturedPieceRow = fromRow, capturedPieceCol = toCol;
    if (fromCol > 0 && board[fromRow][fromCol] === piece && 
        enPassantTarget && to[0] == enPassantTarget[0] && to[1] === enPassantTarget[1] &&
        ((isWhiteTurn && black.all.split('').includes(board[capturedPieceRow][capturedPieceCol])) ||
        (!isWhiteTurn && white.all.split('').includes(board[capturedPieceRow][capturedPieceCol])))) {
        const child: PossibleMoveType = { type: 'remove', from: [capturedPieceRow, capturedPieceCol], to: [capturedPieceRow, capturedPieceCol] };
        moves.push({ type: 'move', from: [fromRow, fromCol], to, child });
    }

    // Pawn: Promotion
    moves = moves.map(m => {
        if (m.to[0] === (isWhiteTurn ? 7 : 0) && promotionPiece) {
            m.child = { type: 'change', from: m.to, to: m.to, newPiece: isWhiteTurn ? white.turnWhite(promotionPiece) : black.turnBlack(promotionPiece) };
        }
        return m;
    });

    return moves;
}
export function rookBackwardMoves(board: BoardType, to: [number, number], isWhiteTurn: boolean) { return rookMoves(board, to, isWhiteTurn, true); }
export function rookMoves(board: BoardType, from: [number, number], isWhiteTurn: boolean, allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let piece = isWhiteTurn ? white.rook : black.rook;
    let moves: PossibleMovesType = [];

    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.') { // Rook: Move to empty square
                if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ type: 'move', from, to: [r, c] });
            } else if (allowMoveOnSelf && board[r][c] === piece) {
                moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                break;
            } else { // Rook: Capture
                if ((isWhiteTurn && Object.values(black).includes(board[r][c])) ||
                    (!isWhiteTurn && Object.values(white).includes(board[r][c]))) {
                    if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                    else moves.push({ type: 'move', from, to: [r, c] });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}
export function knightBackwardMoves(board: BoardType, to: [number, number], isWhiteTurn: boolean) { return knightMoves(board, to, isWhiteTurn, true); }
export function knightMoves(board: BoardType, from: [number, number], isWhiteTurn: boolean, allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let piece = isWhiteTurn ? white.knight : black.knight;
	let moves: PossibleMovesType = [];

    const knightMoves = [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]];	
    for (let [dr, dc] of knightMoves) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.' || (allowMoveOnSelf && board[r][c] === piece) || // Knight: Move to empty square or capture
                (isWhiteTurn && Object.values(black).includes(board[r][c])) || // Knight: Capture
                (!isWhiteTurn && Object.values(white).includes(board[r][c]))) {
                if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ type: 'move', from, to: [r, c] });
            }
        }
    }
    return moves;
}
export function bishopBackwardMoves(board: BoardType, to: [number, number], isWhiteTurn: boolean) { return bishopMoves(board, to, isWhiteTurn, true); }
export function bishopMoves(board: BoardType, from: [number, number], isWhiteTurn: boolean, allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let piece = isWhiteTurn ? white.bishop : black.bishop;
    let moves: PossibleMovesType = [];

    const directions = [[1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.') { // Bishop: Move to empty square
                if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ type: 'move', from, to: [r, c] });
            } else if (allowMoveOnSelf && board[r][c] === piece) {
                moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                break;
            } else { // Bishop: Capture
                if ((isWhiteTurn && Object.values(black).includes(board[r][c])) ||
                    (!isWhiteTurn && Object.values(white).includes(board[r][c]))) {
                    if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                    else moves.push({ type: 'move', from, to: [r, c] });
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
export function queenBackwardMoves(board: BoardType, to: [number, number], isWhiteTurn: boolean) { return queenMoves(board, to, isWhiteTurn, true); }
export function queenMoves(board: BoardType, from: [number, number], isWhiteTurn: boolean, allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let piece = isWhiteTurn ? white.queen : black.queen;
    let moves: PossibleMovesType = [];

    const directions = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of directions) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.') { // Queen: Move to empty square
                if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ type: 'move', from, to: [r, c] });
            } else if (allowMoveOnSelf && board[r][c] === piece) {
                moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                break;
            } else { // Queen: Capture
                if ((isWhiteTurn && Object.values(black).includes(board[r][c])) ||
                    (!isWhiteTurn && Object.values(white).includes(board[r][c]))) {
                    if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                    else moves.push({ type: 'move', from, to: [r, c] });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}
export function kingNormalBackwardMoves(board: BoardType, to: [number, number], isWhiteTurn: boolean) { return kingNormalMoves(board, to, isWhiteTurn, true); }
export function kingNormalMoves(board: BoardType, from: [number, number], isWhiteTurn: boolean, allowMoveOnSelf=false) {
    let [fromRow, fromCol] = from;
    let piece = isWhiteTurn ? white.king : black.king;
    let moves: PossibleMovesType = [];
    
    // King: Moves one square in any direction
    const kingMoves = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
    for (let [dr, dc] of kingMoves) {
        let r = fromRow + dr;
        let c = fromCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === '.' || (allowMoveOnSelf && board[r][c] === piece) || // King: Move to empty square or capture
                (isWhiteTurn && black.all.split('').includes(board[r][c])) || // King: Capture
                (!isWhiteTurn && white.all.split('').includes(board[r][c]))) {
                if (allowMoveOnSelf) moves.push({ type: 'move', from: [r, c], to: [fromRow, fromCol] });
                else moves.push({ type: 'move', from, to: [r, c] });
            }
        }
    }
    return moves;
}
export function kingCastlingMoves(board: BoardType, castlingRights: CastlingRightsType) {
    let moves: PossibleMovesType = [];
    // White king: Queenside castling
    if (castlingRights['Q'] && 
        board[0][0] === white.rook && board[0][1] === '.' && 
        board[0][2] === '.' && board[0][3] === '.' && board[0][4] === white.king) {
        const child: PossibleMoveType = { type: "move", from: [0, 0], to: [0, 3] };
        moves.push({ type: 'move', from: [0, 4], to: [0, 2], child });
    }
    // White king: Kingside castling
    else if (castlingRights['K'] && 
        board[0][4] === white.king && board[0][5] === '.' && 
        board[0][6] === '.' && board[0][7] === white.rook) {
        const child: PossibleMoveType = { type: "move", from: [0, 7], to: [0, 5] };
        moves.push({ type: 'move', from: [0, 4], to: [0, 6], child });
    } 
    // Black king: Queenside castling
    else if (castlingRights['q'] && 
        board[7][0] === black.rook && board[7][1] === '.' && 
        board[7][2] === '.' && board[7][3] === '.' && board[7][4] === black.king) {
        const child: PossibleMoveType = { type: "move", from: [7, 0], to: [7, 3] };
        moves.push({ type: 'move', from: [7, 4], to: [7, 2], child });
    } 
    // Black king: Kingside castling
    else if (castlingRights['k'] && 
        board[7][4] === black.king && board[7][5] === '.' && 
        board[7][6] === '.' && board[7][7] === black.rook ) {
        const child: PossibleMoveType = { type: "move", from: [7, 7], to: [7, 5] };
        moves.push({ type: 'move', from: [7, 4], to: [7, 6], child });
    }
    return moves;
}
export function kingCastlingBackwardMoves(board: BoardType, type: string, isWhiteTurn: boolean, castlingRights: CastlingRightsType): PossibleMovesType {
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
export function kingMoves(board: BoardType, from: [number, number], isWhiteTurn: boolean, castlingRights: CastlingRightsType) {
    let [fromRow, fromCol] = from;
    let moves: PossibleMovesType = [];

    moves.push(...kingNormalMoves(board, from, isWhiteTurn));
    moves.push(...kingCastlingMoves(board, castlingRights));
    return moves;
}
export function getPossibleMoves(board: BoardType, piece: string, enPassantTarget: [number, number] | null, isWhiteTurn: boolean, castlingRights: CastlingRightsType, from: [number, number] ) {
	let [fromRow, fromCol] = from;
	let moves: PossibleMovesType = [];
	
	// selected piece is white
	if (isWhiteTurn && !Object.values(white).includes(piece)) return [];
	// selected piece is black
	if (!isWhiteTurn && !Object.values(black).includes(piece)) return [];

    if (piece === white.pawn || piece === black.pawn) 
        return pawnForwardMoves(board, from, isWhiteTurn, enPassantTarget);
	else if (piece === white.rook || piece === black.rook) { // Rook moves
		return rookMoves(board, from, isWhiteTurn);
	} else if (piece === white.knight || piece === black.knight) { // Knight moves
		return knightMoves(board, from, isWhiteTurn);
	} else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
		return bishopMoves(board, from, isWhiteTurn);
	} else if (piece === white.queen || piece === black.queen) { // Queen moves
		return queenMoves(board, from, isWhiteTurn);
	} else if (piece === white.king || piece === black.king) { // King moves
		return kingMoves(board, from, isWhiteTurn, castlingRights);
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

	function updateBoard(newBoard: BoardType) {
		setBoard(newBoard);
		setHistory([...history, newBoard]);
		setHistoryIndex(historyIndex + 1);
        setIsWhiteTurn(!isWhiteTurn);
	}
    

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
            possibleMoves.push(...kingCastlingBackwardMoves(board, 'shortCastle', isWhiteTurn, castlingRights));
        }
        else if (parsedMove.type === 'longCastle') { // Handle long castling
            possibleMoves.push(...kingCastlingBackwardMoves(board, 'longCastle', isWhiteTurn, castlingRights));
        }
        else if (parsedMove.type !== 'normal' || !parsedMove.to) throw new Error(`Invalid move type: ${move}`);
        else if (parsedMove.promotionPiece && 'QBNRqbnr'.includes(parsedMove.promotionPiece)) {
            // not implemented calling possible moves
            // throw new Error(`Pawn promotion not implemented yet: ${move}`);
            possibleMoves.push(...pawnBackwardMoves(board, to, isWhiteTurn, enPassantTarget, promotionPiece));
        } else {
            // Handle normal moves
            if (parsedMove.piece === white.pawn || parsedMove.piece === black.pawn) {
                if (DEBUG) console.log("pawn moves")
                possibleMoves.push(...pawnBackwardMoves(board, to, isWhiteTurn, enPassantTarget, promotionPiece));
            }
            else {
                if (piece === white.rook || piece === black.rook) { // Rook moves
                    possibleMoves.push(...rookBackwardMoves(board, to, isWhiteTurn));
                } else if (piece === white.knight || piece === black.knight) { // Knight moves
                    possibleMoves.push(...knightBackwardMoves(board, to, isWhiteTurn));
                } else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
                    possibleMoves.push(...bishopBackwardMoves(board, to, isWhiteTurn));
                } else if (piece === white.queen || piece === black.queen) { // Queen moves
                    possibleMoves.push(...queenBackwardMoves(board, to, isWhiteTurn));
                } else if (piece === white.king || piece === black.king) { // King moves
                    possibleMoves.push(...kingNormalBackwardMoves(board, to, isWhiteTurn));
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
        handleMove(possibleMoves[0],board, piece, from, to, isWhiteTurn, isCapture);
        console.log('\n\n')
	}

    function handleMove(possibleMove: PossibleMoveType, board: string[][], piece: string, from: [number, number], to: [number, number], isWhiteTurn: boolean, isCapture: boolean) {
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
            setEnPassantTarget([to[0] - (isWhiteTurn ? 1 : -1), to[1]]);
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
        handleMove, updateBoard, move, useAutoMove,
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
    // console.log("getFenNotation enPassantTarget", enPassantTarget, colChar(enPassantTarget[1]) + (enPassantTarget ? (enPassantTarget[0] + 1) : ''));

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