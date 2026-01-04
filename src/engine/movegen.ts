import { assert } from "console";
import { make, undo } from "./make";
import { CastlingDefinition, Color, GameState, Move, Piece } from "./types";
import {
    areArraysEqual,
    calculateIndex,
    getCastlingDefinition,
    getOppositeColor,
    getRank,
    indexToAlgebraic,
    isWhitesTurn,
} from "./utilities";

export function legalMoves(state: GameState): Move[] {
    let moves: Move[] = pseudoMoves(state);
    // after `make` the sideToMove changes, so store it beforehand
    const currentSideToMove = state.sideToMove;

    for (const currentMove of moves) {
        const undoMove = make(state, currentMove);

        const isAtLeastOneRoyalInCheck = (_state: GameState) => {
            for (let i = 0; i < _state.board.length; i++) {
                const square = _state.board[i];
                if (square === null || square.color !== currentSideToMove || !square.piece.royal) {
                    continue;
                }
                if (isSquareAttacked(_state, i, currentSideToMove)) {
                    return true;
                }
            }
            return false;
        };

        if (isAtLeastOneRoyalInCheck(state)) {
            moves = moves.filter((m) => JSON.stringify(m) !== JSON.stringify(currentMove));
        }

        // `make` is in-place, so undo move
        undo(state, undoMove);
    }

    return moves;
}

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
                forwardOffset = isWhitesTurn(state) ? forwardOffset : forwardOffset.map((o) => -o);

                const targetIndex: number | null = calculateIndex(
                    boardDims,
                    currentIndex,
                    forwardOffset[0],
                    forwardOffset[1]
                );

                if (targetIndex === null) continue; // OOB
                if (isOccupied(state, targetIndex)) continue; // no need to check promotion or double step

                // --- PROMOTION ---
                const targetRank: number = getRank(state.config.boardDimensions, targetIndex);
                const promotionRank: number = isWhitesTurn(state) ? boardHeight : 1;

                if (targetRank === promotionRank) {
                    // For each piece that is not a pawn:
                    // Add a potential move to the pseudo moves list that promotes to that piece
                    for (const piece of state.config.pieces) {
                        if (piece.pawn === false) {
                            pseudoMoves.push({
                                from: currentIndex,
                                to: targetIndex,
                                promotion: piece,
                            });
                        }
                    }
                } else {
                    // No promotion, just forward move
                    pseudoMoves.push({
                        from: currentIndex,
                        to: targetIndex,
                    });
                }

                // --- DOUBLE STEP CONSIDERATION ---
                const doubleStepRank = isWhitesTurn(state)
                    ? currentPiece.doubleStepRank! - 1
                    : boardHeight - currentPiece.doubleStepRank!;
                const isEligibleForDoubleStep = getRank(boardDims, currentIndex) === doubleStepRank;

                if (!isEligibleForDoubleStep) continue;

                const doubleForwardOffset = forwardOffset.map((o) => o * 2);
                const doubleForwardIndex = calculateIndex(
                    boardDims,
                    currentIndex,
                    doubleForwardOffset[0],
                    doubleForwardOffset[1]
                );

                if (doubleForwardIndex === null) continue; // oob
                if (isOccupied(state, doubleForwardIndex)) continue;

                // --- DOUBLE STEP PROMOTION (yes, this is possible) ---
                const doubleTargetRank: number = getRank(state.config.boardDimensions, doubleForwardIndex);
                if (doubleTargetRank === promotionRank) {
                    // For each piece that is not a pawn:
                    // Add a potential move to the pseudo moves list that promotes to that piece
                    for (const piece of state.config.pieces) {
                        if (piece.pawn === false) {
                            pseudoMoves.push({
                                from: currentIndex,
                                to: doubleForwardIndex,
                                enPassant: {
                                    captureIndex: targetIndex,
                                    deleteIndex: doubleForwardIndex,
                                },
                                promotion: piece,
                            });
                        }
                    }
                } else {
                    // No promotion, just double forward move
                    pseudoMoves.push({
                        from: currentIndex,
                        to: doubleForwardIndex,
                        enPassant: {
                            captureIndex: targetIndex,
                            deleteIndex: doubleForwardIndex,
                        },
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
            for (const captureOffset of captureOffsets) {
                // Positive offset -> towards black
                // Negative offset -> towards white
                const fileOffset = isWhitesTurn(state) ? captureOffset[0] : -captureOffset[0];
                const rankOffset = isWhitesTurn(state) ? captureOffset[1] : -captureOffset[1];
                const targetIndex: number | null = calculateIndex(boardDims, currentIndex, fileOffset, rankOffset);
                if (targetIndex === null) continue; // OOB

                if (isEnemy(state, targetIndex)) {
                    pseudoMoves.push({
                        from: currentIndex,
                        to: targetIndex,
                    });
                } else if (targetIndex === state.enPassant?.captureIndex) {
                    pseudoMoves.push({
                        from: currentIndex,
                        to: targetIndex,
                        isEnPassantCapture: true,
                    });
                }
            }
        }

        if (!!currentPiece.leaperOffsets) {
            for (const leaperOffset of currentPiece.leaperOffsets) {
                const targetIndex: number | null = calculateIndex(boardDims, currentIndex, leaperOffset[0], leaperOffset[1]);

                if (targetIndex === null) continue; // OOB
                if (isAlly(state, targetIndex)) continue;

                pseudoMoves.push({
                    from: currentIndex,
                    to: targetIndex,
                });
            }
        }

        if (!!currentPiece.sliderDirections) {
            for (const sliderDirection of currentPiece.sliderDirections) {
                let pointer: number = currentIndex;
                let nextSquare: number | null = calculateIndex(
                    boardDims,
                    currentIndex,
                    sliderDirection[0],
                    sliderDirection[1]
                );
                // while not oob
                while (nextSquare !== null) {
                    if (isAlly(state, nextSquare)) {
                        break;
                    }

                    // ATP the square must be empty or an enemy,
                    // in which case the move has to be added...
                    pseudoMoves.push({
                        from: currentIndex,
                        to: nextSquare,
                    });

                    // ...but the raycast will end here if it's an enemy.
                    if (isEnemy(state, nextSquare)) {
                        break;
                    }

                    nextSquare = calculateIndex(boardDims, nextSquare, sliderDirection[0], sliderDirection[1]);
                }
            }
        }

        // --- CASTLING ---
        if (currentPiece.royal && !isSquareAttacked(state, currentIndex)) {
            for (const castlingId of state.castling) {
                const castlingDefinition: CastlingDefinition | null = getCastlingDefinition(state, castlingId);

                if (!castlingDefinition) {
                    throw new Error(`Couldn't find castling definition with id ${castlingId} inside config!`);
                }

                if (castlingDefinition.color != currentSquare.color) {
                    continue;
                }

                function isCastlePathLegal(royalPath: number[]): boolean {
                    for (const royalPathIndex of royalPath) {
                        if (state.board[royalPathIndex] !== null) {
                            return false;
                        }
                        if (isSquareAttacked(state, royalPathIndex)) {
                            return false;
                        }
                    }
                    return true;
                }

                if (isCastlePathLegal(castlingDefinition.royalPath)) {
                    pseudoMoves.push({
                        from: castlingDefinition.royalFrom,
                        to: castlingDefinition.royalTo,
                        castle: castlingId,
                    });
                } else {
                    continue;
                }
            }
        }
    }
    return pseudoMoves;
}

