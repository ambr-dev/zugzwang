import {describe, expect, test} from '@jest/globals';
import { algebraicToIndex, indexToAlgebraic } from './utilities';
import { BoardDimensions } from './types';

const eightByEight: BoardDimensions = {width: 8, height: 8};
const nineByNine: BoardDimensions = {width: 9, height: 9};

describe('algebraicToIndex', () => {
    test('8x8: a8 -> 0', () => {
        expect(algebraicToIndex(eightByEight, 'a8')).toBe(0);
    });
});

describe('indexToAlgebraic', () => {
    test('8x8: 0 -> a8', () => {
        expect(indexToAlgebraic(eightByEight, 0)).toBe('a8');
    });
});