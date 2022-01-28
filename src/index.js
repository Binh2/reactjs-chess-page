'uses strict';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Draggable() {
	
	return <div></div>;
}

function Square(props) {
	return <div className="square">
		<pre>
			{props.piece || " "}
		</pre>
	</div>;
}

function Board() {
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
	return <div className="board">
		<div><Square piece={black.rook}/><Square piece={black.knight}/><Square piece={black.bishop}/><Square piece={black.queen} /><Square piece={black.king}/><Square piece={black.bishop}/><Square piece={black.knight}/><Square piece={black.rook}/></div>
		<div><Square piece={black.pawn}/><Square piece={black.pawn}/><Square piece={black.pawn}/><Square piece={black.pawn}/><Square piece={black.pawn}/><Square piece={black.pawn}/><Square piece={black.pawn}/><Square piece={black.pawn}/></div>
		<div><Square /><Square /><Square /><Square /><Square /><Square /><Square /><Square /></div>
		<div><Square /><Square /><Square /><Square /><Square /><Square /><Square /><Square /></div>
		<div><Square /><Square /><Square /><Square /><Square /><Square /><Square /><Square /></div>
		<div><Square /><Square /><Square /><Square /><Square /><Square /><Square /><Square /></div>
		<div><Square piece={white.pawn}/><Square piece={white.pawn}/><Square piece={white.pawn}/><Square piece={white.pawn}/><Square piece={white.pawn}/><Square piece={white.pawn}/><Square piece={white.pawn}/><Square piece={white.pawn}/></div>
		<div><Square piece={white.rook}/><Square piece={white.knight}/><Square piece={white.bishop}/><Square piece={white.queen} /><Square piece={white.king}/><Square piece={white.bishop}/><Square piece={white.knight}/><Square piece={white.rook}/></div>
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
