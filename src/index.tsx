'uses strict';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import { displayPiece, white, black} from './global'
// import { BoardClass } from './BoardClass';
import { movePiece, removePiece, getPossibleMoves, BoardType, PossibleMovesType, useBoard } from './board';

// interface BoardType extends Array<Array<string>> {;
// 	[index: Array<number>]: string;
// 	[index: string]: string;
// 	// [index: number]: string;
// }
// type BoardType = BoardClass



function Square({ id='', key=0, className='', style={}, piece, row, col, onClick=() => {} }: 
	{ id?: string, key?: number, className?: string, style?: React.CSSProperties, piece: string, row: number, col: number, onClick?: (row: number, col: number) => void }) {
	return (<div id={id} key={key} className={`square ${className}`} style={style} onMouseDown={() => onClick(row, col)}>
		<pre>
			{piece !== '.' ? displayPiece[piece] : " "}
		</pre>
	</div>);
}

type SelectedPieceType = [number, number] | null;
function Board() {
	const [ selected, setSelected ] = useState<SelectedPieceType>(null);
	const [ possibleMoves, setPossibleMoves ] = useState<PossibleMovesType>([]);
	const [ promotionSquare, setPromotionSquare ] = useState<{piece: string, at: [number, number]} | null>(null);
	const [ moveInput, setMoveInput ] = useState('');
	const inputRef = React.useRef<HTMLInputElement>(null);
	const { board, prevMove, isWhiteTurn, hasMoved, move, handleMove, getPossibleMoves, updateBoard } = useBoard();

	function handleKeyDown(event: React.KeyboardEvent) {
		if (inputRef.current) {
			if ('abcdefgh12345678'.includes(event.key)) {
				inputRef.current.focus();
			}
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', e => handleKeyDown(e as any));
		return () => document.removeEventListener('keydown', e => handleKeyDown(e as any));
	}, [handleKeyDown]);

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

		// Pawn: Promotion
		if (board[selected[0]][selected[1]] === white.pawn && row === 7) {
			setPromotionSquare({piece: white.pawn, at: [row, col]});
			return;
		} else if (board[selected[0]][selected[1]] === black.pawn && row === 0) {
			setPromotionSquare({piece: black.pawn, at: [row, col]});
			return;
		} else handleMove(selected, [row, col]);
		
		setSelected(null);
		setPossibleMoves([]);
	}

	function handlePromotion(newPiece: string) {
		if (!promotionSquare) return;
		if (!selected) return; // for testing

		let newBoard = movePiece(board, selected, promotionSquare.at);
		newBoard[promotionSquare.at[0]][promotionSquare.at[1]] = newPiece;
		updateBoard(newBoard);
		setSelected(null);
		setPromotionSquare(null);
		setPossibleMoves([]);
	}

	return <div>
		<div className="board">
			<> { board.slice(0).reverse().map((r, i) =>
				<> { r.map((piece, j) =>
					<Square key={i*8 + j} id={`square-${7-i}-${j}`}
					className={
						((i + j) % 2 === 0 ? "--light " : "--dark ") +
						(selected && 7-i === selected[0] && j === selected[1] ? "--selected ": "") +
						(possibleMoves.some(p => p[0] === 7-i && p[1] === j) ? "--possible ": "")
					} 
					piece={piece} row={7-i} col={j} onClick={handleSelect} />
				) } </>
			) } </>
		</div>
		{ promotionSquare && <PromotionMenu piece={promotionSquare.piece} at={promotionSquare.at} onMouseDown={handlePromotion} /> }
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
		</div>
	</div>;
}

function LabeledBoard() {
	return (
		<div className="labeled-board">
			<div className="labeled-board-rank">
				{'87654321'.split('').map((n, i) =>
					<div key={i} className="labeled-board-rank__label">{n}</div>
				)}
			</div>
			<Board></Board>
			<div className='labeled-board-file'>
				{'abcdefgh'.split('').map((n, i) =>
					<div key={i} className="labeled-board-file__label">{n}</div>
				)}
			</div>
		</div>
	);
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

export default function Game() {
	return <LabeledBoard />;
}

if (import.meta.env.NODE_ENV !== 'test') {
	const container = document.getElementById('root');
	if (!container) throw new Error("Failed to find the root element");
	const root = createRoot(container);
	root.render(<Game />);
}
