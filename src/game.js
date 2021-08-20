const MAX_MOVE_COUNT = 63;

const MOVE_AGAIN_TILES = [1, 5, 10, 23, 32, 41, 45, 54, 59];

const TILE_EVENT_MAP = {
    // Move player in front of the next player
    3: (G, ctx) => {
        let tileNumber = G.players[ctx.currentPlayer].tileNumber;

        let nextPlayerTileNumber = 0;
        let distanceToNextPlayer = MAX_MOVE_COUNT;
        for (const player of Object.values(G.players)) {
            if (player.id === ctx.currentPlayer || player.tileNumber === 0) {
                continue;
            }

            if (player.tileNumber > tileNumber && player.tileNumber - tileNumber < distanceToNextPlayer) {
                distanceToNextPlayer = player.tileNumber - tileNumber;
                nextPlayerTileNumber = player.tileNumber;
            }
        }

        if (nextPlayerTileNumber > 0) {
            G.players[ctx.currentPlayer].tileNumber = nextPlayerTileNumber + 1;
        }
    },

    // Move ahead to tile 12
    6: (G, ctx) => G.players[ctx.currentPlayer].tileNumber = 12,

    // Move back to tile 9
    15: (G, ctx) => G.players[ctx.currentPlayer].tileNumber = 9,

    // Skip the next turn
    19: (G, ctx) => G.players[ctx.currentPlayer].skipTurns = 1,

    // Throw again if the last throw was either 1 or 2
    26: (G, ctx) => {
        if (G.die === 1 || G.die === 2) {
            ctx.events.endTurn({ next: ctx.currentPlayer });
        }
    },

    // Player falls in the well
    31: (G, ctx) => G.players[ctx.currentPlayer].stuckInWell = true,

    // Move back to tile 33
    39: (G, ctx) => G.players[ctx.currentPlayer].tileNumber = 33,

    // Move back to tile 30
    42: (G, ctx) => G.players[ctx.currentPlayer].tileNumber = 30,

    // Skip the next 2 turns
    52: (G, ctx) => G.players[ctx.currentPlayer].skipTurns = 2,

    // Move back to tile 0 (the starting tile)
    58: (G, ctx) => G.players[ctx.currentPlayer].tileNumber = 0,
};

export const GooseGame = {
    name: 'game-of-the-goose',

    setup: (ctx) => {
        let players = {};
        for (let i = 0; i < ctx.numPlayers; i++) {
            players[i.toString()] = {
                name: "Player " + i,
                tileNumber: 0,
                skipTurns: 0,
                stuckInWell: false,
            };
        }

        return {
            die: null,
            players: players,
        }
    },

    moves: {
        rollDice: (G, ctx, value) => {
            // Check if the player has to skip a turn
            if (G.players[ctx.currentPlayer].skipTurns > 0) {
                G.players[ctx.currentPlayer].skipTurns--;

                ctx.events.endTurn();
                return;
            }

            // Roll a six-faced die
            if (value) {
                G.die = value;
            } else {
                G.die = ctx.random.D6();
            }

            ctx.log.setMetadata(`Player ${ctx.currentPlayer} rolled ${G.die}`);

            // Check if the player is stuck in the well, free player if they throw a 6
            if (G.players[ctx.currentPlayer].stuckInWell) {
                if (G.die !== 6) {
                    ctx.events.endTurn();
                    return;
                }

                G.players[ctx.currentPlayer].stuckInWell = false;
            }

            movePlayer(G, ctx, G.die, 1);

            ctx.events.endTurn();
        },
    },

    endIf: (G, ctx) => {
        // End the game if a player reaches the last tile
        if (G.players[ctx.currentPlayer].tileNumber === MAX_MOVE_COUNT) {
            return { winner: ctx.currentPlayer };
        }
    },
};

function movePlayer(G, ctx, moveCount, moveDirection) {
    let tileNumber = G.players[ctx.currentPlayer].tileNumber;
    let nextMoveDirection = moveDirection;

    // Start moving backwards if the the max move count is exceeded
    if (tileNumber + moveCount * moveDirection > MAX_MOVE_COUNT) {
        nextMoveDirection = -1;
        tileNumber = 2 * MAX_MOVE_COUNT - tileNumber - moveCount;
    } else {
        tileNumber += moveCount * moveDirection;
    }

    // Move player to new tile (updating state)
    G.players[ctx.currentPlayer].tileNumber = tileNumber;

    // Move again using the last throw
    if (MOVE_AGAIN_TILES.includes(tileNumber)) {
        movePlayer(G, ctx, moveCount, nextMoveDirection);
    }

    // Handle special tile events
    if (tileNumber in TILE_EVENT_MAP) {
        TILE_EVENT_MAP[tileNumber](G, ctx);
    }
}