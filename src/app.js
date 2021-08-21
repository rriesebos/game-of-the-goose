import { Client } from 'boardgame.io/client';
import { Local, SocketIO } from 'boardgame.io/multiplayer'
import { GooseGame, TILE_EVENT_MAP } from './game';

import { LobbyClient } from 'boardgame.io/client';

import rollADie from './roll-a-die/roll-a-die';
import ConfettiGenerator from 'confetti-js';

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
            numPlayers: 1,

            // multiplayer: SocketIO({ server: 'localhost:8000' }),
            multiplayer: Local(),

            matchID: matchID,
            playerID: playerID,
            credentials: credentials,

            debug: true,
        });
        this.client.start();

        this.rootElement = rootElement;

        this.infoContainer = this.rootElement.querySelector('#info-container');
        this.rollButton = this.rootElement.querySelector('#roll-button');
        this.spaceElement = this.rootElement.querySelector('#space');

        this.confetti = new ConfettiGenerator({ target: 'confetti-canvas', max: 80, size: 1.6 });

        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    attachListeners() {
        this.rollButton.onclick = () => {
            this.rollButton.disabled = true;
            this.hideInfoText();

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
                this.drawPlayerPosition(i, player.tileNumber, id);
            }

            i += spacing;
        }

        let previousPlayer = state.ctx.playOrderPos - 1 < 0 ? state.ctx.numPlayers - 1 : state.ctx.playOrderPos - 1;
        let id = state.ctx.gameover ? state.ctx.currentPlayer : state.ctx.playOrder[previousPlayer];

        // Animate moving player, scale animation time by number of moves
        let moveList = state.G.players[id].moveList;

        // Stuck on tile, show info text
        if (state.ctx.turn > 1 && moveList.length === 0) {
            this.showInfoText(state.G.infoText, 3000);
        }

        for (let [from, to] of moveList) {
            let duration = Math.round(Math.min(500, 1000 / Math.abs(from - to)));
            await this.animatePlayer(state, id, from, to, duration);
        }

        if (state.ctx.gameover) {
            this.rollButton.disabled = true;

            this.confetti.render();

            this.showInfoText(`Player ${state.ctx.gameover.winner} won!`, -1);
        }
    }

    // Returns a Promise that resolves after "ms" milliseconds
    timer = (ms) => new Promise(res => setTimeout(res, ms));

    async animatePlayer(state, id, from, to, duration) {
        let direction = 1;
        if (from > to) {
            direction = -1;
        }

        for (let i = from; i !== to + direction; i += direction) {
            // Remove old player image
            const oldTile = this.rootElement.querySelector(`[data-id='${i - direction}']`);
            if (oldTile) {
                let oldPlayerImgs = this.rootElement.querySelectorAll(`#player${id}`);
                if (oldPlayerImgs) {
                    for (let oldPlayerImg of oldPlayerImgs) {
                        oldPlayerImg.outerHTML = "";
                    }
                }
            }

            // Add new player image
            let spacing = 11 / state.ctx.numPlayers;
            let topSpacing = spacing / 2 + parseInt(id) * spacing;
            this.drawPlayerPosition(topSpacing, i, id);

            if (i in TILE_EVENT_MAP && TILE_EVENT_MAP[i].condition(state.G, state.ctx) &&
                i === to && state.G.infoText) {
                await this.showInfoText(state.G.infoText, 5000);
            }

            // Wait between adding images
            await this.timer(duration);
        }
    }

    drawPlayerPosition(topSpacing, tile, id) {
        const newTile = this.rootElement.querySelector(`[data-id='${tile}']`);
        const playerGoose = document.createElement('img');

        playerGoose.id = "player" + id;
        playerGoose.classList.add("player");
        playerGoose.src = PLAYER_IMAGE_MAP[id];

        playerGoose.style.top = `${topSpacing}vh`;

        newTile.appendChild(playerGoose);
    }

    async showInfoText(text, duration) {
        this.infoContainer.innerText = text;
        this.infoContainer.style.opacity = 1;

        if (duration >= 0) {
            await this.timer(duration);
            this.hideInfoText();
        }
    }

    hideInfoText() {
        this.infoContainer.style.opacity = 0;
    }
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