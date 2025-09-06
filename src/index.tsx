'uses strict';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import { displayPiece, white, black} from './global'
import { movePiece, removePiece, getPossibleMoves, BoardType, PossibleMovesType, useBoard, getFenNotation, parseFenNotation } from './board';

function Square({ id='', key=0, className='', style={}, piece, row, col, onClick=() => {} }: 
	{ id?: string, key?: number, className?: string, style?: React.CSSProperties, piece: string, row: number, col: number, onClick?: (row: number, col: number) => void }) {
	return (<div id={id} key={key} className={`square ${className}`} style={style} onMouseDown={() => onClick(row, col)}>
		<pre>
			{piece !== '.' ? displayPiece[piece] : " "}
		</pre>
	</div>);
}

const initialPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
// const initialPosition = '4rrk1/1b3pb1/pp4pp/4q3/P2ppQP1/1B1P3P/1PP4K/R4RB1 b - - 0 26';
const moves = [
	// "e4", 
	// "c5", 
	// "Nf3", 
	// "Nc6", "Bc4", "g6", "Ng5", "e6", 
	// "O-O", 
	// "Bg7", "d3", "a6", "a4", "Nf6", "Nf3", "h6", "Be3", "b6", "Qc1", "Ng4", "Bd2", "Qc7", "h3", "Nf6", "Nc3", "Nd4", "Nxd4", 
	// "cxd4", "Ne2", "e5", "f4", "Bb7", "fxe5", "Qxe5", "Bf4", "Qc5", "Kh1", "Nh5", "Bh2", "O-O", 
	// "Bb3", 
	// "Rae8", 
	// "Bg1", "d5", "g4", "dxe4", "Kh2", "Qe5+", "Nf4", "Nxf4", "Qxf4", 
	// "exd3", 
	// "Bxd4", "Qxf4+", "Rxf4", "Re2+", "Kg1", "Bxd4+", "Rxd4", "dxc2", "Rc1", "Rfe8", "Bxc2", "Rg2+", "Kf1", "Ree2", "Bd3", "Rd2", "Rd7", "Rh2", "Ke1", "Rxb2", "Rxb7", "Rh1+", "Bf1", "b5", "Rb6", "b4", "Rxa6", "b3", "Rb6", "Ra2", "Rxb3", "Rxa4", "Kf2", "Rh2+", "Kg3", "Rd2", "Rf3", "Ra7", "Bc4", "Rd4", "Bb3", "Rb4", "Rcf1", "Rbb7", "Rf6", "Kg7", "Bd5", "Rc7", "Kh4", "Re7", "R6f4", "g5+", "Kh5", "gxf4", "Rxf4", "Ra5", "Rf5", "f6", "Bc4", "Rxf5+", "gxf5", "Re5", "Be6", "Re3", 
	// "Kg4", 
	// "Re1", "Bd7", "Rg1+", "Kf4", "h5", "Be8", "h4", "Bh5", "Kh6", "Bg4", "Rg3", "Ke4", "Kg5", "Kd5", "Rxg4", "hxg4", "Kxg4", "Ke6", "h3", "Kxf6", "h2", "Kg6", 
	// "h1=Q", "f6", 
	// "Qe4+", 
	// "Kg7", "Qb7+", "f7", "Kf5", "Kg8", "Qg2+", "Kf8", "Kg6", "Ke8", "Qe4+", "Kf8", "Qa8+", "Ke7", "Qb7+", "Kf8", "Qc8+", "Ke7", "Qc5+", "Ke8", "Qc6+", "Kf8", "Kh7", "Ke7", "Qc7+", "Ke8", "Qc8+", "Ke7", "Qb7+",

	// "e4", "d6", "e5", "f5", 
	// "exf6", "Kd7", "fxg7", "Nf6", 
	// "h4", 'e5'
	// "gxh8=N"

	// "e4", "e5", "Bc4", "Bc5", "Nf3", "Nf6", 
	// "O-O", 
	// "O-O"
] as string[];
type SelectedPieceType = [number, number] | null;
function usePromotion() {
	const [ promotionSquare, setPromotionSquare ] = useState<[number, number] | null>(null);
	return { promotionSquare, setPromotionSquare };
}
function Board() {
	const [ selected, setSelected ] = useState<SelectedPieceType>(null);
	const [ possibleMoves, setPossibleMoves ] = useState<PossibleMovesType>([]);
	const { promotionSquare, setPromotionSquare } = usePromotion();
	const [ moveInput, setMoveInput ] = useState('');
	const inputRef = React.useRef<HTMLInputElement>(null);
	const { board: initialBoard, isWhiteTurn: initialIsWhiteTurn, castlingRights: initialCastlingRights } = parseFenNotation(initialPosition);
	const { board, enPassantTarget, isWhiteTurn, castlingRights, historyIndex, halfMovesNum, fullMovesNum, move, useAutoMove, useKeyDownEvent, handleMove, getPossibleMoves, moveHistoryBackward, moveHistoryForward } = useBoard({ initialBoard, initialIsWhiteTurn, initialCastlingRights });

	useAutoMove(moves, 10);
	console.log(getFenNotation(board, isWhiteTurn, castlingRights, enPassantTarget, halfMovesNum, fullMovesNum))
	function handleKeyDown(event: React.KeyboardEvent) {
		if ('abcdefgh12345678'.includes(event.key)) {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		} 
	}
	useKeyDownEvent();

	useEffect(() => {
		document.addEventListener('keydown', e => handleKeyDown(e as any));
		return () => document.removeEventListener('keydown', e => handleKeyDown(e as any));
	}, [handleKeyDown, isWhiteTurn, board, historyIndex]);

	function handleSelect(row: number, col: number) {
		// click on empty square without having selected a piece -> do nothing
		if (!selected && board[row][col] === '.') { 
			return;
		}

		// First click on a piece -> select that piece
		if (!selected) {
			setSelected([row, col]);
			console.log('possible moves', getPossibleMoves([row, col]));
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
		if (!possibleMoves.some(p => p.to[0] === row && p.to[1] === col)) { 
			console.log('non-possible move')
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
		console.log('after non-possible move')

		// Pawn: Promotion
		if (board[selected[0]][selected[1]] === white.pawn && row === 7) {
			setPromotionSquare([row, col]);
			return;
		} else if (board[selected[0]][selected[1]] === black.pawn && row === 0) {
			setPromotionSquare([row, col]);
			return;
		} 
		// Click on possible square to move piece
		else {
			console.log('handle move')
			const filteredPossibleMoves = possibleMoves.filter(p => {
				return p.from[0] === selected[0] && p.from[1] === selected[1] &&
					p.to[0] === row && p.to[1] === col;
			});
			if (!filteredPossibleMoves || 
				(filteredPossibleMoves && filteredPossibleMoves.length === 0) || 
				(filteredPossibleMoves && filteredPossibleMoves.length > 1)) {
				console.error("Possible move not found", possibleMoves, selected, [row, col]);
				setSelected(null);
				setPossibleMoves([]);
				return;
			}
			handleMove(
				filteredPossibleMoves[0],
				board, isWhiteTurn, board[row][col] !== '.' ? true : false);
		}
		
		setSelected(null);
		setPossibleMoves([]);
		// handleMove(board, selected, [row, col])
	}

	function handlePromotion(newPiece: string) {
		if (!promotionSquare) return;
		if (!selected) return; // for testing

		// let newBoard = movePiece(board, selected, promotionSquare);
		// newBoard[promotionSquare[0]][promotionSquare[1]] = newPiece;
		// updateBoard(newBoard);
		const filteredPossibleMoves = possibleMoves.filter(p => {
			return p.from[0] === selected[0] && p.from[1] === selected[1] &&
				p.to[0] === promotionSquare[0] && p.to[1] === promotionSquare[1];
		});
		if (!filteredPossibleMoves || 
			(filteredPossibleMoves && filteredPossibleMoves.length === 0) || 
			(filteredPossibleMoves && filteredPossibleMoves.length > 1)) {
			console.error("Possible move not found", possibleMoves, selected, promotionSquare);
			setSelected(null);
			setPossibleMoves([]);
			setPromotionSquare(null);
			return;
		}
		handleMove(
			{ ...filteredPossibleMoves[0], child: { ...filteredPossibleMoves[0], newPiece 	} },
			board, isWhiteTurn, board[promotionSquare[0]][promotionSquare[1]] !== '.' ? true : false);
		setSelected(null);
		setPromotionSquare(null);
		setPossibleMoves([]);
	}

	return <div>
		<LabeledBoard>
			<div className="board">
				<> { board.slice(0).reverse().map((r, i) =>
					<> { r.map((piece, j) =>
						<Square key={i*8 + j} id={`square-${7-i}-${j}`}
						className={
							((i + j) % 2 === 0 ? "--light " : "--dark ") +
							(selected && 7-i === selected[0] && j === selected[1] ? "--selected ": "") +
							(possibleMoves.some(p => p.to[0] === 7-i && p.to[1] === j) ? "--possible ": "")
						} 
						piece={piece} row={7-i} col={j} onClick={handleSelect} />
					) } </>
				) } </>
			</div>
		</LabeledBoard>
		{ promotionSquare && <PromotionMenu isWhiteTurn={isWhiteTurn} at={promotionSquare} onMouseDown={handlePromotion} /> }
		<div>
			<span>Move: </span>
			<input type="test" value={moveInput} onChange={e => { 
				setMoveInput(e.target.value);

			} } onKeyDown={e => {
				if (e.key == 'Enter') {
					console.log('Enter')
					move(moveInput);
					setMoveInput('');
				}
			}} autoFocus ref={inputRef} />
			<button onClick={() => {
				moveHistoryBackward();
			}}>Backward</button>
			<button onClick={() => {
				moveHistoryForward();
			}}>Forward</button>
		</div>
	</div>;
}

function LabeledBoard({children: boardChildren}: {children: React.ReactNode}) {
	return (
		<div className="labeled-board">
			<div className="labeled-board-rank">
				{'87654321'.split('').map((n, i) =>
					<div key={i} className="labeled-board-rank__label">{n}</div>
				)}
			</div>
			{ boardChildren }
			<div className='labeled-board-file'>
				{'abcdefgh'.split('').reverse().map((n, i) => // Because in the CSS file, the file labels are reversed
					<div key={i} className="labeled-board-file__label">{n}</div>
				)}
			</div>
		</div>
	);
}
function PromotionMenu({ isWhiteTurn, at, onMouseDown }: { isWhiteTurn: boolean, at: [number, number], onMouseDown: (newPiece: string) => void }) {
	const direction = isWhiteTurn ? -1 : 1;
	console.log(at)
	return <div className="promotion-menu">
		<Square style={{gridRow: at[0]+1, gridColumn: at[1]+1}} 
			piece={white.queen} row={at[0]} col={at[1]}
			onClick={() => onMouseDown(isWhiteTurn ? white.queen : black.queen)} />
		<Square style={{gridRow: at[0]+1-direction, gridColumn: at[1]+1}} 
			piece={white.rook} row={at[0]} col={at[1]} 
			onClick={() => onMouseDown(isWhiteTurn ? white.rook : black.rook)} />
		<Square style={{gridRow: at[0]+1-direction*2, gridColumn: at[1]+1}} 
			piece={white.bishop} row={at[0]} col={at[1]} 
			onClick={() => onMouseDown(isWhiteTurn ? white.bishop : black.bishop)}  />
		<Square style={{gridRow: at[0]+1-direction*3, gridColumn: at[1]+1}} 
			piece={white.knight} row={at[0]} col={at[1]} 
			onClick={() => onMouseDown(isWhiteTurn ? white.knight : black.knight)}  />
	</div>;
}

export default function Game() {
	return <Board />;
}

if (import.meta.env.NODE_ENV !== 'test') {
	let container = null as HTMLElement | null;

	document.addEventListener('DOMContentLoaded', () => {
		if (!container) {
			container = document.getElementById('root');
			if (!container) throw new Error("Failed to find the root element");
			const root = createRoot(container);
			root.render(<Game />);
		}
	});
}
