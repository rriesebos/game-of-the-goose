const MAX_MOVE_COUNT = 63;

export const MOVE_AGAIN_TILES = [1, 5, 10, 23, 32, 41, 45, 54, 59];

export const TILE_EVENT_MAP = {
    // Move player in front of the next player
    3: {
        condition: (G, ctx) => Object.values(G.players).some((player) => player.tileNumber > G.players[ctx.currentPlayer].tileNumber),
        event: (G, ctx) => {
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
                G.players[ctx.currentPlayer].moveList.push([tileNumber, nextPlayerTileNumber + 1]);
            }
        },
        text: `Leapfrog: Move in front of the next player!`
    },

    // Move ahead to tile 12
    6: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].moveList.push([6, 12]);
            G.players[ctx.currentPlayer].tileNumber = 12;
        },
        text: `Bridge: You can cross the river, continue to tile 12!`
    },

    // Move back to tile 9
    15: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].moveList.push([15, 9]);
            G.players[ctx.currentPlayer].tileNumber = 9;
        },
        text: `Birdcage: A bird has escaped! To catch it, move back to tile 9.`
    },

    // Skip the next turn
    19: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].skipTurns = 1;
        },
        text: `Hotel: Tired of the journey, you stay a night in the hotel. Skip one turn.`
    },

    // Throw again if the last throw was either 1 or 2
    26: {
        condition: (G, ctx) => G.die === 1 || G.die === 2,
        event: (G, ctx) => {
            ctx.events.endTurn({ next: ctx.currentPlayer });
        },
        text: `Dice: You threw 1 or 2, throw again!`
    },

    // Player falls in the well
    31: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].stuckInWell = true;
        },
        text: `The well: You fell into the well! You may only continue after you roll 6.`
    },

    // Move back to tile 33
    39: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].moveList.push([39, 33]);
            G.players[ctx.currentPlayer].tileNumber = 33;
        },
        text: `Stairs: Dummy! You fell off the stairs, go back to tile 33.`
    },

    // Move back to tile 30
    42: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].moveList.push([42, 30]);
            G.players[ctx.currentPlayer].tileNumber = 30;
        },
        text: `Maze: Now you also got lost in the maze! Go back to tile 30.`
    },

    // Skip the next 2 turns
    52: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].skipTurns = 2;
        },
        text: `Prison: And now you're going to jail?! Skip two turns!`
    },

    // Move back to tile 0 (the starting tile)
    58: {
        condition: (G, ctx) => true,
        event: (G, ctx) => {
            G.players[ctx.currentPlayer].moveList.push([58, 0]);
            G.players[ctx.currentPlayer].tileNumber = 0;
        },
        text: `Graveyard: Your life has come to an end, but you get a second chance. Start again on tile 0.`
    },
};

export const GooseGame = {
    name: 'game-of-the-goose',

    setup: (ctx) => {
        let players = {};
        for (let i = 0; i < ctx.numPlayers; i++) {
            players[i.toString()] = {
                name: 'Player ' + i,
                tileNumber: 0,
                moveList: [],
                skipTurns: 0,
                stuckInWell: false,
            };
        }

        return {
            die: null,
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

            G.die = ctx.random.D6();
            ctx.log.setMetadata(`Player ${ctx.currentPlayer} rolled ${G.die}`);

            G.rollDice = true;
        },
        updatePlayer: (G, ctx) => {
            G.rollDice = false;

            // Check if the player is stuck in the well, free player if they threw a 6
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

    // Move again using the last throw
    if (MOVE_AGAIN_TILES.includes(tileNumber)) {
        movePlayer(G, ctx, moveCount, nextMoveDirection);
    }

    // Handle special tile events
    if (tileNumber in TILE_EVENT_MAP && TILE_EVENT_MAP[tileNumber].condition(G, ctx)) {
        TILE_EVENT_MAP[tileNumber].event(G, ctx);
        G.infoText = TILE_EVENT_MAP[tileNumber].text;
    }
}