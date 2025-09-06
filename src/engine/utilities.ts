import { assert } from "console";
import { Board, BoardDimensions, Square } from "./types";

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

export function boardToString(boardDims: BoardDimensions, board: Board): string {
    const width = boardDims.width;
    const height = boardDims.height;

    let rows: string[] = [];

    for (let r = 0; r < height; r++) {
        let row = "";
        for (let f = 0; f < width; f++) {
            const idx = r * width + f;
            const sq = board[idx];
            if (!sq) {
                row += ".";
            } else {
                const sym = sq.piece.symbol;
                row += sq.color === "W" ? sym.toUpperCase() : sym.toLowerCase();
            }
        }
        rows.push(row);
    }

    return rows.join('\n');
}
