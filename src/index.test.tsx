import React from 'react';
import { describe, it, expect, test } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import Game from './index'; 
import { useBoard } from './board';
import { white, black } from './global'

describe('App', () => {
    it('has white and black piece', () => {
        const { result: { current: { board } } } = renderHook(() => useBoard({}));
        expect(board[7][4]).toBe(white.king);
        expect(board[0][4]).toBe(black.king);
    });
    it('all pawn moves: initial position, 2 square, en passant', () => {
        const { result: { current: { board } } } = renderHook(() => useBoard({}));

        // const { result: { current: { board } } } = renderHook(() => useBoard());
    });
    // test('Board handleSelect', async () => {
    //     render(<Game />);

    // })
});

// export {};