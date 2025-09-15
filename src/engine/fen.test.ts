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
        expect(actual.castlingRights).toBe(15);
        expect(actual.sideToMove).toBe("W");
        expect(actual.enPassant).toBe(-1);
        expect(actual.halfMove).toBe(0);
        expect(actual.fullMove).toBe(1);
    });

    test('produces correct 9x9 board', () => {
        const actual = createStateFromConfig(nineByNineconfig);

        const actualBoardString = boardToString(actual);
        const expectedBoardString = `rnbqkqbnr\nppppppppp\n.........\n.........\n.........\n.........\n.........\nPPPPPPPPP\nRNBQKQBNR`;

        expect(actualBoardString).toBe(expectedBoardString);
        expect(actual.castlingRights).toBe(15);
        expect(actual.sideToMove).toBe("W");
        expect(actual.enPassant).toBe(-1);
        expect(actual.halfMove).toBe(0);
        expect(actual.fullMove).toBe(1);
    });
});