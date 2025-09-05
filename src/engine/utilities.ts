import { assert } from "console";
import { BoardDimensions } from "./types";

export function algebraicToIndex(boardDimensions: BoardDimensions, notation: string): number {
    // a = first column (0 + row)
    // b = second column (1 * boardWidth + row)
    // c = third column (2 * boardWidth + row)
    //
    // 1 = first row (col + boardHeight-1)
    // 2 = second row (col + 1 * (boardHeight-1))
    // 3 = second row (col + 2 * (boardHeight-1))
    assert(
        notation?.length === 2,
        `Failed to parse ${notation} into an array index for board position`
    );

    const col: number = notation.charCodeAt(0) - 97; // 97 = 'a'
    const row: number = Number(notation.charAt(1)) - 1; // The 1 in `a1` parses to array index 0

    return col + boardDimensions.height - row;
}
