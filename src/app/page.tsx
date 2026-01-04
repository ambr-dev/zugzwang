"use client";

import { useEffect, useRef } from "react";
import pieceSpriteUrls from "./resources/src.json";
import { getSpriteUrl } from "./pieceImage";

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boardDimensions = {
        width: 20,
        height: 12,
    };
    const lightSquareHex = "#c7c1ac";
    const darkSquareHex = "#585550";

    const boardString: string = "tswgemrnbqkbnrmegwst/pppppppppppppppppppp/20/20/20/20/20/20/20/20/PPPPPPPPPPPPPPPPPPPP/TSWGEMRNBQKBNRMEGWST";
    const board: ({ piece: string; color: "W" | "B" } | null)[] = [];
    const animate = false;

    let canvasMouseX: number;
    let canvasMouseY: number;

    let draggingPiece: { piece: string; color: "W" | "B" } | null = null;

    useEffect(() => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        if (canvas === null) {
            throw new Error();
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error();
        }

        const squareWidthPx = canvas.width / boardDimensions.width;
        const squareHeightPx = canvas.height / boardDimensions.height;

        const boardIndexFromCoordinates = (x: number, y: number) => {
            const _x = Math.floor(x / squareWidthPx);
            const _y = (boardDimensions.height - 1 - Math.floor(y / squareHeightPx)) * boardDimensions.width;

            return _x + _y;
        };

        const coordinatesFromBoardIndex = (i: number): { x: number; y: number } => {
            return {
                x: (i % boardDimensions.width) * squareWidthPx,
                y: canvas.height - (Math.floor(i / boardDimensions.width) * squareHeightPx) - squareHeightPx,
            };
        };

        const fillBoard = () => {
            const isDigit = new RegExp("[0-9]+");
            const isUppercase = new RegExp("[A-Z]");
            const rows: string[] = boardString.split("/");
            let boardIndex = 0;

            for (let i = rows.length - 1; i >= 0; i--) {
                const row: string = rows[i];
                for (let j = 0; j < row.length; j++) {
                    const character: string = row[j];
                    console.log(`seeing character: ${character}`);
                    if (isDigit.test(character)) {
                        let amountFillEmptyStr: string = "";
                        while (j < row.length && isDigit.test(row.charAt(j))) {
                            amountFillEmptyStr += row[j++];
                        }
                        j--; // because at the end of the for loop we have `j++`
                    
                        const amountFillEmpty: number = parseInt(amountFillEmptyStr);
                        console.log(`filling [${boardIndex}, ${boardIndex + amountFillEmpty}] with nulls`);
                        for (let k = 0; k < amountFillEmpty; k++) {
                            board[boardIndex++] = null;
                        }
                    } else {
                        board[boardIndex++] = {
                            piece: character,
                            color: isUppercase.test(character) ? "W" : "B",
                        };
                    }
                }
            }
        };

        const drawBoard = () => {
            ctx.fillStyle = lightSquareHex;
            for (let row = 0; row < boardDimensions.height; row++) {
                let shouldSquareBeLight = row % 2 === 0;
                for (let col = 0; col < boardDimensions.width; col++) {
                    ctx.fillStyle = shouldSquareBeLight ? lightSquareHex : darkSquareHex;
                    ctx.fillRect(
                        col * squareWidthPx,
                        canvas.height - (row + 1) * squareHeightPx,
                        squareWidthPx,
                        squareHeightPx
                    );
                    shouldSquareBeLight = !shouldSquareBeLight;
                }
            }
        };

        const drawPieces = () => {
            for (let i = 0; i < board.length; i++) {
                const currentPiece = board[i];
                if (currentPiece === null) {
                    continue;
                }

                const image: HTMLImageElement = new Image();
                image.src = getSpriteUrl(currentPiece.piece, currentPiece.color);

                const {x, y} = coordinatesFromBoardIndex(i);

                ctx.drawImage(image, x, y, squareWidthPx, squareHeightPx);
            }
        };

        canvas.addEventListener("mousedown", (event) => {
            const clientX = event.offsetX;
            const clientY = event.offsetY;

            const i = boardIndexFromCoordinates(clientX, clientY);
            draggingPiece = board[i];
            board[i] = null;
        });

        canvas.addEventListener("mouseup", (event) => {
            const clientX = event.offsetX;
            const clientY = event.offsetY;

            const i = boardIndexFromCoordinates(clientX, clientY);
            board[i] = draggingPiece;
            draggingPiece = null;
        });

        canvas.addEventListener("mousemove", (event) => {
            canvasMouseX = event.offsetX;
            canvasMouseY = event.offsetY;
        });

        const drawDraggingPiece = () => {
            if (!draggingPiece) return;

            const image: HTMLImageElement = new Image();
            image.src = getSpriteUrl(draggingPiece.piece, draggingPiece.color);

            const x = canvasMouseX - squareWidthPx / 2;
            const y = canvasMouseY - squareHeightPx / 2;

            ctx.drawImage(image, x, y, squareWidthPx, squareHeightPx);
        };

        fillBoard();

        const draw = () => {
            drawBoard();
            drawPieces();
            drawDraggingPiece();

            requestAnimationFrame(draw);
        };

        draw();
    }, []);

    return (
        <div className="w-full flex flex-col items-center">
            <canvas
                ref={canvasRef}
                id="canvas"
                width={100 * boardDimensions.width}
                height={100 * boardDimensions.height}
                className="mt-10 rounded-xl"
            ></canvas>
        </div>
    );
}
