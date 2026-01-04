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

export const ColorSchema = z.enum(["W", "B"]);

export const EnPassantSchema = z.object({
    captureIndex: z.number(),
    deleteIndex: z.number()
});

export const BoardDimensionsSchema = z.object({
    width: z.number(),
    height: z.number(),
});

export const CastlingDefinitionSchema = z.object({
    id: z.string(),
    color: ColorSchema,

    rookSymbol: z.string(),
    royalSymbol: z.string(),

    rookFrom: z.number(),
    rookTo: z.number(),
    royalFrom: z.number(),
    royalTo: z.number(),

    royalPath: z.array(z.number()),
});

export const CastlingInfoSchema = z.object({
    available: z.array(z.string()),
    routes: z.array(CastlingDefinitionSchema),
});

export const SquareSchema = z.object({
    piece: PieceSchema,
    color: ColorSchema,
});

export const BoardSchema = z.array(z.union([SquareSchema, z.null()]))

export const GameConfigSchema = z.object({
    boardDimensions: BoardDimensionsSchema,
    pieces: z.array(PieceSchema),
    startingPosition: z.string(),
    sideToMove: z.string(),
    castling: z.optional(CastlingInfoSchema),
    enPassant: z.optional(EnPassantSchema),
    halfMove: z.number(),
    fullMove: z.number(),
});


export const GameStateSchema = z.object({
    board: BoardSchema,
    sideToMove: ColorSchema,
    enPassant: z.optional(EnPassantSchema),
    castling: z.array(z.string()),
    halfMove: z.number(),
    fullMove: z.number(),
    config: GameConfigSchema,
});

export const MoveSchema = z.object({
    from: z.number(),
    to: z.number(),
    castle: z.optional(z.string()),
    enPassant: z.optional(EnPassantSchema),
    isEnPassantCapture: z.optional(z.boolean()),
    promotion: z.optional(PieceSchema),
});

export const SquareDeltaSchema = z.object({
    index: z.number(),
    before: z.nullable(SquareSchema),
    after: z.nullable(SquareSchema),
});

export const UndoSchema = z.object({
    deltas: z.array(SquareDeltaSchema),
    prevSideToMove: ColorSchema,
    prevCastlingRights: z.array(z.string()),
    prevEnPassant: z.optional(EnPassantSchema),
    prevHalfMove: z.number(),
    prevFullMove: z.number(),
});

export type SquareDelta = z.infer<typeof SquareDeltaSchema>;

export type Undo = z.infer<typeof UndoSchema>;

export type Move = z.infer<typeof MoveSchema>;

export type Piece = z.infer<typeof PieceSchema>;

export type BoardDimensions = z.infer<typeof BoardDimensionsSchema>; 

export type Color = z.infer<typeof ColorSchema>;

export type Square = z.infer<typeof SquareSchema>;

export type Board = z.infer<typeof BoardSchema>;

export type CastlingDefinition = z.infer<typeof CastlingDefinitionSchema>;

export type EnPassant = z.infer<typeof EnPassantSchema>;

export type GameConfig = z.infer<typeof GameConfigSchema>;

export type GameState = z.infer<typeof GameStateSchema>;