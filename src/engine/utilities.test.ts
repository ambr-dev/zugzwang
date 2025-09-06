import {describe, expect, test} from '@jest/globals';
import { algebraicToIndex } from './utilities';
import { BoardDimensions } from './types';

const eightByEight: BoardDimensions = {width: 8, height: 8};

describe('algebraicToIndex', () => {
    test('8x8: a8 -> 0', () => {
        expect(algebraicToIndex(eightByEight, 'a8')).toBe(0);
    });
});