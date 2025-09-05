import assert from "assert";
import { GameConfig, GameConfigSchema, Square, State, Piece, Color } from "./types";
import gameConfigJson from "./game-config.json";

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

    let castlingRights = 0; // happens if the string in the FEN is '-'
    for (let i = 0; i < castlingRightsStr.length; i++) {
        const character = castlingRightsStr[i];
        if (character === "K") {
            castlingRights += 8;
        } else if (character === "Q") {
            castlingRights += 4;
        } else if (character === "k") {
            castlingRights += 2;
        } else if (character === "q") {
            castlingRights += 1;
        }
    }

    const enPassant

    return {
        board,
        sideToMove,
        castlingRights,
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