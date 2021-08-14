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

        this.createBoard();
        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    createBoard() {
        // TODO: Create/initialize board
    }

    attachListeners() {
        // TODO: Link moves to onclick handlers
    }

    update(state) {
        // TODO: Update the board when the game state changes
    }
}

const appElement = document.getElementById('app');
const app = new GoosGameClient(appElement);