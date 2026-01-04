"use client";

import { useEffect, useRef } from "react";

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boardDimensions = {
        width: 8,
        height: 8,
    };
    const lightSquareHex = "#c7c1ac";
    const darkSquareHex = "#585550";

    const boardString: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
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

        const fillBlack = () => {
            ctx.fillStyle = "black";
            ctx.strokeStyle = "white";
        };

        const fillWhite = () => {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
        };

        const squareWidthPx = canvas.width / boardDimensions.width;
        const squareHeightPx = canvas.height / boardDimensions.height;

        const textDrawOffset = squareHeightPx / 5;

        const boardIndexFromCoordinates = (x: number, y: number) => {
            const _x = Math.floor(x / squareWidthPx);
            const _y = (boardDimensions.height - 1 - Math.floor(y / squareWidthPx)) * boardDimensions.width;

            return _x + _y;
        };

        const fillBoard = () => {
            const isDigit = new RegExp("[1-9]+");
            const isUppercase = new RegExp("[A-Z]");
            const rows: string[] = boardString.split("/");
            let boardIndex = 0;

            for (let i = rows.length - 1; i >= 0; i--) {
                const row: string = rows[i];
                for (let j = 0; j < row.length; j++) {
                    const character: string = row[j];
                    if (isDigit.test(character)) {
                        const amountFillEmpty: number = parseInt(character);
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
            ctx.textAlign = "center";
            ctx.font = "bold 50pt serif";

            const isDigit = new RegExp("[1-9]+");
            // 0 = <x:0, y:0> canvas space, but a8 in classic 8x8
            for (let i = 0; i < board.length; i++) {
                const currentPiece = board[i];
                if (currentPiece === null) {
                    continue;
                }

                const col = i % boardDimensions.width;
                const row = boardDimensions.width - Math.floor(i / boardDimensions.width) - 1;

                const x = col * squareWidthPx + squareWidthPx / 2;
                const y = row * squareHeightPx + squareHeightPx / 2;

                if (currentPiece.color === "W") {
                    fillWhite();
                } else {
                    fillBlack();
                }

                ctx.fillText(currentPiece.piece, x, y + textDrawOffset);
                ctx.strokeText(currentPiece.piece, x, y + textDrawOffset);
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

            if (draggingPiece.color === "W") {
                fillWhite();
            } else {
                fillBlack();
            }

            ctx.fillText(draggingPiece.piece, canvasMouseX, canvasMouseY + textDrawOffset);
            ctx.strokeText(draggingPiece.piece, canvasMouseX, canvasMouseY + textDrawOffset);
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
            <canvas ref={canvasRef} id="canvas" width="900" height="900" className="border-8"></canvas>
        </div>
    );
}
