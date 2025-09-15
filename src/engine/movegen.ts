import { assert } from "console";
import { Move, GameState, Piece, Square, Board } from "./types";
import {
    calculateIndex,
    getOppositeColor,
    getFileFromIndex,
    indexToAlgebraic,
    isWhitesTurn,
    getRankFromIndex,
} from "./utilities";

// export function legalMoves(state: State): Move[] {
// 	return [];
// }

export function pseudoMoves(state: GameState): Move[] {
    const boardDims = state.config.boardDimensions;
    const boardHeight = state.config.boardDimensions.height;
    const boardWidth = state.config.boardDimensions.width;

    let pseudoMoves: Move[] = [];
    for (let currentIndex = 0; currentIndex < state.board.length; currentIndex++) {
        const currentSquare = state.board[currentIndex];
        // Square is not occupied
        if (!currentSquare || isEnemy(state, currentIndex)) {
            continue;
        }
        const currentPiece: Piece | undefined = state.config.pieces.find((p) => p.symbol === currentSquare.piece.symbol);
        assert(
            !!currentPiece,
            `Couldn't generate pseudo moves: 
            Piece ${currentSquare.piece.symbol} (Color: ${currentSquare.color}) on 
            ${indexToAlgebraic(boardDims, currentIndex)} 
            (index ${currentIndex}) could not be found in the provided game config. 
            Possible piece symbols are: 
            ${state.config.pieces.map((configPiece) => configPiece.symbol).join(" ")}.`
        );

        if (!currentPiece) continue; // for ts to leave me alone because it doesn't count the assert.

        // --- PAWNS ---
        if (currentPiece.pawn) {
            // --- JUST GO FORWARD & PROMOTION ---
            assert(
                !!currentPiece.forward,
                `Couldn't generate pseudo moves: 
                Pawn on ${indexToAlgebraic(boardDims, currentIndex)} (index ${currentIndex})
                doesn't have a forward array (is it really a pawn?).`
            );

            const forwardOffsets: number[][] = currentPiece.forward!;
            for (let forwardOffset of forwardOffsets) {
                // Correct the direction
                // (in the config there's only one forward direction, regardless of color)
                forwardOffset = isWhitesTurn(state) ? forwardOffset.map((o) => -o) : forwardOffset;

                const targetIndex: number | null = calculateIndex(
                    boardDims,
                    currentIndex,
                    forwardOffset[0],
                    forwardOffset[1]
                );

                if (!targetIndex) continue; // OOB
                if (!!state.board[targetIndex]) continue; // Square is occupied

                // --- PROMOTION ---
                const targetRank: number = getRankFromIndex(state.config.boardDimensions, targetIndex);
                const promotionRank: number = isWhitesTurn(state) ? boardHeight : 1;

                if (targetRank === promotionRank) {
                    // For each piece that is not a pawn:
                    // Add a potential move to the pseudo moves list that promotes to that piece
                    for (const piece of state.config.pieces) {
                        if (piece.pawn === false) {
                            pseudoMoves.push({
                                from: currentIndex,
                                to: targetIndex,
                                enPassant: false,
                                castle: false,
                                promotion: piece,
                            });
                        }
                    }
                } else {
                    // No promotion, just forward move
                    pseudoMoves.push({
                        from: currentIndex,
                        to: targetIndex,
                        enPassant: false,
                        castle: false,
                    });
                }

                // --- DOUBLE STEP CONSIDERATION ---
                const isEligibleForDoubleStep =
                    getRankFromIndex(boardDims, currentIndex) ===
                    (isWhitesTurn(state) ? currentPiece.doubleStepRank! : boardHeight - (currentPiece.doubleStepRank! - 1));

                if (!isEligibleForDoubleStep) continue;

                const doubleForwardOffset = forwardOffset.map((o) => o * 2);
                console.log(`rank: ${getRankFromIndex(boardDims, currentIndex)}, file ${getFileFromIndex(boardDims,currentIndex)} ${doubleForwardOffset} ${currentIndex}`);
                const doubleForwardIndex = calculateIndex(
                    boardDims,
                    currentIndex,
                    doubleForwardOffset[0],
                    doubleForwardOffset[1]
                );

                if (!doubleForwardIndex) continue; // oob

                // --- DOUBLE STEP PROMOTION (yes, this is possible) ---
                const doubleTargetRank: number = getRankFromIndex(state.config.boardDimensions, targetIndex);
                if (doubleTargetRank === promotionRank) {
                    // For each piece that is not a pawn:
                    // Add a potential move to the pseudo moves list that promotes to that piece
                    for (const piece of state.config.pieces) {
                        if (piece.pawn === false) {
                            pseudoMoves.push({
                                from: currentIndex,
                                to: doubleForwardIndex,
                                enPassant: false,
                                castle: false,
                                promotion: piece,
                            });
                        }
                    }
                } else {
                    // No promotion, just double forward move
                    pseudoMoves.push({
                        from: currentIndex,
                        to: doubleForwardIndex,
                        enPassant: false,
                        castle: false,
                    });
                }
            }

            // --- CAPTURE ---
            assert(
                !!currentPiece.capture,
                `Coudln't generate pseudo moves: Pawn on ${indexToAlgebraic(boardDims, currentIndex)}
                (index ${currentIndex}) doesn't have a capture array (is it really a pawn?).`
            );
            const captureOffsets: number[][] = currentPiece.capture!;
            // for (const captureOffset of captureOffsets) {
            //     // Positive offset -> towards white
            //     // Negative offset -> towards black
            //     const rankOffset = isWhitesTurn(state) ? -captureOffset[0] : captureOffset[0];
            //     const fileOffset = captureOffset[1];
            //     const targetIndex: number | null = calculateIndex(boardDims, currentIndex, rankOffset, fileOffset);
            //     if (!targetIndex) continue; // OOB

            //     if (isEnemy(state, targetIndex)) {
            //         pseudoMoves.push({
            //             from: currentIndex,
            //             to: targetIndex,
            //             enPassant: false,
            //             castle: false,
            //         });
            //     }
            // }
        }

        // if (!!currentPiece.leaperOffsets) {
        //     for (const leaperOffset of currentPiece.leaperOffsets) {
        //         const targetIndex: number | null = calculateIndex(boardDims, currentIndex, leaperOffset[0], leaperOffset[1]);

        //         if (!targetIndex) continue; // OOB
        //         if (isAlly(state, targetIndex)) continue;

        //         pseudoMoves.push({
        //             from: currentIndex,
        //             to: targetIndex,
        //             castle: false,
        //             enPassant: false,
        //         });
        //     }
        // }

        // if (!!currentPiece.sliderDirections) {
        //     for (const sliderDirection of currentPiece.sliderDirections) {
        //         let pointer: number = currentIndex;
        //         let nextSquare: number | null = calculateIndex(
        //             boardDims,
        //             currentIndex,
        //             sliderDirection[0],
        //             sliderDirection[1]
        //         );
        //         // while not oob
        //         while (!!nextSquare) {
        //             if (isAlly(state, nextSquare)) {
        //                 break;
        //             }

        //             // ATP the square must be empty or an enemy,
        //             // in which case the move has to be added...
        //             pseudoMoves.push({
        //                 from: currentIndex,
        //                 to: nextSquare,
        //                 castle: false,
        //                 enPassant: false,
        //             });

        //             // ...but the raycast will end here if it's an enemy.
        //             if (isEnemy(state, nextSquare)) {
        //                 break;
        //             }

        //             nextSquare = calculateIndex(boardDims, nextSquare, sliderDirection[0], sliderDirection[1]);
        //         }
        //     }
        // }
    }
    return pseudoMoves;
}

function isEmpty(state: GameState, index: number): boolean {
    return !isOccupied(state, index);
}

function isOccupied(state: GameState, index: number): boolean {
    return !!state.board[index];
}

function isEnemy(state: GameState, index: number): boolean {
    return state.board[index]?.color === getOppositeColor(state.sideToMove);
}

function isAlly(state: GameState, index: number): boolean {
    return state.board[index]?.color === state.sideToMove;
}
