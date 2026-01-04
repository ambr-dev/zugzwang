import assert from "assert";
import { Board, GameConfig, GameState, Piece, Square } from "./types";

const baseErrorMessage = "Could not parse config:";

export function createStateFromConfig(config: GameConfig): GameState {
    // ASSERTIONS
    assert(config.startingPosition?.length > 0, `${baseErrorMessage} starting position string empty or missing.`);

    const boardWidth: number = getBoardWidth(config.startingPosition.split("/")[0]);
    const boardHeight: number = config.startingPosition.split("/").length;
    assert(
        boardWidth === config.boardDimensions.width,
        `${baseErrorMessage} board width (${boardWidth}) doesn't match the config (${config.boardDimensions.width}).`
    );
    assert(
        boardHeight === config.boardDimensions.height,
        `${baseErrorMessage} board height (${boardHeight}) doesn't match the config (${config.boardDimensions.height}).`
    );

    if (config.castling) {
        for (let castlingRuleId of config.castling.available) {
            assert(
                config.castling.routes.filter((r) => r.id === castlingRuleId).length >= 0,
                `${baseErrorMessage} castling rule id ${castlingRuleId} doesn't exist in config castling rule list.`
            );
        }
    }

    const board = parseBoard(config.startingPosition, config);

    return {
        board: board,
        sideToMove: config.sideToMove === "W" ? "W" : "B",
        castling: config.castling?.available ?? [],
        enPassant: config.enPassant,
        halfMove: config.halfMove,
        fullMove: config.fullMove,
        config,
    };
}

function isUppercase(s: string): boolean {
    const isUppercaseRegEx = new RegExp("[A-Z]");
    return isUppercaseRegEx.test(s);
}

function isLowercase(s: string): boolean {
    const isLowercaseRegEx = new RegExp("[a-z]");
    return isLowercaseRegEx.test(s);
}

function squareFromFENCharacter(config: GameConfig, pieceStr: string): Square {
    const foundPiece: Piece | undefined = config.pieces.find((value) => value.symbol === pieceStr.toLowerCase());
    assert(
        !!foundPiece,
        `${baseErrorMessage} Piece with symbol '${pieceStr}' could not be found in the game config. Available symbols are: ${config.pieces.map(
            (p) => p.symbol
        )}`
    );

    return {
        piece: foundPiece,
        color: isLowercase(pieceStr) ? "B" : "W",
    };
}

function getBoardWidth(row: string): number {
    let width = 0;
    const isDigit = new RegExp("[1-9]+");
    for (let i = 0; i < row.length; i++) {
        const character = row[i];
        if (isDigit.test(character)) {
            width += Number(character);
        } else {
            width++;
        }
    }
    return width;
}

function parseBoard(boardStr: string, config: GameConfig): Board {
    const board: Board = [];
    const isDigit = new RegExp("[1-9]+");
    const rows: string[] = boardStr.split("/");

    let currentBoardIndex = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
        const row: string = rows[i];
        for (let j = 0; j < row.length; j++) {
            const character: string = row[j];
            if (isDigit.test(character)) {
                const amountFillEmpty: number = parseInt(character);
                for (let k = 0; k < amountFillEmpty; k++) {
                    board[currentBoardIndex++] = null;
                }
            } else {
                board[currentBoardIndex++] = squareFromFENCharacter(config, character);
            }
        }
    }

    return board;
}
