import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import Game, { useBoard } from './index'; 
import { white, black } from './global'

describe('App', () => {
    it('has white and black piece', () => {
        const { result: { current: { board } } } = renderHook(() => useBoard());
        expect(board[7][4]).toBe(white.king);
        expect(board[0][4]).toBe(black.king);
    });
    it('all pawn moves: initial position, 2 square, en passant', () => {
        const { result: { current: { board } } } = renderHook(() => useBoard());
        
        // const { result: { current: { board } } } = renderHook(() => useBoard());
    });
});

// export {};