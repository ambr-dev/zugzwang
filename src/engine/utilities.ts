import { assert } from "console";
import { Board, BoardDimensions, Square } from "./types";

/**
 * Converts algebraic notation into an array index for the position in the board array.
 * @param {BoardDimensions} boardDimensions Dimensions of the board (e.g. a9 or j1 are possible in a 9x9)
 * @param {string} notation Algebraic notation of the position on the board (e.g. a1, h8, f10, g15)
 * @returns {number} A number indicating the index of the array the algebraic notation is referencing
 */
export function algebraicToIndex(
    boardDimensions: BoardDimensions,
    notation: string
): number {
    /*
        For a normal 8x8 chess board:
        8 0  1  2  3  4  5  6  7
        7 8  9  10 11 12 13 14 15
        6 16 17 18 19 20 21 22 23
        5 24 25 26 27 28 29 30 31
        4 32 33 34 35 36 37 38 39
        3 40 41 42 43 44 45 46 47
        2 48 49 50 51 52 53 54 55
        1 56 57 58 59 60 61 62 63
           a  b  c  d  e  f  g  h
    */

    if (notation === "-" || notation.length !== 2) {
        return -1;
    }

    if (notation.length !== 2) {
        console.error(
            `Notation ${notation} is '-' or doesn't have 2 characters.`
        );
        return -1;
    }

    const col: number = notation.charCodeAt(0) - 97; // 97 = 'a'
    const row: number = Number(notation[1]); // The 1 in `a1` parses to array index 0

    return (boardDimensions.height - row) * boardDimensions.width + col;
}

/**
 * Converts array index into algebraic notation.
 * @param {BoardDimensions} boardDimensions Dimensions of the board (e.g. a9 or j1 are possible in a 9x9)
 * @param {number} index Array index of the board (e.g. 0 for a8, 63 for h1)
 * @returns {string} Algebraic notation of the array index
 */
export function indexToAlgebraic(boardDimensions: BoardDimensions, index: number) {
    let algebraic = "";

    const col: number = index % boardDimensions.width;
    algebraic += String.fromCharCode(97 + col);

    const row: number = boardDimensions.height - Math.floor(index / boardDimensions.width);
    algebraic += `${row}`;

    return algebraic;
}

/**
 * Converts the board into a displayable format for the console. For debugging purposes only.
 * @param {BoardDimensions} boardDimensions Dimensions of the board (e.g. a9 or j1 are possible in a 9x9)
 * @param {Board} board Actual board with all the pieces.
 * @returns {string} Representation of the board as a string. Similar to a FEN, just with the empty squares replaced with a dot ('.').
 */
export function boardToString(boardDimensions: BoardDimensions, board: Board): string {
    const width = boardDimensions.width;
    const height = boardDimensions.height;

    // output
    let rows: string[] = [];

    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        let row = "";
        for (let fileIndex = 0; fileIndex < width; fileIndex++) {
            const index = rowIndex * width + fileIndex;
            const currentSquare = board[index];
            if (!currentSquare) {
                row += ".";
            } else {
                const symbolOfCurrentSquare = currentSquare.piece.symbol;
                row += currentSquare.color === "W" ? symbolOfCurrentSquare.toUpperCase() : symbolOfCurrentSquare.toLowerCase();
            }
        }
        rows.push(row);
    }

    return rows.join('\n');
}
