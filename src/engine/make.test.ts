import { describe, expect, test } from "@jest/globals";
import { EnPassant, GameConfig, GameConfigSchema, Move, Piece } from "./types";
import eightByEightConfigJson from "./configs/default.json";
import { createStateFromConfig } from "./fen";
import { make, undo } from "./make";
import { algebraicToIndex, atoi, boardToString } from "./utilities";

const eightByEightConfig = GameConfigSchema.parse(eightByEightConfigJson);

type ReadableMove = {
    from: string;
    to: string;
    castle?: string;
    enPassant?: EnPassant;
    isEnPassantCapture?: boolean;
    promotion?: Piece;
};

function transformReadableMove(config: GameConfig, r: ReadableMove): Move {
    return {
        from: atoi(r.from),
        to: atoi(r.to),
        castle: r.castle,
        enPassant: r.enPassant,
        isEnPassantCapture: r.isEnPassantCapture,
        promotion: r.promotion,
    };
}

describe("make", () => {
    describe("8x8", () => {
        test("1. e4", () => {
            const state = createStateFromConfig(eightByEightConfig);

            const pawnBefore = state.board[atoi("e2")];
            const move = transformReadableMove(eightByEightConfig, {
                from: "e2",
                to: "e4",
                enPassant: { captureIndex: atoi("e3"), deleteIndex: atoi("e4") },
            });
            const undo = make(state, move);

            expect(state.board[atoi("e2")]).toBe(null);
            expect(state.board[atoi("e4")]).not.toBe(null);

            expect(state.board[atoi("e2")]).not.toBe(pawnBefore);
            expect(state.board[atoi("e4")]).toBe(pawnBefore);

            expect(undo).not.toBe(null);
            expect(undo.prevSideToMove).toBe("W");
            expect(undo.prevCastlingRights).toStrictEqual(eightByEightConfig.castling?.available);
            expect(undo.prevEnPassant).toBe(undefined);
            expect(undo.prevHalfMove).toBe(0);
            expect(undo.prevFullMove).toBe(1);

            expect(state.sideToMove).toBe("B");
            expect(state.castling).toBe(eightByEightConfig.castling?.available);
            expect(state.enPassant).not.toBeUndefined();
            expect(state.enPassant).toEqual({ captureIndex: atoi("e3"), deleteIndex: atoi("e4") });
            expect(state.halfMove).toBe(0);
            expect(state.fullMove).toBe(1);
        });

        test("1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Qe2 Qe7 5. O-O O-O", () => {
            const state = createStateFromConfig(eightByEightConfig);
            make(state, { from: atoi("e2"), to: atoi("e4") });
            make(state, { from: atoi("e7"), to: atoi("e5") });
            make(state, { from: atoi("g1"), to: atoi("f3") });
            make(state, { from: atoi("b8"), to: atoi("c6") });
            make(state, { from: atoi("f1"), to: atoi("c4") });
            make(state, { from: atoi("f8"), to: atoi("c5") });
            make(state, { from: atoi("d1"), to: atoi("e2") });
            make(state, { from: atoi("d8"), to: atoi("e7") });
            make(state, { from: atoi("e1"), to: atoi("g1"), castle: "w-K" });
            make(state, { from: atoi("e8"), to: atoi("g8"), castle: "b-K" });
            28;
            expect(boardToString(state)).toMatch(
                `r.b..rk.\nppppqppp\n..n.....\n..b.p...\n..B.P...\n.....N..\nPPPPQPPP\nRNB..RK.`
            );
        });
    });
});

describe("undo", () => {
    describe("8x8", () => {
        test("1. e4", () => {
            const state = createStateFromConfig(eightByEightConfig);
            const undoE4 = make(state, { from: atoi("e2"), to: atoi("e4") });

            undo(state, undoE4);

            const humanReadableBoard = eightByEightConfig.startingPosition.replace(/\//g, '\n').replace(/8/g, '........');
            expect(boardToString(state)).toMatch(humanReadableBoard);
            expect(state.sideToMove).toBe("W");
            expect(state.castling).toStrictEqual(eightByEightConfig.castling?.available);
            expect(state.enPassant).toBeUndefined();
            expect(state.halfMove).toBe(0);
            expect(state.fullMove).toBe(1);
        });

        test("1. O-O", () => {
            const onlyWhiteCastlingConfig: GameConfig = {
                ...eightByEightConfig,
                startingPosition: "8/8/8/8/8/8/8/4K2R",
                castling: {
                    available: ['w-K'],
                    routes: eightByEightConfig.castling!.routes
                }
            }
            const state = createStateFromConfig(onlyWhiteCastlingConfig);
            const undoCastle = make(state, {
                from: atoi("e1"),
                to: atoi("g1"),
                castle: 'w-K'
            });

            undo(state, undoCastle);

            const humanReadableBoard = onlyWhiteCastlingConfig.startingPosition.replace(/\//g, '\n').replace(/8/g, '........').replace(/4/g, '....').replace(/2/g, '..');
            expect(boardToString(state)).toMatch(humanReadableBoard);
            expect(state.sideToMove).toBe("W");
            expect(state.castling).toStrictEqual(onlyWhiteCastlingConfig.castling?.available);
            expect(state.enPassant).toBeUndefined();
            expect(state.halfMove).toBe(0);
            expect(state.fullMove).toBe(1);
        })
    });
});
