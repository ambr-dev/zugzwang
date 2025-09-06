import {describe, expect, test} from '@jest/globals';
import { fromFEN } from './fen';
import { boardToString } from './utilities';

describe('FEN module', () => {
    test('produces correct 8x8 board', () => {
        // board stm castlingRights possibleEnPassant halfMove fullMove
        const eightByEightFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const actual = fromFEN(eightByEightFEN);

        const actualBoardString = boardToString({width: 8, height: 8}, actual.board);
        const expectedBoardString = `rnbqkbnr\npppppppp\n........\n........\n........\n........\nPPPPPPPP\nRNBQKBNR`;

        expect(actualBoardString).toBe(expectedBoardString);
        expect(actual.castlingRights).toBe(15);
        expect(actual.sideToMove).toBe("W");
        expect(actual.enPassant).toBe(-1);
        expect(actual.halfMove).toBe(0);
        expect(actual.fullMove).toBe(1);
    });

    test.skip('produces correct 9x9 board', () => {
        const eightByEightFEN = "rnbqkqbnr/ppppppppp/9/9/9/9/9/PPPPPPPPP/RNBQKQBNR w KQkq - 0 1";
        const actual = fromFEN(eightByEightFEN);

        const actualBoardString = boardToString({width: 9, height: 9}, actual.board);
        const expectedBoardString = `rnbqkqbnr\nppppppppp\n.........\n.........\n.........\n.........\n.........\nPPPPPPPPP\nRNBQKQBNR`;

        expect(actualBoardString).toBe(expectedBoardString);
        expect(actual.castlingRights).toBe(15);
        expect(actual.sideToMove).toBe("W");
        expect(actual.enPassant).toBe(-1);
        expect(actual.halfMove).toBe(0);
        expect(actual.fullMove).toBe(1);

    });
});