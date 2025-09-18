import { assert } from "console";
import { Board, BoardDimensions, CASTLE_MASK, Color, GameState, Piece, Square } from "./types";

/**
 * Converts algebraic notation into an array index for the position in the board array.
 * @param {BoardDimensions} boardDimensions Dimensions of the board (e.g. a9 or j1 are possible in a 9x9)
 * @param {string} notation Algebraic notation of the position on the board (e.g. a1, h8, f10, g15)
 * @returns {number} A number indicating the index of the array the algebraic notation is referencing
 */
export function algebraicToIndex(boardDimensions: BoardDimensions, notation: string): number {
    /*
        For a normal 8x8 chess board:
        8 56 57 58 59 60 61 62 63
        7 48 49 50 51 52 53 54 55
        6 40 41 42 43 44 45 46 47
        5 32 33 34 35 36 37 38 39
        4 24 25 26 27 28 29 30 31
        3 16 17 18 19 20 21 22 23
        2 8  9  10 11 12 13 14 15
        1 0  1  2  3  4  5  6  7
          a  b  c  d  e  f  g  h
    */

    // "-" happens if en passant string is parsed with this function and there is no en passant possible.
    if (notation === "-") {
        return -1;
    }

    if (notation.length < 2) {
        console.error(`Notation ${notation} doesn't have at least 2 characters.`);
        return -1;
    }

    const col: number = notation.charCodeAt(0) - 97; // 97 = 'a'
    const row: number = Number(notation.substring(1)) - 1; // The 1 in `a1` parses to array index 0

    return row * boardDimensions.width + col;
}

/**
 * Converts array index into algebraic notation.
 * @param {BoardDimensions} boardDimensions Dimensions of the board (e.g. a9 or j1 are possible in a 9x9)
 * @param {number} index Array index of the board (e.g. 0 for a8, 63 for h1)
 * @returns {string} Algebraic notation of the array index
 */
export function indexToAlgebraic(boardDimensions: BoardDimensions, index: number): string {
    let algebraic = "";

    const col: number = getFile(boardDimensions, index);
    algebraic += String.fromCharCode(97 + col);

    const row: number = getRank(boardDimensions, index) + 1;
    algebraic += `${row}`;

    return algebraic;
}

/**
 * This function calculates the new array index based on the movement patterns provided by the piece.
 *
 * A `rowOffset` of 1 means that we walk down the ranks (towards rank 1).
 * A `rowOffset` of -1 means that we walk up the ranks (towards rank maximum (8 on 8x8)).
 * A `fileOffset` of 1 means that we walk up the files (towards file maximum ('h' on 8x8)).
 * A `fileOffset` of -1 means that we walk up the files (towards file 'a').
 *
 * @param boardDimensions Dimensions of the board.
 * @param currentIndex The current index from where the calculation will take place
 * @param rankOffset The amount of ranks the current index should be offset by.
 * @param fileOffset The amount of files the current index should be offset by.
 * @returns the new index in the board array. `null` if out of bounds.
 */
export function calculateIndex(
    boardDimensions: BoardDimensions,
    currentIndex: number,
    fileOffset: number,
    rankOffset: number
): number | null {
    const [file, rank] = get2D(boardDimensions, currentIndex);

    const targetFile = file + fileOffset;
    const targetRank = rank + rankOffset;

    if (targetFile < 0 || targetFile >= boardDimensions.width) {
        return null;
    }
    if (targetRank < 0 || targetRank >= boardDimensions.height) {
        return null;
    }

    return currentIndex + fileOffset + rankOffset * boardDimensions.width;
}

export function getRank(boardDimensions: BoardDimensions, index: number): number {
    return Math.floor(index / boardDimensions.width);
}

export function getFile(boardDimensions: BoardDimensions, index: number): number {
    return index % boardDimensions.width;
}

/**
 * Converts the 1D representation of the board into a 2D representation.
 * Useful for movement generation and calculation of out of bounds moves.
 * 
 * Example for 8x8 board:
 * ```
 * 0 (a1) = [0, 0]
 * 1 (a2) = [0, 1]
 * 7 (h1) = [0, 7]
 * 56 (a8) = [7, 0]
 * 63 (h8) = [7, 7]
 * ```
 * @param boardDimensions 
 * @param index 
 * @returns a 2D representation of the 1D board array
 */
export function get2D(boardDimensions: BoardDimensions, index: number): [number, number] {
    return [getFile(boardDimensions, index), getRank(boardDimensions, index)];
}

export function getOppositeColor(color: Color): Color {
    return color === "W" ? "B" : "W";
}

export function isWhitesTurn(state: GameState): boolean {
    return state.sideToMove === "W";
}

export function isCastlingAllowed(castlingRights: number, color: Color, side: "K" | "Q") {
    const mask = CASTLE_MASK[color][side];
    return (castlingRights & mask) !== 0;
}

/**
 * Converts the board into a displayable format for the console. For debugging purposes only.
 * @param {BoardDimensions} boardDimensions Dimensions of the board (e.g. a9 or j1 are possible in a 9x9)
 * @param {Board} board Actual board with all the pieces.
 * @returns {string} Representation of the board as a string. Similar to a FEN, just with the empty squares replaced with a dot ('.').
 */
export function boardToString(state: GameState): string {
    const width = state.config.boardDimensions.width;
    const height = state.config.boardDimensions.height;

    // output
    let rows: string[] = [];

    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        let row = "";
        for (let fileIndex = 0; fileIndex < width; fileIndex++) {
            const index = rowIndex * width + fileIndex;
            const currentSquare = state.board[index];
            if (!currentSquare) {
                row += ".";
            } else {
                const symbolOfCurrentSquare = currentSquare.piece.symbol;
                row +=
                    currentSquare.color === "W"
                        ? symbolOfCurrentSquare.toUpperCase()
                        : symbolOfCurrentSquare.toLowerCase();
            }
        }
        rows = [row, ...rows];
    }

    return rows.join("\n");
}

export function areArraysEqual(a: number[], b: number[]): boolean {
    return JSON.stringify(Array.from(a).sort()) == JSON.stringify(Array.from(b).sort());
}