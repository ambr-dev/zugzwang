import { describe, expect, test } from "@jest/globals";
import nineByNineConfigJson from "./configs/9-by-9.json";
import eightByEightConfigJson from "./configs/default.json";
import { createStateFromConfig } from "./fen";
import { isSquareAttacked, legalMoves, pseudoMoves } from "./movegen";
import { Color, GameConfig, GameConfigSchema, GameState, Move } from "./types";
import { algebraicToIndex, atoi, indexToAlgebraic } from "./utilities";

const eightByEightConfig = GameConfigSchema.parse(eightByEightConfigJson);
const nineByNineconfig = GameConfigSchema.parse(nineByNineConfigJson);

const genMoves = (config: GameConfig): { from: string; to: string }[] => {
    const state: GameState = createStateFromConfig(config);
    const moves: Move[] = pseudoMoves(state);
    const movesAlgebraic = moves.map((m) => ({
        from: indexToAlgebraic(state.config.boardDimensions, m.from),
        to: indexToAlgebraic(state.config.boardDimensions, m.to),
        ...(m.enPassant && {
            enPassant: {
                captureIndex: indexToAlgebraic(state.config.boardDimensions, m.enPassant.captureIndex),
                deleteIndex: indexToAlgebraic(state.config.boardDimensions, m.enPassant.deleteIndex),
            },
        }),
        ...(m.isEnPassantCapture && { isEnPassantCapture: true }),
        ...(m.castle && { castle: m.castle }),
    }));

    return movesAlgebraic;
};

function modify(
    config: GameConfig,
    startingPosition?: string,
    sideToMove?: Color,
    castlingAvailable?: string[],
    enPassant?: { captureIndex: string; deleteIndex: string },
    halfMove?: number,
    fullMove?: number
): GameConfig {
    return {
        ...config,
        ...(startingPosition && { startingPosition }),
        ...(sideToMove && { sideToMove }),
        ...(castlingAvailable &&
            config.castling && {
                castling: {
                    ...config.castling,
                    available: castlingAvailable,
                },
            }),
        ...(enPassant && {
            enPassant: {
                captureIndex: algebraicToIndex(config.boardDimensions, enPassant.captureIndex),
                deleteIndex: algebraicToIndex(config.boardDimensions, enPassant.deleteIndex),
            },
        }),
        ...(halfMove && { halfMove }),
        ...(fullMove && { fullMove }),
    };
}

