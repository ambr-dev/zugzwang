import { describe, expect, test } from "@jest/globals";
import { algebraicToIndex, indexToAlgebraic } from "./utilities";
import { BoardDimensions } from "./types";

describe("algebraicToIndex", () => {
    const createTest = (
        boardWidth: number,
        boardHeight: number,
        algebraicNotation: string,
        expectedIndex: number
    ) => ({
        boardWidth,
        boardHeight,
        algebraicNotation,
        expectedIndex,
    });
    const tests = [
        createTest(1, 1, "a1", 0),
        createTest(2, 2, "a2", 0),
        createTest(8, 8, "a8", 0),
        createTest(8, 8, "h1", 63),
        createTest(9, 9, "a9", 0),
        createTest(9, 9, "i1", 80),
        createTest(2, 10, "b1", 19),
    ];

    for (const t of tests) {
        test(`${t.boardWidth}x${t.boardHeight}: ${t.algebraicNotation} -> ${t.expectedIndex}`, () => {
            expect(
                algebraicToIndex(
                    { width: t.boardWidth, height: t.boardHeight },
                    t.algebraicNotation
                )
            ).toBe(t.expectedIndex);
        });
    }
});

describe("indexToAlgebraic", () => {
    test("8x8: 0 -> a8", () => {
        expect(indexToAlgebraic({ width: 8, height: 8 }, 0)).toBe("a8");
    });
});
