import React from 'react';
import { describe, it, expect, test } from 'vitest';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import Game from '../index'; 
import { useBoard, getFenNotation } from '../board';
import { white, black } from '../global'
import fen from './normal-game-fen.json' with { type: 'json' };

describe('useBoard()', () => {
    // it('has white and black piece', () => {
    //     const { result: { current: { board } } } = renderHook(() => useBoard({}));
    //     expect(board[7][4]).toBe(white.king);
    //     expect(board[0][4]).toBe(black.king);
    // });
    // it('all pawn moves: initial position, 2 square, en passant', () => {
    //     const { result: { current: { board } } } = renderHook(() => useBoard({}));

    //     // const { result: { current: { board } } } = renderHook(() => useBoard());
    // });
    // it('all pawn moves: 2 square, en passant, promotion', () => {
    //     const { result: { current: { board, move } } } = renderHook(() => useBoard({}));
    //     act(() => move('e4')); // white pawn e2 to e4
    //     expect(board[4][4]).toBe(white.pawn);
    //     act(() => move('d5')); // black pawn d7 to d5
    //     expect(board[3][3]).toBe(black.pawn);
    //     act(() => move('e5')); // white pawn e4 to e5
    //     expect(board[3][4]).toBe(white.pawn);
    //     act(() => move('d4')); // black pawn d5 to d4
    //     expect(board[4][3]).toBe(black.pawn);
    //     act(() => move('e6')); // white pawn e5 to e6
    //     expect(board[2][4]).toBe(white.pawn);
    //     act(() => move('dxe3')); // black pawn d4 takes white pawn e3
    // });
    it('A normal game', () => {
        const { result } = renderHook(() => useBoard({}));
        for (const [i, { fen: f, move }] of fen.entries()) {
            console.log(move, f);
            act(() => result.current.move(move));
            console.log(getFenNotation(result.current.board, result.current.isWhiteTurn, result.current.castlingRights, result.current.enPassantTarget, result.current.halfMovesNum, result.current.fullMovesNum), f);
            expect(getFenNotation(result.current.board, result.current.isWhiteTurn, result.current.castlingRights, result.current.enPassantTarget, result.current.halfMovesNum, result.current.fullMovesNum)).toBe(f);
        }
    });
    // test('Board handleSelect', async () => {
    //     render(<Game />);

    // })
});

// export {};