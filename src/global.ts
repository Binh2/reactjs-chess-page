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

export const white = {
	king: 'k',
	queen: 'q',
	rook: 'r',
	bishop: 'b',
	knight: 'n',
	pawn: 'p'
};
export const black = {
	king: 'K',
	queen: 'Q',
	rook: 'R',
	bishop: 'B',
	knight: 'N',
	pawn: 'P'
};

export const displayPiece: Record<string, string> = {
	k: '\u2654',
	q: '\u2655',
	r: '\u2656',
	b: '\u2657',
	n: '\u2658',
	p: '\u2659',
	K: '\u265A',
	Q: '\u265B',
	R: '\u265C',
	B: '\u265D',
	N: '\u265E',
	P: '\u265F',
	'.': '.'
}