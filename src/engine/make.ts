import assert from "assert";
import { CastlingDefinitionSchema, GameState, Move, SquareDelta, Undo } from "./types";
import { getOppositeColor, indexToAlgebraic, isWhitesTurn } from "./utilities";
import { delayUntilRuntimeStage } from "next/dist/server/app-render/dynamic-rendering";
import { Stalemate } from "next/font/google";

export function make(state: GameState, move: Move): Undo {
    const sourceSquare = state.board[move.from];
    const targetSquare = state.board[move.to];
    let squareDeltas: SquareDelta[] = [];

    const prevSideToMove = state.sideToMove;
    const prevCastlingRights = [...state.castling];
    const prevEnPassant = state.enPassant;
    const prevHalfMove = state.halfMove;
    const prevFullMove = state.fullMove;

    assert(
        !!sourceSquare,
        `Couldn't make move: Piece doesn't exist on ${indexToAlgebraic(state.config.boardDimensions, move.from)}`
    );

    if (move.isEnPassantCapture) {
        if (!move.enPassant) {
            throw new Error("Move was marked as en passant but no data was provided!");
        }

        squareDeltas.push({
            index: move.enPassant.deleteIndex,
            before: state.board[move.enPassant.deleteIndex],
            after: null,
        });
        state.board[move.enPassant.deleteIndex] = null;
        // captureIndex is implied through `// Moving the piece`
    }

    state.enPassant = move.enPassant;

    state.fullMove = isWhitesTurn(state) ? state.fullMove : state.fullMove + 1;
    state.sideToMove = getOppositeColor(state.sideToMove);

    if (sourceSquare.piece?.pawn || !!targetSquare) {
        state.halfMove = 0;
    } else {
        state.halfMove++;
    }

    // Moving the piece
    if (move.castle) {
        const casDef = state.config.castling!.routes.find((r) => r.id === move.castle);
        if (!casDef) {
            throw new Error(`Couldn't find castling definition with id ${move.castle}!`);
        }

        squareDeltas = squareDeltas.concat(generateDelta(state, casDef.royalFrom, casDef.royalTo));
        squareDeltas = squareDeltas.concat(generateDelta(state, casDef.rookFrom, casDef.rookTo));

        state.board[casDef.royalTo] = state.board[casDef.royalFrom];
        state.board[casDef.rookTo] = state.board[casDef.rookFrom];

        state.board[casDef.royalFrom] = null;
        state.board[casDef.rookFrom] = null;

        // remove all castling rights from the color that just castled
        state.castling = state.castling.filter(
            (s) => state.config.castling?.routes.find((def) => def.id === s)?.color === getOppositeColor(casDef.color)
        );
    } else {
        squareDeltas = squareDeltas.concat(generateDelta(state, move.from, move.to));
        state.board[move.to] = state.board[move.from];
        state.board[move.from] = null;
    }

    const undo: Undo = {
        deltas: squareDeltas,
        prevSideToMove: prevSideToMove,
        prevCastlingRights: prevCastlingRights,
        ...(prevEnPassant && { prevEnPassant: { ...prevEnPassant } }),
        prevHalfMove: prevHalfMove,
        prevFullMove: prevFullMove,
    };
    return undo;
}

export function undo(state: GameState, undo: Undo): void {
    for (const delta of undo.deltas) {
        state.board[delta.index] = delta.before;
    }

    state.sideToMove = undo.prevSideToMove;
    state.castling = undo.prevCastlingRights;
    state.enPassant = undo.prevEnPassant;
    state.halfMove = undo.prevHalfMove;
    state.fullMove = undo.prevFullMove;
}

function generateDelta(state: GameState, from: number, to: number): SquareDelta[] {
    return [
        {
            index: from,
            before: state.board[from],
            after: null,
        },
        {
            index: to,
            before: state.board[to],
            after: state.board[from],
        },
    ];
}
