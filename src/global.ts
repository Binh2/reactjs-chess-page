// export const white = {
// 	king: "\u2654",
// 	queen: "\u2655",
// 	rook: "\u2656",
// 	bishop: "\u2657",
// 	knight: "\u2658",
// 	pawn: "\u2659"
// };
// export const black = {
// 	king: "\u265A",
// 	queen: "\u265B",
// 	rook: "\u265C",
// 	bishop: "\u265D",
// 	knight: "\u265E",
// 	pawn: "\u265F"
// };

export const DEBUG = true;

export const white = {
	king: 'K',
	queen: 'Q',
	rook: 'R',
	bishop: 'B',
	knight: 'N',
	pawn: 'P',
	all: 'KQRBNP',
	turnWhite: (piece: string) => piece.toUpperCase(),
	isWhite: (piece: string) => piece === piece.toUpperCase() && piece !== '.'
};
export const black = {
	king: 'k',
	queen: 'q',
	rook: 'r',
	bishop: 'b',
	knight: 'n',
	pawn: 'p',
	all: 'kqrbnp',
	turnBlack: (piece: string) => piece.toLowerCase(),
	isBlack: (piece: string) => piece === piece.toLowerCase() && piece !== '.'
};

export const displayPiece: Record<string, string> = {
	K: '\u2654',
	Q: '\u2655',
	R: '\u2656',
	B: '\u2657',
	N: '\u2658',
	P: '\u2659',
	k: '\u265A',
	q: '\u265B',
	r: '\u265C',
	b: '\u265D',
	n: '\u265E',
	p: '\u265F',
	'.': '.'
}