import { LobbyClient } from 'boardgame.io/client';
import { rulesets } from './rulesets';
import { GooseGame } from './game';
import { SERVER_URL } from './app';

export class GooseGameLobby {
    constructor(rootElement, client) {
        this.lobbyClient = new LobbyClient({ server: SERVER_URL });

        this.rootElement = rootElement;
        this.client = client;

        this.createLobby();

        this.matchIdInput = this.rootElement.querySelector('#match-id');
        this.playerNameInput = this.rootElement.querySelector('#player-name');
        this.rulesetSelector = this.rootElement.querySelector('#ruleset-selector');
        this.numPlayersInput = this.rootElement.querySelector('#num-players');

        this.createMatchButton = this.rootElement.querySelector('#create-match-button');
        this.showMatchButton = this.rootElement.querySelector('#show-match-button');
        this.showMatchesButton = this.rootElement.querySelector('#show-matches-button');
        this.joinMatchButton = this.rootElement.querySelector('#join-match-button');
        this.startMatchButton = this.rootElement.querySelector('#start-match-button');

        this.attachListeners();

        this.match = null;
    }

    createLobby() {
        let rulesetOptions = '';
        for (const ruleset of Object.keys(rulesets)) {
            rulesetOptions += `<option value="${ruleset}">${ruleset}</option>\n`
        }

        this.rootElement.innerHTML = `
            <button id="create-match-button" class="button">Create match</button>
            <button id="show-match-button" class="button">Show match</button>
            <button id="show-matches-button" class="button">Show matches</button>
            <button id="join-match-button" class="button">Join match</button>
    
            <label for="match-id">Match ID:</label>
            <input type="text" id="match-id" name="match-id" placeholder="Enter the match ID">
    
            <label for="player-name">Player name:</label>
            <input type="text" id="player-name" name="player-name" placeholder="Enter your name">
    
            <label for="rulesets">Choose a ruleset:</label>
            <select id="ruleset-selector" name="rulesets">
                ${rulesetOptions}
            </select> 
    
            <label for="num-players">Number of players (1-6):</label>
            <input type="number" id="num-players" name="num-players" value="4" min="1" max="6">
    
            <button id="start-match-button" class="button" disabled>Start match</button>
        `;
    }

    attachListeners() {
        this.showMatchButton.onclick = () => this.getMatch(this.match.matchID);
        this.createMatchButton.onclick = () => this.createMatch();

        this.showMatchesButton.onclick = async() => {
            const matches = await this.lobbyClient.listMatches(GooseGame.name);
            console.log(matches);
        }

        this.joinMatchButton.onclick = () => this.joinMatch();
        this.startMatchButton.onclick = () => this.startMatch();
    }

    async createMatch() {
        this.playerNames = {};

        this.match = await this.lobbyClient.createMatch(GooseGame.name, {
            numPlayers: parseInt(this.numPlayersInput.value),
            setupData: { ruleset: this.rulesetSelector.value }
        });
        console.log(this.match);

        this.startMatchButton.disabled = false;
    }

    async getMatch(matchID) {
        const match = await this.lobbyClient.getMatch(GooseGame.name, matchID);
        console.log(match);
        return match;
    }

    async getPlayerId(matchID) {
        const { players } = await this.getMatch(matchID);
        return players.find((player) => !player.name).id.toString();
    }

    async joinMatch() {
        let matchID = this.matchIdInput.value;
        if (!matchID || matchID === '') {
            matchID = this.match.matchID;
        }

        const playerID = await this.getPlayerId(matchID);
        const { playerCredentials } = await this.lobbyClient.joinMatch(
            GooseGame.name,
            matchID, {
                playerID: playerID,
                playerName: this.playerNameInput.value === '' ? "Player " + playerID : this.playerNameInput.value,
            }
        )

        this.client.updateMatchID(matchID);
        this.client.updatePlayerID(playerID);
        this.client.updateCredentials(playerCredentials);
    }

    startMatch() {
        if (!this.match) {
            return;
        }

        this.client.moves.startGame(this.playerNames);
    }
}