import { describe, expect, test } from "@jest/globals";
import eightByEightConfigJson from "./configs/default.json";
import nineByNineConfigJson from "./configs/9-by-9.json";
import { createStateFromConfig } from "./fen";
import { GameConfig, GameConfigSchema, GameState, Move } from "./types";
import { pseudoMoves } from "./movegen";
import { boardToString, getOppositeColor, indexToAlgebraic } from "./utilities";

const eightByEightConfig = GameConfigSchema.parse(eightByEightConfigJson);
const nineByNineconfig = GameConfigSchema.parse(nineByNineConfigJson);

const sandboxConfig = { ...eightByEightConfig };
sandboxConfig.startingPosition = "rnbqkbnr/pppppppp/8/8/8/4p3/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const genMoves = (config: GameConfig): {from: string, to: string}[] => {
    const state: GameState = createStateFromConfig(config);
    const moves: Move[] = pseudoMoves(state);
    const movesAlgebraic = moves.map((m) => ({
        from: indexToAlgebraic(state.config.boardDimensions, m.from),
        to: indexToAlgebraic(state.config.boardDimensions, m.to),
    }));

    return movesAlgebraic;
}

describe("8x8", () => {
    test("8x8: start contains '1. e3'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "e2", to: "e3" });
    });
    test("8x8: start contains '1. e4'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "e2", to: "e4" });
    });
    test("8x8: start contains '1. Na3'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "b1", to: "a3" });
    });
    test("8x8: start contains '1. Nc3'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "b1", to: "c3" });
    });
    // It's not blacks turn.
    test("8x8: start does not contain '1. e5'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).not.toContainEqual({ from: "e7", to: "e5" });
    });
    test("8x8: start does not contain '1. e6'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).not.toContainEqual({ from: "e7", to: "e6" });
    });

    // 1. e4
    const e4 = {...eightByEightConfig};
    e4.startingPosition = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

    test("8x8: e4 contains '1. ...e5'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "e7", to: "e5" });
    });
    test("8x8: e4 contains '1. ...e6'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "e7", to: "e6" });
    });
    test("8x8: e4 contains '1. ...Nc6'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "b8", to: "c6" });
    });
    test("8x8: e4 contains '1. ...Na6'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "b8", to: "a6" });
    });

    const e4e5d4 = {...eightByEightConfig};
    e4e5d4.startingPosition = "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2";
    test("8x8: e4 e5 d4 contains '2. ...exd4'", () => {
        const movesAlgebraic = genMoves(e4e5d4);
        expect(movesAlgebraic).toContainEqual({ from: "e5", to: "d4" });
    });
    test("8x8: e4 e5 d4 does not contain '2. ...exf4'", () => {
        const movesAlgebraic = genMoves(e4e5d4);
        expect(movesAlgebraic).not.toContainEqual({ from: "e5", to: "f5" });
    });

    const e4e5d4d5 = {...eightByEightConfig};
    e4e5d4d5.startingPosition = "rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3";
    test("8x8: e4 e5 d4 d5 contains '3. dxe5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).toContainEqual({ from: "d4", to: "e5" });
    });
    test("8x8: e4 e5 d4 d5 contains '3. exd5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5" });
    });
    test("8x8: e4 e5 d4 d5 does not contain '3. dxc5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).not.toContainEqual({ from: "d4", to: "c5" });
    });
    test("8x8: e4 e5 d4 d5 does not contain '3. exf5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f5" });
    });

    const enPassantPosition = {...eightByEightConfig};
    enPassantPosition.startingPosition = "rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3";

    const soloQueen = {...eightByEightConfig};
    soloQueen.startingPosition = "8/8/8/8/4Q3/8/8/8 w KQkq - 0 1";
    test("8x8: solo queen on e4 contains king moves", () => {
        const movesAlgebraic = genMoves(soloQueen);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5" });
    });
    test("8x8: solo queen on e4 contains rook moves", () => {
        const movesAlgebraic = genMoves(soloQueen);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e1" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e2" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e6" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e7" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e8" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h4" });
    });
    test("8x8: solo queen on e4 contains bishop moves", () => {
        const movesAlgebraic = genMoves(soloQueen);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b1" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c2" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g6" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h7" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b7" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c6" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g2" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h1" });
    });

    const soloRook = {...eightByEightConfig};
    soloRook.startingPosition = "8/8/8/8/4R3/8/8/8 w KQkq - 0 1";
    test("8x8: solo rook on e4 contains only rook moves", () => {
        const movesAlgebraic = genMoves(soloRook);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e1" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e2" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e6" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e7" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e8" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g4" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h4" });

        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "b1" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "c2" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "d3" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f5" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "g6" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "h7" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "a8" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "a8" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "b7" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "c6" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "d5" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f3" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "g2" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "h1" });
    });

    const soloBishop = {...eightByEightConfig};
    soloBishop.startingPosition = "8/8/8/8/4B3/8/8/8 w KQkq - 0 1";
    test("8x8: solo bishop on e4 contains only bishop moves", () => {
        const movesAlgebraic = genMoves(soloBishop);
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e1" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e2" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e3" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e5" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e6" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e7" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e8" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "a4" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "b4" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "c4" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "d4" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f4" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "g4" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "h4" });

        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b1" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c2" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g6" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h7" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b7" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c6" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f3" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g2" });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h1" });
    });
});
