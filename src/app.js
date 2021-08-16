import { Client } from 'boardgame.io/client';
import { GooseGame } from './game';

class GoosGameClient {
    constructor(rootElement) {
        this.client = Client({
            game: GooseGame,
            // TODO: make dynamic
            numPlayers: 2,
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
            tile.style.color = 'white';
        });

        for (const [id, player] of Object.entries(state.G.players)) {
            const newTile = this.rootElement.querySelector(`[data-id='${player.tileNumber}']`);
            if (id === '0') {
                newTile.style.color = 'red';
            } else {
                newTile.style.color = 'blue';
            }
        }
    }
}

const appElement = document.querySelector('.app-container');
const app = new GoosGameClient(appElement);