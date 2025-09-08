import assert from "assert";
import { GameConfig, Square, GameState, Piece, Color, Board } from "./types";
import { algebraicToIndex } from "./utilities";

const baseErrorMessage = "Could not parse FEN:";

export function createStateFromConfig(config: GameConfig): GameState {
    const fen = config?.startingPosition;
    assert(
        fen?.length > 0,
        "FEN could not be parsed because it's empty or doesn't exist."
    );

    const [
        boardStr,
        sideToMoveStr,
        castlingRightsStr,
        enPassantStr,
        halfMoveStr,
        fullMoveStr,
    ] = fen.split(" ");

    // ASSERTIONS

    assert(
        boardStr?.length > 0,
        `${baseErrorMessage} boardString empty or missing.`
    );
    assert(
        sideToMoveStr?.length > 0,
        `${baseErrorMessage} sideToMoveStr empty or missing.`
    );
    assert(
        castlingRightsStr?.length > 0,
        `${baseErrorMessage} castlingRightsStr empty or missing.`
    );
    assert(
        enPassantStr?.length > 0,
        `${baseErrorMessage} enPassantStr empty or missing.`
    );
    assert(
        halfMoveStr?.length > 0,
        `${baseErrorMessage} halfMoveStr empty or missing.`
    );
    assert(
        fullMoveStr?.length > 0,
        `${baseErrorMessage} fullMoveStr empty or missing.`
    );

    const boardWidth: number = boardStr.split("/")[0].length;
    const boardHeight: number = boardStr.split("/").length;
    assert(
        boardWidth === config.board.width,
        `${baseErrorMessage} board width (${boardWidth}) doesn't match the config (${config.board.width}).`
    );
    assert(
        boardHeight === config.board.height,
        `${baseErrorMessage} board height (${boardHeight}) doesn't match the config (${config.board.height}).`
    );

    const board: Board = [];

    // ACTUAL BOARD ARRAY INIT

    const isDigit = new RegExp("[1-9]{1,3}");
    let currentBoardIndex = 0;
    for (let i = 0; i < boardStr.length; i++) {
        const character = boardStr[i];
        if (isDigit.test(character)) {
            const amountFillEmpty: number = parseInt(character);
            for (let j = 0; j < amountFillEmpty; j++) {
                board[currentBoardIndex++] = null;
            }
        } else if (character === "/") {
            continue;
        } else {
            board[currentBoardIndex++] = squareFromFENCharacter(config, character);
        }
    }

    // SIDE TO MOVE

    const sideToMove: Color = sideToMoveStr === "w" ? "W" : "B";

    // CASTLING RIGHTS

    // 0 = no; 1 = yes
    // 0bX000 = White Kingside
    // 0b0X00 = White Queenside
    // 0b00X0 = Black Kingside
    // 0b000X = Black Queenside
    let castlingRights = 0; // value of '0' stays if the string in the FEN is '-'
    for (let i = 0; i < castlingRightsStr.length; i++) {
        const character = castlingRightsStr[i];
        if (character === "-") {
            break;
        } else if (character === "K") {
            castlingRights += 0b1000;
        } else if (character === "Q") {
            castlingRights += 0b0100;
        } else if (character === "k") {
            castlingRights += 0b0010;
        } else if (character === "q") {
            castlingRights += 0b0001;
        }
    }

    // EN PASSANT

    assert(
        enPassantStr === "-" || enPassantStr.length >= 2,
        `${baseErrorMessage} enPassantStr isn't '-' or doesn't have at least 2 characters.`
    );
    let enPassant: number = -1;
    if (enPassantStr !== "-") {
        enPassant = algebraicToIndex(config.board, enPassantStr);
    }

    // FULLMOVE & HALFMOVE COUNTERS

    const halfMove: number = Number(halfMoveStr);
    const fullMove: number = Number(fullMoveStr);

    return {
        board: board,
        boardDimensions: {
            width: config.board.width,
            height: config.board.height,
        },
        sideToMove: sideToMove,
        castlingRights: castlingRights,
        enPassant: enPassant,
        halfMove: halfMove,
        fullMove: fullMove,
    };
}

export function createFENFromState(state: GameState) {
    let fen = "";
    let emptySquaresCounter = 0;
    const boardWidth = state.boardDimensions.width;
    const boardHeight = state.boardDimensions.height;

    for (let i = 0; i < state.board.length; i++) {
        if (i >= boardWidth) {
            fen += "/";
            continue;
        }

        const currentSquare = state.board[i];
        if (!currentSquare) {
            emptySquaresCounter++;
            continue;
        }

        if (!!currentSquare) {
            if (emptySquaresCounter > 0) {
                fen += emptySquaresCounter;
                emptySquaresCounter = 0;
            }
            const symbolOfPieceOnSquare =
                currentSquare.color === "W"
                    ? currentSquare.piece.symbol.toUpperCase()
                    : currentSquare.piece.symbol.toLowerCase();
            fen += symbolOfPieceOnSquare;
        }
    }

    fen += " ";

    fen += state.sideToMove.toLowerCase();

    fen += " ";

    let castlingRights: number = state.castlingRights;
    fen += castlingRights & 0b1000 ? "K" : "";
    fen += castlingRights & 0b0100 ? "Q" : "";
    fen += castlingRights & 0b0010 ? "k" : "";
    fen += castlingRights & 0b0001 ? "q" : "";

    fen += " ";


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
    const foundPiece: Piece | undefined = config.pieces.find(
        (value) => value.symbol === pieceStr.toLowerCase()
    );
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