describe("8x8", () => {
    test("8x8: start contains '1. e3'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "e2", to: "e3" });
    });
    test("8x8: start contains '1. e4'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({
            from: "e2",
            to: "e4",
            enPassant: { captureIndex: "e3", deleteIndex: "e4" },
        });
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
        expect(movesAlgebraic).not.toContainEqual({
            from: "e7",
            to: "e5",
            enPassant: { captureIndex: "e6", deleteIndex: "e5" },
        });
    });
    test("8x8: start does not contain '1. e6'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).not.toContainEqual({ from: "e7", to: "e6" });
    });

    // 1. e4
    const e4 = modify(
        eightByEightConfig,
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
        "B",
        ["w-K", "w-Q", "b-K", "b-Q"],
        { captureIndex: "e3", deleteIndex: "e4" },
        undefined,
        undefined
    );

    test("8x8: e4 contains '1. ...e5'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({
            from: "e7",
            to: "e5",
            enPassant: { captureIndex: "e6", deleteIndex: "e5" },
        });
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

    const e4e5d4 = modify(
        eightByEightConfig,
        "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR",
        "B",
        ["w-K", "w-Q", "b-K", "b-Q"],
        { captureIndex: "d3", deleteIndex: "d4" },
        0,
        2
    );
    test("8x8: e4 e5 d4 contains '2. ...exd4'", () => {
        const movesAlgebraic = genMoves(e4e5d4);
        expect(movesAlgebraic).toContainEqual({ from: "e5", to: "d4" });
    });
    test("8x8: e4 e5 d4 does not contain '2. ...exf4'", () => {
        const movesAlgebraic = genMoves(e4e5d4);
        expect(movesAlgebraic).not.toContainEqual({ from: "e5", to: "f5" });
    });

    const e4e5d4d5 = modify(
        eightByEightConfig,
        "rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR",
        "W",
        ["w-K", "w-Q", "b-K", "b-Q"],
        { captureIndex: "d6", deleteIndex: "d7" },
        0,
        3
    );
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

    const enPassantPositionWhite = modify(
        eightByEightConfig,
        "8/8/8/3Pp3/8/8/8/8",
        "W",
        ["w-K", "w-Q", "b-K", "b-Q"],
        { captureIndex: "e6", deleteIndex: "e7" },
        0,
        1
    );

    test("8x8: en passant for white", () => {
        const movesAlgebraic = genMoves(enPassantPositionWhite);
        expect(movesAlgebraic).toContainEqual({ from: "d5", to: "e6", isEnPassantCapture: true });
    });

    const enPassantPositionBlack = modify(
        eightByEightConfig,
        "8/8/8/8/3Pp3/8/8/8",
        "B",
        ["w-K", "w-Q", "b-K", "b-Q"],
        { captureIndex: "d3", deleteIndex: "d4" },
        0,
        1
    );
    test("8x8: en passant for black", () => {
        const movesAlgebraic = genMoves(enPassantPositionBlack);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d3", isEnPassantCapture: true });
    });

    const soloQueen = modify(eightByEightConfig, "8/8/8/8/4Q3/8/8/8", "W", ["w-K", "w-Q", "b-K", "b-Q"], undefined, 0, 1);
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

    const soloRook = modify(eightByEightConfig, "8/8/8/8/4R3/8/8/8", "W", ["w-K", "w-Q", "b-K", "b-Q"], undefined, 0, 1);
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

    const soloBishop = modify(eightByEightConfig, "8/8/8/8/4B3/8/8/8", "W", ["w-K", "w-Q", "b-K", "b-Q"], undefined, 0, 1);
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

    const castlingWhiteAllowed = modify(eightByEightConfig, "8/8/8/8/8/8/8/R3K2R", "W", ["w-K", "w-Q"], undefined, 0, 1);
    test("8x8: Castling White: Allowed", () => {
        const movesAlgebraic = genMoves(castlingWhiteAllowed);
        expect(movesAlgebraic).toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "g1" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "c1" });
    });

    const castlingWhiteNotAllowed = modify(eightByEightConfig, "8/8/8/8/8/8/8/R3K2R", "W", [], undefined, 0, 1);
    test("8x8: Castling White: Not Allowed", () => {
        const movesAlgebraic = genMoves(castlingWhiteNotAllowed);
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
    });

    const castlingWhiteBothObstacle = modify(
        eightByEightConfig,
        "8/8/8/8/8/8/8/RP2K1PR",
        "W",
        ["w-K", "w-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling White: Both Blocked", () => {
        const movesAlgebraic = genMoves(castlingWhiteBothObstacle);
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
    });

    const castlingWhiteQueenObstacle = modify(
        eightByEightConfig,
        "8/8/8/8/8/8/8/RP2K2R",
        "W",
        ["w-K", "w-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling White: Queen-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingWhiteQueenObstacle);
        expect(movesAlgebraic).toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
    });

    const castlingWhiteKingObstacle = modify(
        eightByEightConfig,
        "8/8/8/8/8/8/8/R3K1PR",
        "W",
        ["w-K", "w-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling White: King-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingWhiteKingObstacle);
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
    });

    const castlingWhiteKingAttacked = modify(
        eightByEightConfig,
        "4q3/8/8/8/8/8/8/R3K2R",
        "W",
        ["w-K", "w-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling White: King in check", () => {
        const movesAlgebraic = genMoves(castlingWhiteKingAttacked);
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
    });

    const castlingWhiteKingSideAttacked = modify(
        eightByEightConfig,
        "5q2/8/8/8/8/8/8/R3K2R",
        "W",
        ["w-K", "w-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling White: King-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingWhiteKingSideAttacked);
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
    });

    const castlingWhiteQueenSideAttacked = modify(
        eightByEightConfig,
        "3q4/8/8/8/8/8/8/R3K2R",
        "W",
        ["w-K", "w-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling White: Queen-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingWhiteQueenSideAttacked);
        expect(movesAlgebraic).toContainEqual({ from: "e1", to: "g1", castle: "w-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e1", to: "c1", castle: "w-Q" });
    });

    const castlingBlackAllowed = modify(eightByEightConfig, "r3k2r/8/8/8/8/8/8/8", "B", ["b-K", "b-Q"], undefined, 0, 1);
    test("8x8: Castling Black: Allowed", () => {
        const movesAlgebraic = genMoves(castlingBlackAllowed);
        expect(movesAlgebraic).toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "g8" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "c8" });
    });

    const castlingBlackNotAllowed = modify(eightByEightConfig, "r3k2r/8/8/8/8/8/8/8", "B", [], undefined, 0, 1);
    test("8x8: Castling Black: Not Allowed", () => {
        const movesAlgebraic = genMoves(castlingBlackNotAllowed);
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
    });

    const castlingBlackBothObstacle = modify(
        eightByEightConfig,
        "rp2k1pr/8/8/8/8/8/8/8",
        "B",
        ["b-K", "b-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling Black: Both Blocked", () => {
        const movesAlgebraic = genMoves(castlingBlackBothObstacle);
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
    });

    const castlingBlackQueenObstacle = modify(
        eightByEightConfig,
        "rp2k2r/8/8/8/8/8/8/8",
        "B",
        ["b-K", "b-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling Black: Queen-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingBlackQueenObstacle);
        expect(movesAlgebraic).toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
    });

    const castlingBlackKingObstacle = modify(
        eightByEightConfig,
        "r3k1pr/8/8/8/8/8/8/8",
        "B",
        ["b-K", "b-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling Black: King-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingBlackKingObstacle);
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
    });

    const castlingBlackKingAttacked = modify(
        eightByEightConfig,
        "r3k2r/8/8/8/8/8/8/4Q3",
        "B",
        ["b-K", "b-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling Black: King in check", () => {
        const movesAlgebraic = genMoves(castlingBlackKingAttacked);
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
    });

    const castlingBlackKingSideAttacked = modify(
        eightByEightConfig,
        "r3k2r/8/8/8/8/8/8/5Q2",
        "B",
        ["b-K", "b-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling Black: King-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingBlackKingSideAttacked);
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
    });

    const castlingBlackQueenSideAttacked = modify(
        eightByEightConfig,
        "r3k2r/8/8/8/8/8/8/3Q4",
        "B",
        ["b-K", "b-Q"],
        undefined,
        0,
        1
    );
    test("8x8: Castling Black: Queen-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingBlackQueenSideAttacked);
        expect(movesAlgebraic).toContainEqual({ from: "e8", to: "g8", castle: "b-K" });
        expect(movesAlgebraic).not.toContainEqual({ from: "e8", to: "c8", castle: "b-Q" });
    });

    const soloQueenBlackToMove = modify(eightByEightConfig, "8/8/8/8/4Q3/8/8/8", "B", [], undefined, 0, 1);
    test("8x8: Is Square being attacked by queen on e4", () => {
        const state: GameState = createStateFromConfig(soloQueenBlackToMove);

        const isAttackedMatrix = [
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1,
            0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0,
        ];

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloRookBlackToMove = modify(eightByEightConfig, "8/8/8/8/4R3/8/8/8", "B", [], undefined, 0, 1);
    test("8x8: Is Square being attacked by rook on e4", () => {
        const state: GameState = createStateFromConfig(soloRookBlackToMove);

        const isAttackedMatrix = [
            0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0,
            0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
        ];

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloBishopBlackToMove = modify(eightByEightConfig, "8/8/8/8/4B3/8/8/8", "B", [], undefined, 0, 1);
    test("8x8: Is Square being attacked by bishop on e4", () => {
        const state: GameState = createStateFromConfig(soloBishopBlackToMove);

        const isAttackedMatrix = [
            0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
            0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
        ];

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloKnightBlackToMove = modify(eightByEightConfig, "8/8/8/8/4N3/8/8/8", "B", [], undefined, 0, 1);
    test("8x8: Is Square being attacked by knight on e4", () => {
        const state: GameState = createStateFromConfig(soloKnightBlackToMove);

        const isAttackedMatrix = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
            1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ];

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloPawnBlackToMove = modify(eightByEightConfig, "8/8/8/8/4P3/8/8/8", "B", [], undefined, 0, 1);
    test("8x8: Is Square being attacked by white pawn on e4", () => {
        const state: GameState = createStateFromConfig(soloPawnBlackToMove);

        // prettier-ignore
        const isAttackedMatrix = [
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 1, 0, 1, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0,
        ];

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloPawnWhiteToMove = modify(eightByEightConfig, "8/8/8/8/4p3/8/8/8", "W", [], undefined, 0, 1);
    test("8x8: Is Square being attacked by black pawn on e4", () => {
        const state: GameState = createStateFromConfig(soloPawnWhiteToMove);

        // prettier-ignore
        const isAttackedMatrix = [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 1, 0, 1, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0, 
            0, 0, 0, 0, 0, 0, 0, 0,
        ];

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const kingVsRookWhiteToMove = modify(eightByEightConfig, "8/8/8/4K3/8/8/8/5r2", "W", [], undefined, 0, 1);
    test("8x8: Legal moves of king vs rook", () => {
        const state: GameState = createStateFromConfig(kingVsRookWhiteToMove);
        const moves: Move[] = legalMoves(state);

        expect(moves).not.toContainEqual({
            from: atoi("e5"),
            to: atoi("f6"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e5"),
            to: atoi("f5"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e5"),
            to: atoi("f4"),
        });

        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("e6"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("e4"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("d6"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("d5"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("d4"),
        });
    });

    const discoveredCheck = modify(eightByEightConfig, "8/8/8/4K3/4R3/8/8/4r3", "W", [], undefined, 0, 1);
    test("8x8: Legal moves of discovered check", () => {
        const state: GameState = createStateFromConfig(discoveredCheck);
        const moves: Move[] = legalMoves(state);

        // Illegal rook moves
        expect(moves).not.toContainEqual({
            from: atoi("e4"),
            to: atoi("f4"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e4"),
            to: atoi("g4"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e4"),
            to: atoi("h4"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e4"),
            to: atoi("d4"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e4"),
            to: atoi("c4"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e4"),
            to: atoi("b4"),
        });
        expect(moves).not.toContainEqual({
            from: atoi("e4"),
            to: atoi("a4"),
        });

        // Legal rook moves
        expect(moves).toContainEqual({
            from: atoi("e4"),
            to: atoi("e3"),
        });
        expect(moves).toContainEqual({
            from: atoi("e4"),
            to: atoi("e2"),
        });
        expect(moves).toContainEqual({
            from: atoi("e4"),
            to: atoi("e1"),
        });

        // Legal king moves
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("e6"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("f4"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("f5"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("f6"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("d4"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("d5"),
        });
        expect(moves).toContainEqual({
            from: atoi("e5"),
            to: atoi("d6"),
        });
    });
});
