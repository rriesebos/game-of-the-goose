import { Client } from 'boardgame.io/client';
import { GooseGame } from './game';
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
    constructor(rootElement) {
        this.client = Client({
            game: GooseGame,
            // TODO: make dynamic
            numPlayers: 6,
            // // TODO: add multiplayer
            // multiplayer: true,
        });
        this.client.start();

        this.rootElement = rootElement;

        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    attachListeners() {
        // TODO: Link moves to onclick handlers
    }

    update(state) {
        const tiles = this.rootElement.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.innerHTML = tile.dataset.id;
        });

        const spacing = 11 / state.ctx.numPlayers;
        let i = spacing / 2;
        for (const [id, player] of Object.entries(state.G.players)) {
            const newTile = this.rootElement.querySelector(`[data-id='${player.tileNumber}']`);
            const playerGoose = document.createElement('img');

            playerGoose.id = "player" + id;
            playerGoose.classList.add("player");
            playerGoose.src = PLAYER_IMAGE_MAP[id];
            playerGoose.style.top = `${i}vh`;

            newTile.appendChild(playerGoose);
            i += spacing;
        }
    }
}

const appElement = document.querySelector('.app-container');
const app = new GoosGameClient(appElement);