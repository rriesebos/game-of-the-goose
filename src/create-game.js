import { rulesets } from './rulesets';
import { LobbyClient } from 'boardgame.io/client';
import { GooseGame } from './game';
import { SERVER_URL } from './constants';

const rulesetSelector = document.querySelector('#ruleset-selector');
const numPlayersInput = document.querySelector('#num-players');

const createMatchButton = document.querySelector('#create-match-button');

let rulesetOptions = '';
for (const ruleset of Object.keys(rulesets)) {
    rulesetOptions += `<option value="${ruleset}">${ruleset}</option>\n`
}

rulesetSelector.innerHTML = rulesetOptions;

createMatchButton.onclick = () => createMatch();

async function createMatch() {
    const lobbyClient = new LobbyClient({ server: SERVER_URL });

    const match = await lobbyClient.createMatch(GooseGame.name, {
        numPlayers: parseInt(numPlayersInput.value),
        setupData: { ruleset: rulesetSelector.value }
    });

    console.log(match);

    window.location.href = `/game.html?matchID=${match.matchID}`;
}