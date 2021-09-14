import { LobbyClient } from 'boardgame.io/client';
import { GooseGame } from './game';
import { SERVER_URL } from './constants';

// TODO: lobby with list of player names and colors (goose images)
// TODO: match invite link
// TODO: leave button, onbeforeunload
// TODO: Lobby owner indicator

export class GooseGameLobby {
    constructor(rootElement, client) {
        this.lobbyClient = new LobbyClient({ server: SERVER_URL });

        this.rootElement = rootElement;
        this.client = client;
        this.matchID = null;

        this.createLobby();
        this.joinMatch();
    }

    async createLobby() {
        this.rootElement.innerHTML = `
            <div id="player-list"></div>
            <button id="start-match-button" class="button" disabled>Start match</button>
        `;

        this.startMatchButton = this.rootElement.querySelector('#start-match-button');
        this.playerList = this.rootElement.querySelector('#player-list');

        this.startMatchButton.onclick = () => this.startMatch();
    }

    getMatch(matchID) {
        return this.lobbyClient.getMatch(GooseGame.name, matchID)
    }

    async getPlayerId(matchID) {
        let match = null;
        try {
            match = await this.getMatch(matchID);
        } catch (err) {
            throw err;
        }

        const openSpot = match.players.find((player) => !player.name);
        if (!openSpot) {
            return -1;
        }

        return openSpot.id.toString();
    }

    async joinMatch() {
        // TODO: prevent refreshing from causing a rejoin (local storage)
        const params = (new URL(document.location)).searchParams;
        this.matchID = params.get('matchID');

        // Redirect to index.html if match id is not set
        if (!this.matchID) {
            window.location.href = '/index.html';
            return;
        }

        let playerID = -1;
        try {
            playerID = await this.getPlayerId(this.matchID);
        } catch (err) {
            window.location.href = '/index.html';
            return;
        }

        if (playerID === -1) {
            this.rootElement.innerHTML = `
                <h2>Room is full.</h2>
                <button class="button" onclick="window.location.href = '/index.html'">Back to home</button>
            `;
            return;
        }

        // Enable start button if the player is the first player (game creator if no one leaves)
        this.startMatchButton.disabled = playerID !== '0';

        const { playerCredentials } = await this.lobbyClient.joinMatch(
            GooseGame.name,
            this.matchID, {
                playerID: playerID,
                // TODO: get from local storage
                // playerName: this.playerNameInput.value === '' ? "Player " + playerID : this.playerNameInput.value,
                playerName: "Player " + playerID,
            }
        );

        this.client.updateMatchID(this.matchID);
        this.client.updatePlayerID(playerID);
        this.client.updateCredentials(playerCredentials);
    }

    updatePlayers(playerNames) {
        this.playerNames = playerNames;

        // TODO: update player list
        let playerListHTML = '';
        for (let i = 0; i < playerNames.length; i++) {
            // TODO: add goose images
            if (i.toString() === this.client.playerID) {
                playerListHTML += `<div>${playerNames[i]} (You)</div>`;
            } else {
                playerListHTML += `<div>${playerNames[i]}</div>`;
            }
        }

        this.playerList.innerHTML = playerListHTML;
    }

    startMatch() {
        if (!this.matchID) {
            return;
        }

        this.client.moves.startGame(this.playerNames);
    }
}