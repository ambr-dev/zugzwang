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

export interface State {
    board: Square[];
    sideToMove: Color;
    enPassant: number;
    castlingRights: number;
    halfMove: number;
    fullMove: number;
}

export interface Square {
    piece: Piece | null;
    color: Color | null;
}

export interface Move {
    from: Square;
    to: Square;
    castle: boolean;
    enPassant: boolean;
    promotion?: Piece;
}

export const GameConfigSchema = z.object({
    board: z.object({
        width: z.number(),
        height: z.number(),
    }),
    pieces: z.array(PieceSchema),
    startingPosition: z.string(),
});

export interface GameConfig {
    board: BoardDimensions;
    pieces: Piece[];
    startingPosition: string;
}
