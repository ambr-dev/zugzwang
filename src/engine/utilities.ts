import { assert } from "console";
import { Board, BoardDimensions, Color, GameState, Piece, Square } from "./types";

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
export function indexToAlgebraic(boardDimensions: BoardDimensions, index: number) {
    let algebraic = "";

    const col: number = getFileFromIndex(boardDimensions, index);
    algebraic += String.fromCharCode(97 + col);

    const row: number = getRankFromIndex(boardDimensions, index) + 1;
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
    rankOffset: number,
    fileOffset: number
): number | null {
    const rank = getRankFromIndex(boardDimensions, currentIndex);
    const file = getFileFromIndex(boardDimensions, currentIndex);

    const targetRank = rank + rankOffset;
    const targetFile = file + fileOffset;

    if (targetRank <= 0 || targetRank > boardDimensions.height) {
        return null;
    }
    if (targetFile <= 0 || targetFile > boardDimensions.width) {
        return null;
    }

    return currentIndex + fileOffset + rankOffset * boardDimensions.width;
}

export function getRankFromIndex(boardDimensions: BoardDimensions, currentIndex: number): number {
    return Math.floor(currentIndex / boardDimensions.width);
}

export function getFileFromIndex(boardDimensions: BoardDimensions, currentIndex: number): number {
    return currentIndex % boardDimensions.width;
}

export function getOppositeColor(color: Color): Color {
    return color === "W" ? "B" : "W";
}

export function isWhitesTurn(state: GameState): boolean {
    return state.sideToMove === "W";
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