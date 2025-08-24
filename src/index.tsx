'uses strict';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const white = {
	king: "\u2654",
	queen: "\u2655",
	rook: "\u2656",
	bishop: "\u2657",
	knight: "\u2658",
	pawn: "\u2659"
};
const black = {
	king: "\u265A",
	queen: "\u265B",
	rook: "\u265C",
	bishop: "\u265D",
	knight: "\u265E",
	pawn: "\u265F"
};
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

type BoardType = string[][]
type PossibleMovesType = ([number, number] | [number, number, boolean])[];
type HasMovedType = { wK: boolean, wR1: boolean, wR2: boolean, bK: boolean, bR1: boolean, bR2: boolean };

function Square({ className='', style={}, piece, row, col, onClick=() => {} }: 
	{ className?: string, style?: React.CSSProperties, piece: string, row: number, col: number, onClick?: (row: number, col: number) => void }) {
	return (<div className={`square ${className}`} style={style} onMouseDown={() => onClick(row, col)}>
		<pre>
			{piece !== '.' ? piece : " "}
		</pre>
	</div>);
}
function movePiece(board: BoardType, from: [number, number], to: [number, number]) {
	let [fromRow, fromCol] = from;
	let [toRow, toCol] = to;

	let newBoard = board.map(r => r.slice())
	newBoard[toRow][toCol] = board[fromRow][fromCol];
	newBoard[fromRow][fromCol] = '.';
	return newBoard;
}
function removePiece(board: BoardType, at: [number, number]) { // for en passant
	console.log("removePiece", at)
	let [row, col] = at;
	let newBoard = board.map(r => r.slice())
	newBoard[row][col] = '.';
	return newBoard;
}
type PrevMoveType = {piece: string, from: [number, number], to: [number, number]} | null;
function getPossibleMoves(board: BoardType, prevMove: PrevMoveType, isWhiteTurn: boolean, hasMoved: HasMovedType, from: [number, number] ) {
	let [fromRow, fromCol] = from;
	const piece = board[fromRow][fromCol];
	let moves: PossibleMovesType = [];
	
	// selected piece is white
	if (isWhiteTurn && !Object.values(white).includes(piece)) return [];
	// selected piece is black
	if (!isWhiteTurn && !Object.values(black).includes(piece)) return [];

	if (piece === white.pawn || piece === black.pawn) { // Pawn moves
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

		console.log(prevMove)
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
	} else if (piece === white.rook || piece === black.rook) { // Rook moves
		const directions = [[1,0], [-1,0], [0,1], [0,-1]];
		for (let [dr, dc] of directions) {
			let r = fromRow + dr;
			let c = fromCol + dc;
			while (r >= 0 && r < 8 && c >= 0 && c < 8) {
				if (board[r][c] === '.') { // Rook: Move to empty square
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
	} else if (piece === white.knight || piece === black.knight) { // Knight moves
		const knightMoves = [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]];	
		for (let [dr, dc] of knightMoves) {
			let r = fromRow + dr;
			let c = fromCol + dc;
			if (r >= 0 && r < 8 && c >= 0 && c < 8) {
				if (board[r][c] === '.' || // Knight: Move to empty square or capture
					(Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) || // Knight: Capture
					(Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
					moves.push([r, c]);
				}
			}
		}
		return moves;
	} else if (piece === white.bishop || piece === black.bishop) { // Bishop moves
		const directions = [[1,1], [1,-1], [-1,1], [-1,-1]];
		for (let [dr, dc] of directions) {
			let r = fromRow + dr;
			let c = fromCol + dc;
			while (r >= 0 && r < 8 && c >= 0 && c < 8) {
				if (board[r][c] === '.') { // Bishop: Move to empty square
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
		return moves;
	} else if (piece === white.queen || piece === black.queen) { // Queen moves
		const directions = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
		for (let [dr, dc] of directions) {
			let r = fromRow + dr;
			let c = fromCol + dc;
			while (r >= 0 && r < 8 && c >= 0 && c < 8) {
				if (board[r][c] === '.') { // Queen: Move to empty square
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
	} else if (piece === white.king || piece === black.king) { // King moves
		// King: Moves one square in any direction
		const kingMoves = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
		for (let [dr, dc] of kingMoves) {
			let r = fromRow + dr;
			let c = fromCol + dc;
			if (r >= 0 && r < 8 && c >= 0 && c < 8) {
				if (board[r][c] === '.' || // King: Move to empty square or capture
					(Object.values(white).includes(piece) && Object.values(black).includes(board[r][c])) || // King: Capture
					(Object.values(black).includes(piece) && Object.values(white).includes(board[r][c]))) {
					moves.push([r, c]);
				}
			}
		}

		// King: Castling
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
	return []; 
}


// type HistoryType = { fromPiece: string, toPiece: string, from: [number, number], to: [number, number] }[];
type HistoryType = string[][][];
function useBoard() {
	const [ board, setBoard ] = useState<BoardType>(initialBoard);
	const [ history, setHistory ] = useState<HistoryType>([initialBoard]);
	const [ historyIndex, setHistoryIndex ] = useState<number>(0);
	const [ prevMove, setPrevMove ] = useState<PrevMoveType>(null);
	const [ hasMoved, setHasMoved ] = useState<HasMovedType>({ wK: false, wR1: false, wR2: false, bK: false, bR1: false, bR2: false });

	function isWhiteTurn() {
		return historyIndex % 2 === 0;
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
			getPossibleMoves(board, prevMove, isWhiteTurn(), hasMoved, from).some(p => p[0] === to[0] && p[1] === to[1] && p[2] === true)) {
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
			getPossibleMoves(board, prevMove, isWhiteTurn(), hasMoved, from).some(p => p[0] === to[0] && p[1] === to[1] && p[2] === true)) {
			let direction = board[from[0]][from[1]] === white.pawn ? -1 : 1;
			setBoard(removePiece(movePiece(board, from, to), [to[0] - direction, to[1]]));
		}

		// normal move or capture
		else setBoard(movePiece(board, from, to));

		setPrevMove({ piece: board[from[0]][from[1]], from, to });
		setHistory([...history, newBoard]);
		setHistoryIndex(historyIndex + 1);
	}

	return { 
		board, history, historyIndex, prevMove, isWhiteTurn: isWhiteTurn(), hasMoved, handleMove,
		getPossibleMoves: (from: [number, number]) => getPossibleMoves(board, prevMove, isWhiteTurn(), hasMoved, from)
	};
}

// type HistoryType = { piece: string, from: [number, number], to: [number, number] }[];
type SelectedPieceType = [number, number] | null;
function Board() {
	const [ selected, setSelected ] = useState<SelectedPieceType>(null);
	const [ possibleMoves, setPossibleMoves ] = useState<PossibleMovesType>([]);
	const [ promotionSquare, setPromotionSquare ] = useState<{piece: string, at: [number, number]} | null>(null);
	const { board, prevMove, isWhiteTurn, hasMoved, handleMove, getPossibleMoves } = useBoard();

	function handleSelect(row: number, col: number) {
		// click on empty square without having selected a piece -> do nothing
		if (!selected && board[row][col] === '.') { 
			return;
		}

		// First click on a piece -> select that piece
		if (!selected) {
			setSelected([row, col]);
			setPossibleMoves(getPossibleMoves([row, col]));
			return;
		}

		// Click on the selected piece again -> to cancel promotion
		if (promotionSquare && selected[0] === row && selected[1] === col) {
			setPromotionSquare(null);
			return;
		}

		// Click on the selected piece again -> deselect piece
		if (selected[0] === row && selected[1] === col) { 
			setSelected(null);
			setPossibleMoves([]);
			return;
		}

		// click on another piece of the same color -> select that piece instead
		if (board[row][col] !== '.' && (
			(Object.values(white).includes(board[selected[0]][selected[1]]) && Object.values(white).includes(board[row][col])) ||
			(Object.values(black).includes(board[selected[0]][selected[1]]) && Object.values(black).includes(board[row][col]))
		)) {
			setSelected([row, col]);
			setPossibleMoves(getPossibleMoves([row, col]));
			return;
		}

		// click on non-possible move square (disable this if you want to allow non-possible moves) -> deselect piece
		if (!possibleMoves.some(p => p[0] === row && p[1] === col)) { 
			// Select non-possible opponent piece -> select that piece instead
			if (board[row][col] !== '.' && (
				(Object.values(white).includes(board[selected[0]][selected[1]]) && Object.values(black).includes(board[row][col])) ||
				(Object.values(black).includes(board[selected[0]][selected[1]]) && Object.values(white).includes(board[row][col]))
			)) {
				setSelected([row, col]);
				setPossibleMoves(getPossibleMoves([row, col]));
				return;
			}
			setSelected(null);
			setPossibleMoves([]);
			setPromotionSquare(null);
			return;
		}

		handleMove(selected, [row, col]);


		// Pawn: Promotion
		if (board[selected[0]][selected[1]] === white.pawn && row === 0) {
			// let newBoard = movePiece(board, selected, [row, col]);
			// newBoard[row][col] = white.queen; // auto-promote to queen
			// setBoard(newBoard);
			setPromotionSquare({piece: white.pawn, at: [row, col]});
			return;
		} else if (board[selected[0]][selected[1]] === black.pawn && row === 7) {
			// let newBoard = movePiece(board, selected, [row, col]);
			// newBoard[row][col] = black.queen; // auto-promote to queen
			// setBoard(newBoard);
			setPromotionSquare({piece: black.pawn, at: [row, col]});
			return;
		}
		
		setSelected(null);
		setPossibleMoves([]);
	}

	function handlePromotion(newPiece: string) {
		if (!promotionSquare) return;
		if (!selected) return; // for testing

		let newBoard = movePiece(board, selected, promotionSquare.at);
		newBoard[promotionSquare.at[0]][promotionSquare.at[1]] = newPiece;
		// setBoard(newBoard);
		// setIsWhiteTurn(!isWhiteTurn);
		// setHistory([...history, { piece: promotionSquare.piece, from: [promotionSquare.at[0] + (newPiece === white.pawn ? 1 : -1), promotionSquare.at[1]], to: promotionSquare.at }]);
		setSelected(null);
		setPromotionSquare(null);
		setPossibleMoves([]);
	}

	return <div>
		<div className="board">
			<> { board.map((r, i) =>
				<> { r.map((piece, j) =>
					<Square key={j} 
					className={
						((i + j) % 2 === 0 ? "--light " : "--dark ") +
						(selected && i === selected[0] && j === selected[1] ? "--selected ": "") +
						(possibleMoves.some(p => p[0] === i && p[1] === j) ? "--possible ": "")
					} 
					piece={piece} row={i} col={j} onClick={handleSelect} />
				) } </>
			) } </>
		</div>
		{ promotionSquare && <PromotionMenu piece={promotionSquare.piece} at={promotionSquare.at} onMouseDown={handlePromotion} /> }
	</div>;
}
function PromotionMenu({ piece, at, onMouseDown }: { piece: string, at: [number, number], onMouseDown: (newPiece: string) => void }) {
	const direction = piece === white.pawn ? -1 : 1;
	console.log(at)
	return <div className="promotion-menu">
		<Square style={{gridRow: at[0]+1, gridColumn: at[1]+1}} 
			piece={white.queen} row={at[0]} col={at[1]}
			onClick={() => onMouseDown(piece === white.pawn ? white.queen : black.queen)} />
		<Square style={{gridRow: at[0]+1-direction, gridColumn: at[1]+1}} 
			piece={white.rook} row={at[0]} col={at[1]} 
			onClick={() => onMouseDown(piece === white.pawn ? white.rook : black.rook)} />
		<Square style={{gridRow: at[0]+1-direction*2, gridColumn: at[1]+1}} 
			piece={white.bishop} row={at[0]} col={at[1]} 
			onClick={() => onMouseDown(piece === white.pawn ? white.bishop : black.bishop)}  />
		<Square style={{gridRow: at[0]+1-direction*3, gridColumn: at[1]+1}} 
			piece={white.knight} row={at[0]} col={at[1]} 
			onClick={() => onMouseDown(piece === white.pawn ? white.knight : black.knight)}  />
	</div>;
}

function Game() {
	return <Board />;
}

// ========================================
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
