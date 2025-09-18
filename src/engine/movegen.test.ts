import { describe, expect, test } from "@jest/globals";
import nineByNineConfigJson from "./configs/9-by-9.json";
import eightByEightConfigJson from "./configs/default.json";
import { createStateFromConfig } from "./fen";
import { isSquareAttacked, pseudoMoves } from "./movegen";
import { GameConfig, GameConfigSchema, GameState, Move } from "./types";
import { indexToAlgebraic } from "./utilities";

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
        enPassant: m.enPassant,
        castle: m.castle
    }));

    return movesAlgebraic;
}

describe("8x8", () => {
    test("8x8: start contains '1. e3'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "e2", to: "e3", enPassant: false, castle: false });
    });
    test("8x8: start contains '1. e4'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "e2", to: "e4", enPassant: false, castle: false });
    });
    test("8x8: start contains '1. Na3'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "b1", to: "a3", enPassant: false, castle: false });
    });
    test("8x8: start contains '1. Nc3'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).toContainEqual({ from: "b1", to: "c3", enPassant: false, castle: false });
    });
    // It's not blacks turn.
    test("8x8: start does not contain '1. e5'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).not.toContainEqual({ from: "e7", to: "e5", enPassant: false, castle: false });
    });
    test("8x8: start does not contain '1. e6'", () => {
        const movesAlgebraic = genMoves(eightByEightConfig);
        expect(movesAlgebraic).not.toContainEqual({ from: "e7", to: "e6", enPassant: false, castle: false });
    });

    // 1. e4
    const e4 = {...eightByEightConfig};
    e4.startingPosition = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

    test("8x8: e4 contains '1. ...e5'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "e7", to: "e5", enPassant: false, castle: false });
    });
    test("8x8: e4 contains '1. ...e6'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "e7", to: "e6", enPassant: false, castle: false });
    });
    test("8x8: e4 contains '1. ...Nc6'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "b8", to: "c6", enPassant: false, castle: false });
    });
    test("8x8: e4 contains '1. ...Na6'", () => {
        const movesAlgebraic = genMoves(e4);
        expect(movesAlgebraic).toContainEqual({ from: "b8", to: "a6", enPassant: false, castle: false });
    });

    const e4e5d4 = {...eightByEightConfig};
    e4e5d4.startingPosition = "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2";
    test("8x8: e4 e5 d4 contains '2. ...exd4'", () => {
        const movesAlgebraic = genMoves(e4e5d4);
        expect(movesAlgebraic).toContainEqual({ from: "e5", to: "d4", enPassant: false, castle: false });
    });
    test("8x8: e4 e5 d4 does not contain '2. ...exf4'", () => {
        const movesAlgebraic = genMoves(e4e5d4);
        expect(movesAlgebraic).not.toContainEqual({ from: "e5", to: "f5", enPassant: false, castle: false });
    });

    const e4e5d4d5 = {...eightByEightConfig};
    e4e5d4d5.startingPosition = "rnbqkbnr/ppp2ppp/8/3pp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3";
    test("8x8: e4 e5 d4 d5 contains '3. dxe5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).toContainEqual({ from: "d4", to: "e5", enPassant: false, castle: false });
    });
    test("8x8: e4 e5 d4 d5 contains '3. exd5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5", enPassant: false, castle: false });
    });
    test("8x8: e4 e5 d4 d5 does not contain '3. dxc5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).not.toContainEqual({ from: "d4", to: "c5", enPassant: false, castle: false });
    });
    test("8x8: e4 e5 d4 d5 does not contain '3. exf5'", () => {
        const movesAlgebraic = genMoves(e4e5d4d5);
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f5", enPassant: false, castle: false });
    });

    const enPassantPositionWhite = {...eightByEightConfig};
    enPassantPositionWhite.startingPosition = "8/8/8/3Pp3/8/8/8/8 w KQkq e6 0 1";

    test("8x8: en passant for white", () => {
        const movesAlgebraic = genMoves(enPassantPositionWhite)
        expect(movesAlgebraic).toContainEqual({from: "d5", to: "e6", enPassant: true, castle: false});
        expect(movesAlgebraic).not.toContainEqual({from: "d5", to: "e6", enPassant: false, castle: false});
    });

    const enPassantPositionBlack = {...eightByEightConfig};
    enPassantPositionBlack.startingPosition = "8/8/8/8/3Pp3/8/8/8 b KQkq d3 0 1";
    test("8x8: en passant for black", () => {
        const movesAlgebraic = genMoves(enPassantPositionBlack)
        expect(movesAlgebraic).toContainEqual({from: "e4", to: "d3", enPassant: true, castle: false});
        expect(movesAlgebraic).not.toContainEqual({from: "e4", to: "d3", enPassant: false, castle: false});
    });

    const soloQueen = {...eightByEightConfig};
    soloQueen.startingPosition = "8/8/8/8/4Q3/8/8/8 w KQkq - 0 1";
    test("8x8: solo queen on e4 contains king moves", () => {
        const movesAlgebraic = genMoves(soloQueen);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5", enPassant: false, castle: false });
    });
    test("8x8: solo queen on e4 contains rook moves", () => {
        const movesAlgebraic = genMoves(soloQueen);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e1", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e2", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e6", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e7", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e8", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h4", enPassant: false, castle: false });
    });
    test("8x8: solo queen on e4 contains bishop moves", () => {
        const movesAlgebraic = genMoves(soloQueen);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b1", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c2", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g6", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h7", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b7", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c6", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g2", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h1", enPassant: false, castle: false });
    });

    const soloRook = {...eightByEightConfig};
    soloRook.startingPosition = "8/8/8/8/4R3/8/8/8 w KQkq - 0 1";
    test("8x8: solo rook on e4 contains only rook moves", () => {
        const movesAlgebraic = genMoves(soloRook);
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e1", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e2", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e6", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e7", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "e8", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g4", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h4", enPassant: false, castle: false });

        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "b1", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "c2", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "d3", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f5", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "g6", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "h7", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "a8", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "a8", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "b7", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "c6", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "d5", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f3", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "g2", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "h1", enPassant: false, castle: false });
    });

    const soloBishop = {...eightByEightConfig};
    soloBishop.startingPosition = "8/8/8/8/4B3/8/8/8 w KQkq - 0 1";
    test("8x8: solo bishop on e4 contains only bishop moves", () => {
        const movesAlgebraic = genMoves(soloBishop);
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e1", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e2", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e3", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e5", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e6", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e7", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "e8", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "a4", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "b4", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "c4", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "d4", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "f4", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "g4", enPassant: false, castle: false });
        expect(movesAlgebraic).not.toContainEqual({ from: "e4", to: "h4", enPassant: false, castle: false });

        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b1", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c2", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g6", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h7", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "a8", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "b7", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "c6", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "d5", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "f3", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "g2", enPassant: false, castle: false });
        expect(movesAlgebraic).toContainEqual({ from: "e4", to: "h1", enPassant: false, castle: false });
    });

    const castlingWhiteAllowed = {...eightByEightConfig};
    castlingWhiteAllowed.startingPosition = "8/8/8/8/8/8/8/R3K2R w KQ - 0 1";
    test("8x8: Castling White: Allowed", () => {
        const movesAlgebraic = genMoves(castlingWhiteAllowed);
        expect(movesAlgebraic).toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "g1", enPassant: false, castle: false});
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "c1", enPassant: false, castle: false});
    });

    const castlingWhiteNotAllowed = {...eightByEightConfig};
    castlingWhiteNotAllowed.startingPosition = "8/8/8/8/8/8/8/R3K2R w - - 0 1";
    test("8x8: Castling White: Not Allowed", () => {
        const movesAlgebraic = genMoves(castlingWhiteNotAllowed);
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
    });

    const castlingWhiteBothObstacle = {...eightByEightConfig};
    castlingWhiteBothObstacle.startingPosition = "8/8/8/8/8/8/8/RP2K1PR w KQ - 0 1";
    test("8x8: Castling White: Both Blocked", () => {
        const movesAlgebraic = genMoves(castlingWhiteBothObstacle);
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
    });

    const castlingWhiteQueenObstacle = {...eightByEightConfig};
    castlingWhiteQueenObstacle.startingPosition = "8/8/8/8/8/8/8/RP2K2R w KQ - 0 1";
    test("8x8: Castling White: Queen-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingWhiteQueenObstacle);
        expect(movesAlgebraic).toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
    });

    const castlingWhiteKingObstacle = {...eightByEightConfig};
    castlingWhiteKingObstacle.startingPosition = "8/8/8/8/8/8/8/R3K1PR w KQ - 0 1";
    test("8x8: Castling White: King-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingWhiteKingObstacle);
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
    });

    const castlingWhiteKingAttacked = {...eightByEightConfig};
    castlingWhiteKingAttacked.startingPosition = "4q3/8/8/8/8/8/8/R3K2R w KQ - 0 1";
    test("8x8: Castling White: King in check", () => {
        const movesAlgebraic = genMoves(castlingWhiteKingAttacked);
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
    });

    const castlingWhiteKingSideAttacked = {...eightByEightConfig};
    castlingWhiteKingSideAttacked.startingPosition = "5q2/8/8/8/8/8/8/R3K2R w KQ - 0 1";
    test("8x8: Castling White: King-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingWhiteKingSideAttacked);
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
    });

    const castlingWhiteQueenSideAttacked = {...eightByEightConfig};
    castlingWhiteQueenSideAttacked.startingPosition = "3q4/8/8/8/8/8/8/R3K2R w KQ - 0 1";
    test("8x8: Castling White: Queen-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingWhiteQueenSideAttacked);
        expect(movesAlgebraic).toContainEqual({from: "e1", to: "g1", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e1", to: "c1", enPassant: false, castle: true});
    });

    const castlingBlackAllowed = {...eightByEightConfig};
    castlingBlackAllowed.startingPosition = "r3k2r/8/8/8/8/8/8/8 b kq - 0 1";
    test("8x8: Castling Black: Allowed", () => {
        const movesAlgebraic = genMoves(castlingBlackAllowed);
        expect(movesAlgebraic).toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "g8", enPassant: false, castle: false});
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "c8", enPassant: false, castle: false});
    });

    const castlingBlackNotAllowed = {...eightByEightConfig};
    castlingBlackNotAllowed.startingPosition = "r3k2r/8/8/8/8/8/8/8 b - - 0 1";
    test("8x8: Castling Black: Not Allowed", () => {
        const movesAlgebraic = genMoves(castlingBlackNotAllowed);
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
    });

    const castlingBlackBothObstacle = {...eightByEightConfig};
    castlingBlackBothObstacle.startingPosition = "rp2k1pr/8/8/8/8/8/8/8 b kq - 0 1";
    test("8x8: Castling Black: Both Blocked", () => {
        const movesAlgebraic = genMoves(castlingBlackBothObstacle);
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
    });

    const castlingBlackQueenObstacle = {...eightByEightConfig};
    castlingBlackQueenObstacle.startingPosition = "rp2k2r/8/8/8/8/8/8/8 b kq - 0 1";
    test("8x8: Castling Black: Queen-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingBlackQueenObstacle);
        expect(movesAlgebraic).toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
    });

    const castlingBlackKingObstacle = {...eightByEightConfig};
    castlingBlackKingObstacle.startingPosition = "r3k1pr/8/8/8/8/8/8/8 b kq - 0 1";
    test("8x8: Castling Black: King-Side blocked", () => {
        const movesAlgebraic = genMoves(castlingBlackKingObstacle);
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
    });

    const castlingBlackKingAttacked = {...eightByEightConfig};
    castlingBlackKingAttacked.startingPosition = "r3k2r/8/8/8/8/8/8/4Q3 b kq - 0 1";
    test("8x8: Castling Black: King in check", () => {
        const movesAlgebraic = genMoves(castlingBlackKingAttacked);
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
    });

    const castlingBlackKingSideAttacked = {...eightByEightConfig};
    castlingBlackKingSideAttacked.startingPosition = "r3k2r/8/8/8/8/8/8/5Q2 b kq - 0 1";
    test("8x8: Castling Black: King-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingBlackKingSideAttacked);
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
    });

    const castlingBlackQueenSideAttacked = {...eightByEightConfig};
    castlingBlackQueenSideAttacked.startingPosition = "r3k2r/8/8/8/8/8/8/3Q4 b kq - 0 1";
    test("8x8: Castling Black: Queen-Side castle into check impossible", () => {
        const movesAlgebraic = genMoves(castlingBlackQueenSideAttacked);
        expect(movesAlgebraic).toContainEqual({from: "e8", to: "g8", enPassant: false, castle: true});
        expect(movesAlgebraic).not.toContainEqual({from: "e8", to: "c8", enPassant: false, castle: true});
    });

    const soloQueenBlackToMove = {...eightByEightConfig};
    soloQueenBlackToMove.startingPosition = "8/8/8/8/4Q3/8/8/8 b - - 0 1"
    test("8x8: Is Square being attacked by queen on e4", () => {
        const state: GameState = createStateFromConfig(soloQueenBlackToMove);

        const isAttackedMatrix = [
            0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 1, 0, 1, 0,
            0, 0, 0, 1, 1, 1, 0, 0,
            1, 1, 1, 1, 0, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 0, 0,
            0, 0, 1, 0, 1, 0, 1, 0,
            0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 0, 0
        ]

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloRookBlackToMove = {...eightByEightConfig};
    soloRookBlackToMove.startingPosition = "8/8/8/8/4R3/8/8/8 b - - 0 1"
    test("8x8: Is Square being attacked by rook on e4", () => {
        const state: GameState = createStateFromConfig(soloRookBlackToMove);

        const isAttackedMatrix = [
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
            1, 1, 1, 1, 0, 1, 1, 1,
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0
        ]

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloBishopBlackToMove = {...eightByEightConfig};
    soloBishopBlackToMove.startingPosition = "8/8/8/8/4B3/8/8/8 b - - 0 1"
    test("8x8: Is Square being attacked by bishop on e4", () => {
        const state: GameState = createStateFromConfig(soloBishopBlackToMove);

        const isAttackedMatrix = [
            0, 1, 0, 0, 0, 0, 0, 1,
            0, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 0, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 1, 0, 0,
            0, 0, 1, 0, 0, 0, 1, 0,
            0, 1, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0,
        ]

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloKnightBlackToMove = {...eightByEightConfig};
    soloKnightBlackToMove.startingPosition = "8/8/8/8/4N3/8/8/8 b - - 0 1"
    test("8x8: Is Square being attacked by knight on e4", () => {
        const state: GameState = createStateFromConfig(soloKnightBlackToMove);

        const isAttackedMatrix = [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 1, 0, 0,
            0, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 0, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
        ]

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloPawnBlackToMove = {...eightByEightConfig};
    soloPawnBlackToMove.startingPosition = "8/8/8/8/4P3/8/8/8 b - - 0 1"
    test("8x8: Is Square being attacked by white pawn on e4", () => {
        const state: GameState = createStateFromConfig(soloPawnBlackToMove);

        const isAttackedMatrix = [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
        ]

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });

    const soloPawnWhiteToMove = {...eightByEightConfig};
    soloPawnWhiteToMove.startingPosition = "8/8/8/8/4p3/8/8/8 w - - 0 1"
    test("8x8: Is Square being attacked by black pawn on e4", () => {
        const state: GameState = createStateFromConfig(soloPawnWhiteToMove);

        const isAttackedMatrix = [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
        ]

        for (let i = 0; i < isAttackedMatrix.length; i++) {
            expect(isSquareAttacked(state, i)).toBe(!!isAttackedMatrix[i]);
        }
    });
});
