import { LobbyClient } from 'boardgame.io/client';
import { rulesets } from './rulesets';
import { GooseGame } from './game';

class GooseGameLobby {
    constructor(rootElement) {
        // TODO: change address to constant
        this.lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });

        this.rootElement = rootElement;

        this.createLobby();

        this.playerNameInput = this.rootElement.querySelector('#player-name');
        this.rulesetSelector = this.rootElement.querySelector('#ruleset-selector');
        this.numPlayersInput = this.rootElement.querySelector('#num-players');

        this.showGamesButton = this.rootElement.querySelector('#show-games-button');
        this.createMatchButton = this.rootElement.querySelector('#create-match-button');
        this.showMatchButton = this.rootElement.querySelector('#show-match-button');
        this.showMatchesButton = this.rootElement.querySelector('#show-matches-button');
        this.joinMatchButton = this.rootElement.querySelector('#join-match-button');

        this.attachListeners();

        this.match = null;
    }

    createLobby() {
        let rulesetOptions = '';
        for (const ruleset of Object.keys(rulesets)) {
            rulesetOptions += `<option value="${ruleset}">${ruleset}</option>\n`
        }

        this.rootElement.innerHTML = `
            <button id="show-games-button">Show games</button>
            <button id="create-match-button">Create match</button>
            <button id="show-match-button">Show match</button>
            <button id="show-matches-button">Show matches</button>
            <button id="join-match-button">Join match</button>

            <label for="player-name">Player name:</label>
            <input type="text" id="player-name" name="player-name" placeholder="Enter your name">

            <label for="rulesets">Choose a ruleset:</label>
            <select id="ruleset-selector" name="rulesets">
                ${rulesetOptions}
            </select> 

            <label for="num-players">Number of players (1-6):</label>
            <input type="number" id="num-players" name="num-players" value="4" min="1" max="6">
        `;
    }

    attachListeners() {
        this.showGamesButton.onclick = async() => {
            const games = await this.lobbyClient.listGames();
            console.log(games);
        }

        this.showMatchButton.onclick = async() => {
            const match = await this.getMatch();
            console.log(match);
        }

        this.createMatchButton.onclick = () => {
            this.createMatch();
        }

        this.showMatchesButton.onclick = async() => {
            const matches = await this.lobbyClient.listMatches(GooseGame.name);
            console.log(matches);
        }

        this.joinMatchButton.onclick = () => {
            this.joinMatch();
        }
    }

    async createMatch() {
        this.match = await this.lobbyClient.createMatch(GooseGame.name, {
            numPlayers: parseInt(this.numPlayersInput.value),
            setupData: { ruleset: this.rulesetSelector.value }
        });
        console.log(this.match);
    }

    async getMatch() {
        return await this.lobbyClient.getMatch(GooseGame.name, this.match.matchID);
    }

    async getPlayerId() {
        const { players } = await this.getMatch();
        return players.find((player) => !player.name).id.toString();
    }

    async joinMatch() {
        const playerCredentials = await this.lobbyClient.joinMatch(
            GooseGame.name,
            this.match.matchID, {
                playerID: await this.getPlayerId(),
                playerName: this.playerNameInput.value,
            }
        )
        console.log(playerCredentials);
    }
}


const appElement = document.querySelector('.lobby-container');
new GooseGameLobby(appElement);