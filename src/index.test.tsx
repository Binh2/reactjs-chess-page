import React from 'react';
import { describe, it, expect, test } from 'vitest';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import Game from './index'; 
import { useBoard, getFenNotation } from './board';
import { white, black } from './global'
import fen from './fen.json' with { type: 'json' };

describe('App', () => {
    // it('has white and black piece', () => {
    //     const { result: { current: { board } } } = renderHook(() => useBoard({}));
    //     expect(board[7][4]).toBe(white.king);
    //     expect(board[0][4]).toBe(black.king);
    // });
    it('all pawn moves: initial position, 2 square, en passant', () => {
        const { result: { current: { board } } } = renderHook(() => useBoard({}));

        // const { result: { current: { board } } } = renderHook(() => useBoard());
    });
    it('A whole game on useBoard()', () => {
        const { result } = renderHook(() => useBoard({}));
        for (const [i, { fen: f, move }] of fen.entries()) {
            console.log(move, f);
            act(() => result.current.move(move));
            expect(getFenNotation(result.current.board, result.current.isWhiteTurn, result.current.castlingRights, result.current.enPassentTarget, result.current.halfMovesNum, result.current.fullMovesNum)).toBe(f);
        }
        // console.log('first isWhiteTurn', result.current.isWhiteTurn)
        // console.log(fen[0].move, fen[0].fen);
        // expect(getFenNotation(result.current.board, result.current.isWhiteTurn, result.current.castlingRights, result.current.halfMovesNum, result.current.fullMovesNum)).toBe(fen[0].fen);
        // act(() => result.current.move(fen[0].move));

        // // rerender();
        
        // expect(getFenNotation(result.current.board, result.current.isWhiteTurn, result.current.castlingRights, result.current.halfMovesNum, result.current.fullMovesNum)).toBe(fen[1].fen);
        // console.log(result.current.isWhiteTurn)
        // act(() => result.current.move(fen[1].move));

        // // rerender();
        
        // expect(getFenNotation(result.current.board, result.current.isWhiteTurn, result.current.castlingRights, result.current.halfMovesNum, result.current.fullMovesNum)).toBe(fen[2].fen);
        // console.log(result.current.isWhiteTurn)
        // act(() => result.current.move(fen[2].move));
    });
    // test('Board handleSelect', async () => {
    //     render(<Game />);

    // })
});

// export {};