import {describe, expect, test} from '@jest/globals';
import eightByEightConfigJson from "./configs/default.json";
import nineByNineConfigJson from "./configs/9-by-9.json";
import { createStateFromConfig } from './fen';
import { GameConfigSchema, GameState, Move } from './types';
import { pseudoMoves } from './movegen';
import { getOppositeColor, indexToAlgebraic } from './utilities';

const eightByEightConfig = GameConfigSchema.parse(eightByEightConfigJson);
const nineByNineconfig = GameConfigSchema.parse(nineByNineConfigJson);

describe('movegen module', () => {
    test('starting positions of 8x8 board', () => {
        const state: GameState = createStateFromConfig(eightByEightConfig);
        state.sideToMove = "B";

        const moves: Move[] = pseudoMoves(state);
        console.log(JSON.stringify(moves.map(m => ({
            "from": indexToAlgebraic(state.config.boardDimensions, m.from),
            "to": indexToAlgebraic(state.config.boardDimensions, m.to),
        })), null, 2));
    })
});