function isEmpty(state: GameState, index: number): boolean {
    return !isOccupied(state, index);
}

function isOccupied(state: GameState, index: number): boolean {
    return !!state.board[index];
}

function isEnemy(state: GameState, index: number, allyColor?: Color): boolean {
    return state.board[index]?.color === getOppositeColor(allyColor ?? state.sideToMove);
}

function isAlly(state: GameState, index: number, allyColor?: Color): boolean {
    return state.board[index]?.color === (allyColor ?? state.sideToMove);
}

/**
 * Determines if the square index in question is being attacked by a piece which color is not `allyColor`.
 * Useful for determining whether a move is legal or for the 'game over' condition.
 *
 * @param state
 * @param index board index to evaluate
 * @param allyColor pieces with this color will not be considered as an attacker of index `index`.
 * @returns `true` if square is attacked by pieces that are not `allyColor`, false otherwise.
 */
export function isSquareAttacked(state: GameState, index: number, allyColor?: Color): boolean {
    // Collect all possible movement sets
    const allPieces = state.config.pieces;
    let sliderDirections: number[][][] = []; // cursed
    let leaperOffsets: number[][][] = []; // also cursed
    let pawnCaptures: number[][][] = []; // still cursed
    for (const piece of allPieces) {
        if (!!piece.sliderDirections) sliderDirections.push(piece.sliderDirections);
        if (!!piece.leaperOffsets) leaperOffsets.push(piece.leaperOffsets);
        if (!!piece.capture) pawnCaptures.push(piece.capture);
    }

    // Iterate through all of them and raycast
    // to find an enemy piece eyeing this square
    for (const currentSlider of sliderDirections) {
        for (const currentDirection of currentSlider) {
            // Raycast direction = mirrored slider direction
            const flippedDirection = currentDirection.map((d) => -d);
            let i = calculateIndex(state.config.boardDimensions, index, flippedDirection[0], flippedDirection[1]);
            // while inbounds
            while (i !== null) {
                if (isEmpty(state, i)) {
                    i = calculateIndex(state.config.boardDimensions, i, flippedDirection[0], flippedDirection[1]);
                    continue;
                }

                if (isAlly(state, i, allyColor)) {
                    break;
                }

                const currentSquare = state.board[i];
                const isPieceNotASlider = !currentSquare!.piece.sliderDirections;
                if (isPieceNotASlider) {
                    break;
                }

                const pieceSeesSquare = currentSquare!.piece.sliderDirections!.find((d) =>
                    areArraysEqual(d, currentDirection)
                );
                if (!!pieceSeesSquare) {
                    return true;
                }

                i = calculateIndex(state.config.boardDimensions, i, flippedDirection[0], flippedDirection[1]);
            }
        }
    }

    for (const currentLeaper of leaperOffsets) {
        for (const currentLeapOffset of currentLeaper) {
            const flippedLeapOffset = currentLeapOffset.map((o) => -o);
            const targetIndex = calculateIndex(
                state.config.boardDimensions,
                index,
                flippedLeapOffset[0],
                flippedLeapOffset[1]
            );

            // oob
            if (targetIndex === null) continue;
            if (isEmpty(state, targetIndex)) continue;
            if (isAlly(state, targetIndex)) continue;

            const currentSquare = state.board[targetIndex];
            const isPieceNotALeaper = !currentSquare!.piece.leaperOffsets;
            if (isPieceNotALeaper) continue;

            const pieceSeesSquare = currentSquare!.piece.leaperOffsets!.find((l) => areArraysEqual(l, currentLeapOffset));
            if (!!pieceSeesSquare) {
                return true;
            }
        }
    }

    for (const currentPawn of pawnCaptures) {
        for (const currentCaptureOffset of currentPawn) {
            const flippedOffset = isWhitesTurn(state) ? currentCaptureOffset.map((o) => -o) : currentCaptureOffset;

            const targetIndex = calculateIndex(state.config.boardDimensions, index, flippedOffset[0], flippedOffset[1]);
            if (targetIndex === null) continue;
            if (isEmpty(state, targetIndex)) continue;
            if (isAlly(state, targetIndex)) continue;

            const currentSquare = state.board[targetIndex];
            const isPieceNotAPawn = !currentSquare!.piece.capture;
            if (isPieceNotAPawn) continue;

            const pieceSeesSquare = currentSquare!.piece.capture!.find((c) => areArraysEqual(c, currentCaptureOffset));
            if (!!pieceSeesSquare) {
                return true;
            }
        }
    }

    return false;
}
