import { Color } from "@/engine/types";
import pieceSpriteUrls from "./resources/src.json";

export function getSpriteUrl(pieceName: string, pieceColor: Color): string {
    const key = pieceName.toLowerCase();
    const spriteColor: "light" | "dark" = pieceColor === "W" ? "light" : "dark";

    const spriteSet = pieceSpriteUrls[spriteColor];

    if (!(key in spriteSet)) {
        throw new Error(`can't draw '${pieceName}': unknown piece`);
    }

    return spriteSet[key as keyof typeof spriteSet];
}
