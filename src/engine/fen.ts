import assert from "assert";
import { GameConfig, GameConfigSchema, Square, State, Piece, Color } from "./types";
import gameConfigJson from "./game-config.json";
import { algebraicToIndex } from "./utilities";

// board stm castlingRights possibleEnPassant halfMove fullMove
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

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
    const boardLength: number = boardStr.split("/").length;
    const board: Square[] = [];

    const isDigit = new RegExp("/^[1-9]{1,3}$/g");
    for (let i = 0; i < boardStr.length; i++) {
        const character = boardStr[i];
        if (isDigit.test(character)) {
            const amountFillEmpty: number = parseInt(character);
            assert(
                i + amountFillEmpty < boardWidth,
                `${baseErrorMessage} Amount to fill empty squares with exceeds the board width!`
            );
            for (let j = 0; j < amountFillEmpty; j++) {
                board[i] = { piece: null, color: null };
                i++;
            }
        } else if (character === "/") {
            continue;
        } else {
            board[i] = squareFromFENCharacter(character)
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

    assert(enPassantStr === "-" || enPassantStr.length === 2), `${baseErrorMessage} enPassantStr isn't '-' or doesn't have 2 characters.`);
    let enPassant: number = -1;
    if (enPassantStr !== "-") {
        enPassant = algebraicToIndex({ width: 8, height: 8 }, enPassantStr);
    }

    return {
        board,
        sideToMove,
        castlingRights,
        enPassant,
    }
}

function isUppercase(s: string): boolean {
    const isUppercaseRegEx = new RegExp("/^[A-Z]$/g");
    return isUppercaseRegEx.test(s);
}

function isLowercase(s: string): boolean {
    const isLowercaseRegEx = new RegExp("/^[a-z]$/g");
    return isLowercaseRegEx.test(s);
}

function squareFromFENCharacter(pieceStr: string): Square {
    const foundPiece: Piece | undefined = gameConfig.pieces.find(value => value.symbol === pieceStr);
    assert(!!foundPiece, `${baseErrorMessage} Piece with symbol '${pieceStr}' could not be found in the game config. Available symbols are: ${gameConfig.pieces.map(p => p.symbol)}`);

    return {
        piece: foundPiece,
        color: isLowercase(pieceStr) ? "B" : "W",
    };
}