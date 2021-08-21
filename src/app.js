import { Client } from 'boardgame.io/client';
import { Local, SocketIO } from 'boardgame.io/multiplayer'
import { GooseGame } from './game';

import { LobbyClient } from 'boardgame.io/client';

import rollADie from './roll-a-die/roll-a-die';
import player0Img from '../img/player0.svg';
import player1Img from '../img/player1.svg';
import player2Img from '../img/player2.svg';
import player3Img from '../img/player3.svg';
import player4Img from '../img/player4.svg';
import player5Img from '../img/player5.svg';

const PLAYER_IMAGE_MAP = {
    '0': player0Img,
    '1': player1Img,
    '2': player2Img,
    '3': player3Img,
    '4': player4Img,
    '5': player5Img,
}

class GoosGameClient {
    constructor(rootElement, { matchID, playerID, credentials }) {
        this.client = Client({
            game: GooseGame,
            // TODO: make dynamic
            numPlayers: 2,

            // multiplayer: SocketIO({ server: 'localhost:8000' }),
            multiplayer: Local(),

            matchID: matchID,
            playerID: playerID,
            credentials: credentials,

            debug: true,
        });
        this.client.start();

        this.rootElement = rootElement;

        this.rollButton = this.rootElement.querySelector("#roll-button");
        this.spaceElement = this.rootElement.querySelector('#space');

        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    attachListeners() {
        this.rollButton.onclick = () => {
            this.rollButton.disabled = true;

            this.client.moves.rollDice();
        }
    }

    async update(state) {
        if (state === null) {
            return;
        }

        // Play roll animation when needed
        if (state.G.rollDice) {
            rollADie({
                element: this.spaceElement,
                numberOfDice: 1,
                callback: () => {
                    // Update player when animation is finished
                    this.client.moves.updatePlayer();
                },
                values: [state.G.die]
            });

            return;
        }

        // Enable roll button for current player
        if (state.ctx.currentPlayer === this.client.playerID) {
            this.rollButton.disabled = false;
        }

        // Clear all tiles
        const tiles = this.rootElement.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.innerHTML = tile.dataset.id;
        });

        const spacing = 11 / state.ctx.numPlayers;
        let i = spacing / 2;
        for (const [id, player] of Object.entries(state.G.players)) {
            // Draw players that are stationary
            if (state.G.players[id].moveList.length === 0) {
                drawPlayerPosition(this.rootElement, i, player.tileNumber, id);
            }

            i += spacing;
        }

        let previousPlayer = state.ctx.playOrderPos - 1 < 0 ? state.ctx.numPlayers - 1 : state.ctx.playOrderPos - 1;
        let id = state.ctx.playOrder[previousPlayer];

        if (state.ctx.gameover) {
            id = state.ctx.currentPlayer;
            this.rollButton.disabled = true;

            // TODO: show winner (state.ctx.gameover.winner)
        }

        // Animate moving player, scale animation time by number of moves
        let moveList = state.G.players[id].moveList;
        for (let [from, to] of moveList) {
            let duration = Math.round(Math.min(500, 1000 / Math.abs(from - to)));
            await animatePlayer(this.rootElement, state, id, from, to, duration);
        }
    }
}

// Returns a Promise that resolves after "ms" milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms));

async function animatePlayer(rootElement, state, id, from, to, duration) {
    let direction = 1;
    if (from > to) {
        direction = -1;
    }

    for (let i = from; i !== to + direction; i += direction) {
        // Remove old player image
        const oldTile = rootElement.querySelector(`[data-id='${i - direction}']`);
        if (oldTile) {
            let oldPlayerImg = rootElement.querySelector(`#player${id}`);
            if (oldPlayerImg) {
                oldPlayerImg.outerHTML = "";
            }
        }

        // Add new player image
        let spacing = 11 / state.ctx.numPlayers;
        let topSpacing = spacing / 2 + parseInt(id) * spacing;
        drawPlayerPosition(rootElement, topSpacing, i, id);

        // Wait between adding images
        await timer(duration);
    }
}

function drawPlayerPosition(rootElement, topSpacing, tile, id) {
    const newTile = rootElement.querySelector(`[data-id='${tile}']`);
    const playerGoose = document.createElement('img');

    playerGoose.id = "player" + id;
    playerGoose.classList.add("player");
    playerGoose.src = PLAYER_IMAGE_MAP[id];

    playerGoose.style.top = `${topSpacing}vh`;

    newTile.appendChild(playerGoose);
}


const appElement = document.querySelector('.app-container');
new GoosGameClient(appElement, { matchID: '', playerID: '0', credentials: '' });

// const appElement = document.querySelector('.app-container');
// const playerIDs = ['0', '1'];
// const clients = playerIDs.map(playerID => {
//     const rootElement = document.createElement('div');
//     appElement.append(rootElement);
//     return new GoosGameClient(rootElement, { matchID: '', playerID: playerID, credentials: '' });
// });

// const lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });

// lobbyClient.listGames()
//     .then(console.log)
//     .catch(console.error);

// lobbyClient.createMatch('game-of-the-goose', {
//         numPlayers: 2
//     })
//     .then(console.log)
//     .catch(console.error);

// lobbyClient.listMatches('game-of-the-goose')
//     .then((matches) => {
//         console.log(matches);

//         lobbyClient.joinMatch(
//                 'game-of-the-goose',
//                 matches.matches[0].matchID, {
//                     playerID: '1',
//                     playerName: 'Bob',
//                 }
//             ).then((test) => {
//                 const appElement = document.querySelector('.app-container');
//                 new GoosGameClient(appElement, { matchID: matches.matches[0].matchID, playerID: '1', credentials: test.playerCredentials });
//             })
//             .catch(console.error);
//     })
//     .catch(console.error);