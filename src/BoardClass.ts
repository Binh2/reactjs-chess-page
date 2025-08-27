const initialBoard = [
    // [black.rook, black.knight, black.bishop, black.queen, black.king, black.bishop, black.knight, black.rook],
    // [black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn, black.pawn],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    // [white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn, white.pawn],
    // [white.rook, white.knight, white.bishop, white.queen, white.king, white.bishop, white.knight, white.rook],
]
// export const boardClassHandler = {
//     get(target: any, prop: PropertyKey, receiver: any) {
//         if (typeof prop === 'string' && prop.length === 2) {
//             return target[7-(prop.charCodeAt(0)-97)][parseInt(prop[1])];
//         } else if (prop.constructor === Array && (prop as Array<number>).length === 2) {
//             return target[prop[0]][prop[1]];
//         }
        
//         return Reflect.get(target, prop, receiver);
//     }
// }

// export class BoardClass {
//     board: string[][];
//     constructor(board: string[][]) {
//         this.board = board;
//     }
//     get(prop: string | [number, number]) {
//         // get('e4') => string
//         if (typeof prop === 'string' && prop.length === 2) {
//             return this.board[7-(prop.charCodeAt(0)-97)][parseInt(prop[1])];
//         } 
//         // get([row: number 0->8, col: number 0->8]) => string
//         else if (prop.constructor === Array && (prop as Array<number>).length === 2) {
//             return this.board[prop[0]][prop[1]];
//         }

//         throw new Error('Invalid prop for get() in BoardClass');
//     }
//     set(prop: string | [number, number], value: string) {
//         // set('e4', 'wP')
//         if (typeof prop === 'string' && prop.length === 2) {
//             this.board[7-(prop.charCodeAt(0)-97)][parseInt(prop[1])] = value;
//             return true;
//         } 
//         // set([row: number 0->8, col: number 0->8], 'wP')
//         else if (prop.constructor === Array && (prop as Array<number>).length === 2) {
//             this.board[prop[0]][prop[1]] = value;
//             return true;
//         }
//         return false;
//     }
//     copy() {
//         return new BoardClass(this.board.map(r => r.slice()));
//     }
//     map(callback: (r: string[], i: number) => string[]) {
//         return this.board.map(callback);
//     }
// }