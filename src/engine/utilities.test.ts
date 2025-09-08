import { describe, expect, test } from "@jest/globals";
import { algebraicToIndex, indexToAlgebraic } from "./utilities";
import { BoardDimensions } from "./types";

describe("algebraicToIndex", () => {
    const tests = [
        {
            width: 1,
            height: 1,
            algebraic: "a1",
            expected: 0,
        },
        {
            width: 2,
            height: 2,
            algebraic: "a2",
            expected: 0,
        },
        {
            width: 8,
            height: 8,
            algebraic: "a8",
            expected: 0,
        },
        {
            width: 8,
            height: 8,
            algebraic: "h1",
            expected: 63,
        },
        {
            width: 9,
            height: 9,
            algebraic: "a9",
            expected: 0,
        },
        {
            width: 9,
            height: 9,
            algebraic: "i1",
            expected: 80,
        },
        {
            width: 2,
            height: 10,
            algebraic: 'a10',
            expected: 0
        },
        {
            width: 2,
            height: 10,
            algebraic: 'b1',
            expected: 19
        }
    ];

    for (const t of tests) {
        test(`${t.width}x${t.height}: ${t.algebraic} -> ${t.expected}`, () => {
            expect(
                algebraicToIndex(
                    { width: t.width, height: t.height },
                    t.algebraic
                )
            ).toBe(t.expected);
        });
    }
});

describe("indexToAlgebraic", () => {
    test("8x8: 0 -> a8", () => {
        expect(indexToAlgebraic({ width: 8, height: 8 }, 0)).toBe("a8");
    });
});
