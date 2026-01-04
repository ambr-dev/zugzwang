import {describe, expect, test} from '@jest/globals';
import { createStateFromConfig } from './fen';
import { boardToString } from './utilities';
import eightByEightConfigJson from "./configs/default.json";
import nineByNineConfigJson from "./configs/9-by-9.json";
import { GameConfigSchema } from './types';

const eightByEightConfig = GameConfigSchema.parse(eightByEightConfigJson);
const nineByNineconfig = GameConfigSchema.parse(nineByNineConfigJson);

describe('FEN module', () => {
    test('produces correct 8x8 board', () => {
        const actual = createStateFromConfig(eightByEightConfig);

        const actualBoardString = boardToString(actual);
        const expectedBoardString = `rnbqkbnr\npppppppp\n........\n........\n........\n........\nPPPPPPPP\nRNBQKBNR`;

        expect(actualBoardString).toBe(expectedBoardString);
        expect(actual.castling).toContainEqual("w-K");
        expect(actual.castling).toContainEqual("w-Q");
        expect(actual.castling).toContainEqual("b-K");
        expect(actual.castling).toContainEqual("b-Q");
        expect(actual.sideToMove).toBe("W");
        expect(actual.enPassant).toBeUndefined();
        expect(actual.halfMove).toBe(0);
        expect(actual.fullMove).toBe(1);
    });

    test('produces correct 9x9 board', () => {
        const actual = createStateFromConfig(nineByNineconfig);

        const actualBoardString = boardToString(actual);
        const expectedBoardString = `rnbqkqbnr\nppppppppp\n.........\n.........\n.........\n.........\n.........\nPPPPPPPPP\nRNBQKQBNR`;

        expect(actualBoardString).toBe(expectedBoardString);
        expect(actual.castling).toContainEqual("w-K");
        expect(actual.castling).toContainEqual("w-Q");
        expect(actual.castling).toContainEqual("b-K");
        expect(actual.castling).toContainEqual("b-Q");
        expect(actual.sideToMove).toBe("W");
        expect(actual.enPassant).toBeUndefined();
        expect(actual.halfMove).toBe(0);
        expect(actual.fullMove).toBe(1);
    });

    test('produces correct 8x8 board after 1. ...e4', () => {
        const e4 = {...eightByEightConfig};
        e4.startingPosition = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR";
        e4.sideToMove = "B";
        e4.enPassant = {
            captureIndex: 20,
            deleteIndex: 28
        };
        const actual = createStateFromConfig(e4);

        const actualBoardString = boardToString(actual);
        const expectedBoardString = `rnbqkbnr\npppppppp\n........\n........\n....P...\n........\nPPPP.PPP\nRNBQKBNR`;

        expect(actualBoardString).toBe(expectedBoardString);
        expect(actual.castling).toContainEqual("w-K");
        expect(actual.castling).toContainEqual("w-Q");
        expect(actual.castling).toContainEqual("b-K");
        expect(actual.castling).toContainEqual("b-Q");
        expect(actual.sideToMove).toBe("B");
        expect(actual.enPassant).not.toBeUndefined();
        expect(actual.enPassant).toEqual({
            captureIndex: 20,
            deleteIndex: 28
        });
        expect(actual.halfMove).toBe(0);
        expect(actual.fullMove).toBe(1);
    });
});