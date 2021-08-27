import { rulesets } from "./rulesets";

export const createGame = (ruleset) => {
    const MAX_MOVE_COUNT = rulesets[ruleset].MAX_MOVE_COUNT;
    const MOVE_AGAIN_TILES = rulesets[ruleset].MOVE_AGAIN_TILES;
    const TILE_EVENT_MAP = rulesets[ruleset].TILE_EVENT_MAP;
    const DICE_COUNT = rulesets[ruleset].DICE_COUNT;

    return {
        name: 'game-of-the-goose',

        setup: (ctx) => {
            let players = {};
            for (let i = 0; i < ctx.numPlayers; i++) {
                players[i.toString()] = {
                    name: 'Player ' + i,
                    tileNumber: 0,
                    moveList: [],
                    skipTurns: 0,
                    stuck: false,
                };
            }

            return {
                ruleset: ruleset,
                dice: null,
                rollDice: false,
                players: players,
                infoText: '',
            }
        },

        moves: {
            rollDice: (G, ctx) => {
                // Clear move lists
                for (const player of Object.values(G.players)) {
                    player.moveList = [];
                }

                // Check if the player has to skip a turn
                if (G.players[ctx.currentPlayer].skipTurns > 0) {
                    G.players[ctx.currentPlayer].skipTurns--;

                    G.infoText = "Skipped turn.";

                    ctx.events.endTurn();
                    return;
                }

                G.dice = ctx.random.D6(DICE_COUNT);
                ctx.log.setMetadata(`Player ${ctx.currentPlayer} rolled ${G.dice}`);

                G.rollDice = true;
            },
            updatePlayer: (G, ctx) => {
                G.rollDice = false;

                // Check if the player is stuck in the well, free player if they threw a 6
                if (G.players[ctx.currentPlayer].stuck) {
                    if (!TILE_EVENT_MAP[G.players[ctx.currentPlayer].tileNumber].escapeCondition(G, ctx)) {
                        ctx.events.endTurn();
                        return;
                    }

                    G.players[ctx.currentPlayer].stuck = false;
                }

                const diceSum = G.dice.reduce((a, b) => a + b, 0);
                movePlayer(G, ctx, diceSum, 1);

                ctx.events.endTurn();
            },
        },

        endIf: (G, ctx) => {
            // End the game if a player reaches the last tile
            if (G.players[ctx.currentPlayer].tileNumber === MAX_MOVE_COUNT) {
                return { winner: ctx.currentPlayer };
            }

            // End if all players are stuck, resulting in a draw
            if (Object.values(G.players).every((player) => player.stuck)) {
                return { winner: null };
            }
        },
    };

    function movePlayer(G, ctx, moveCount, moveDirection) {
        let tileNumber = G.players[ctx.currentPlayer].tileNumber;
        let lastTileNumber = tileNumber;
        let nextMoveDirection = moveDirection;

        // Start moving backwards if the the max move count is exceeded
        if (tileNumber + moveCount * moveDirection > MAX_MOVE_COUNT) {
            nextMoveDirection = -1;
            tileNumber = 2 * MAX_MOVE_COUNT - tileNumber - moveCount;

            G.players[ctx.currentPlayer].moveList.push([lastTileNumber, MAX_MOVE_COUNT]);
            lastTileNumber = MAX_MOVE_COUNT;
        } else {
            tileNumber += moveCount * moveDirection;
        }

        // Move player to new tile (updating state)
        G.players[ctx.currentPlayer].tileNumber = tileNumber;
        G.players[ctx.currentPlayer].moveList.push([lastTileNumber, tileNumber]);

        // Handle special tile events
        if (tileNumber in TILE_EVENT_MAP && TILE_EVENT_MAP[tileNumber].condition(G, ctx)) {
            TILE_EVENT_MAP[tileNumber].event(G, ctx);
            G.infoText = TILE_EVENT_MAP[tileNumber].text;
            return;
        }

        // Move again using the last throw
        if (MOVE_AGAIN_TILES.includes(tileNumber)) {
            movePlayer(G, ctx, moveCount, nextMoveDirection);
        }
    }
}