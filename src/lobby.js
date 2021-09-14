import { LobbyClient } from 'boardgame.io/client';
import { GooseGame } from './game';
import { SERVER_URL } from './constants';

// TODO: lobby with list of player names and colors (goose images)
// TODO: match invite link
// TODO: start game button (only enabled for the lobby owner)
// TODO: leave button, onbeforeunload
// TODO: Lobby owner indicator
// TODO: (You) indicator

export class GooseGameLobby {
    constructor(rootElement, client) {
        this.lobbyClient = new LobbyClient({ server: SERVER_URL });

        this.rootElement = rootElement;
        this.client = client;
        this.matchID = null;

        this.createLobby();
        this.joinMatch();
    }

    createLobby() {
        this.rootElement.innerHTML = `
            <div id="player-list"></div>
            <button id="start-match-button" class="button">Start match</button>
        `;

        this.startMatchButton = this.rootElement.querySelector('#start-match-button');
        this.playerList = this.rootElement.querySelector('#player-list');

        this.startMatchButton.onclick = () => this.startMatch();
    }

    async getMatch(matchID) {
        return await this.lobbyClient.getMatch(GooseGame.name, matchID);
    }

    async getPlayerId(matchID) {
        const { players } = await this.getMatch(matchID);
        const openSpot = players.find((player) => !player.name);

        if (!openSpot) {
            return null;
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

        const playerID = await this.getPlayerId(this.matchID);

        if (!playerID) {
            this.rootElement.innerHTML = '<h2>Room is full.</h2>';
            return;
        }

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
            playerListHTML += `<div>${playerNames[i]}</div>`;
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