import assert from "assert";
import {
    GameConfig,
    GameConfigSchema,
    Square,
    State,
    Piece,
    Color,
    Board,
} from "./types";
import gameConfigJson from "./game-config.json";
import { algebraicToIndex } from "./utilities";

const gameConfig: GameConfig = GameConfigSchema.parse(gameConfigJson);
const baseErrorMessage = "Could not parse FEN:";

export function fromFEN(fen: String): State {
    assert(fen?.length > 0, "FEN could not be parsed because it's empty.");

    const [
        boardStr,
        sideToMoveStr,
        castlingRightsStr,
        enPassantStr,
        halfMoveStr,
        fullMoveStr,
    ] = fen.split(" ");

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
        boardWidth === gameConfig.board.width,
        `${baseErrorMessage} board width (${boardWidth}) doesn't match the config (${gameConfig.board.width}).`
    );
    assert(
        boardHeight === gameConfig.board.height,
        `${baseErrorMessage} board height (${boardHeight}) doesn't match the config (${gameConfig.board.height}).`
    );

    const board: Board = [];

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
            board[currentBoardIndex++] = squareFromFENCharacter(character);
        }
    }

    const sideToMove: Color = sideToMoveStr === "w" ? "W" : "B";

    // 0 = no; 1 = yes
    // 0bX000 = White Kingside
    // 0b0X00 = White Queenside
    // 0b00X0 = Black Kingside
    // 0b000X = Black Queenside
    let castlingRights = 0; // happens if the string in the FEN is '-'
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

    assert(
        enPassantStr === "-" || enPassantStr.length === 2,
        `${baseErrorMessage} enPassantStr isn't '-' or doesn't have 2 characters.`
    );
    let enPassant: number = -1;
    if (enPassantStr !== "-") {
        enPassant = algebraicToIndex({ width: 8, height: 8 }, enPassantStr);
    }

    const halfMove: number = Number(halfMoveStr);
    const fullMove: number = Number(fullMoveStr);

    return {
        board,
        sideToMove,
        castlingRights,
        enPassant,
        halfMove,
        fullMove,
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

function squareFromFENCharacter(pieceStr: string): Square {
    const foundPiece: Piece | undefined = gameConfig.pieces.find(
        (value) => value.symbol === pieceStr.toLowerCase()
    );
    assert(
        !!foundPiece,
        `${baseErrorMessage} Piece with symbol '${pieceStr}' could not be found in the game config. Available symbols are: ${gameConfig.pieces.map(
            (p) => p.symbol
        )}`
    );

    return {
        piece: foundPiece,
        color: isLowercase(pieceStr) ? "B" : "W",
    };
}