import * as z from "zod";

const PieceSchema = z.object({
    symbol: z.string(),
    royal: z.boolean().optional(),
    pawn: z.boolean().optional(),
    doubleStepRank: z.number().optional(),
    forward: z.array(z.array(z.number())).optional(),
    leaperOffsets: z.array(z.array(z.number())).optional(),
    sliderDirections: z.array(z.array(z.number())).optional(),
    capture: z.array(z.array(z.number())).optional(),
});

export interface Piece {
    symbol: string;
    royal?: boolean;

    pawn?: boolean;
    doubleStepRank?: number;
    forward?: number[][];

    leaperOffsets?: number[][];
    sliderDirections?: number[][];
    capture?: number[][];
}

export interface BoardDimensions {
    width: number;
    height: number;
}

export type Color = "W" | "B";

export interface GameState {
    board: Board;
    sideToMove: Color;
    enPassant: number;
    castlingRights: number;
    halfMove: number;
    fullMove: number;
    config: GameConfig;
}

// Bitmasks for castling
export const WK = 8, WQ = 4, BK = 2, BQ = 1 as const;
export const CASTLE_MASK = { W: { K: WK, Q: WQ }, B: { K: BK, Q: BQ } } as const;

export type Board = (Square | null)[]

export interface Square {
    piece: Piece;
    color: Color;
}

export interface Move {
    from: number;
    to: number;
    castle: boolean;
    enPassant: boolean;
    promotion?: Piece;
}

export const GameConfigSchema = z.object({
    boardDimensions: z.object({
        width: z.number(),
        height: z.number(),
    }),
    pieces: z.array(PieceSchema),
    startingPosition: z.string(),
});

export interface GameConfig {
    boardDimensions: BoardDimensions;
    pieces: Piece[];
    startingPosition: string;
}
