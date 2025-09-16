import { describe, expect, test } from "@jest/globals";
import { algebraicToIndex, getFile, getRank, indexToAlgebraic } from "./utilities";
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
        createTest(8, 8, "a1", 0),
        createTest(8, 8, "a8", 56),
        createTest(8, 8, "h1", 7),
        createTest(8, 8, "h8", 63),
        createTest(1, 1, "a1", 0),
        createTest(2, 2, "a2", 2),
        createTest(9, 9, "a9", 72),
        createTest(9, 9, "i1", 8),
        createTest(2, 10, "b10", 19),
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
    const createTestContext = (
        boardWidth: number,
        boardHeight: number,
        index: number,
        expectedAlgebraicNotation: string
    ) => ({
        boardWidth,
        boardHeight,
        index,
        expectedAlgebraicNotation,
    });
    const tests = [
        createTestContext(8, 8, 0, "a1"),
        createTestContext(8, 8, 56, "a8"),
        createTestContext(8, 8, 7, "h1"),
        createTestContext(8, 8, 63, "h8"),
        createTestContext(1, 1, 0, "a1"),
        createTestContext(2, 2, 0, "a1"),
        createTestContext(9, 9, 80, "i9"),
        createTestContext(2, 10, 19, "b10"),
    ];

    for (const t of tests) {
        test(`${t.boardWidth}x${t.boardHeight}: ${t.index} -> ${t.expectedAlgebraicNotation}`, () => {
            expect(
                indexToAlgebraic(
                    { width: t.boardWidth, height: t.boardHeight },
                    t.index
                )
            ).toBe(t.expectedAlgebraicNotation);
        });
    }
});

describe("getRankFromIndex", () => {
    const eightByEight: BoardDimensions = {width: 8, height: 8};
    test("8x8", () => {
        expect(getRank(eightByEight, 0)).toBe(0);
        expect(getRank(eightByEight, 1)).toBe(0);
        expect(getRank(eightByEight, 2)).toBe(0);
        expect(getRank(eightByEight, 3)).toBe(0);

        expect(getRank(eightByEight, 8)).toBe(1);
        expect(getRank(eightByEight, 9)).toBe(1);
        expect(getRank(eightByEight, 10)).toBe(1);
        expect(getRank(eightByEight, 11)).toBe(1);
    });
});

describe("getFileFromIndex", () => {
    const eightByEight: BoardDimensions = {width: 8, height: 8};
    test("8x8", () => {
        expect(getFile(eightByEight, 0)).toBe(0);
        expect(getFile(eightByEight, 1)).toBe(1);
        expect(getFile(eightByEight, 2)).toBe(2);
        expect(getFile(eightByEight, 3)).toBe(3);

        expect(getFile(eightByEight, 8)).toBe(0);
        expect(getFile(eightByEight, 9)).toBe(1);
        expect(getFile(eightByEight, 10)).toBe(2);
        expect(getFile(eightByEight, 11)).toBe(3);
    });
});