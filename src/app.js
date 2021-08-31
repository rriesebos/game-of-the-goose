import { Client } from 'boardgame.io/client';
import { Local, SocketIO } from 'boardgame.io/multiplayer'
import { GooseGame } from './game';
import { rulesets } from './rulesets';

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

function SplashScreen(rootElement) {
    return new Promise((resolve) => {
        const createButton = (playerID) => {
            const button = document.createElement('button');
            button.textContent = 'Player ' + playerID;
            button.onclick = () => resolve(playerID);
            rootElement.append(button);
        };
        rootElement.innerHTML = `<p>Play as</p>`;
        const playerIDs = ['0', '1'];
        playerIDs.forEach(createButton);
    });
}

class GoosGameClient {
    constructor(rootElement, { matchID, playerID, credentials }) {
        this.client = Client({
            game: GooseGame,

            // TODO: make dynamic
            numPlayers: 2,

            multiplayer: SocketIO({ server: 'localhost:8000' }),
            // multiplayer: Local(),

            matchID: matchID,
            playerID: playerID,
            credentials: credentials,

            debug: true,
        });
        this.client.start();

        this.rootElement = rootElement;

        this.createBoard();

        this.infoContainer = this.rootElement.querySelector('#info-container');
        this.rollButton = this.rootElement.querySelector('#roll-button');
        this.spaceElement = this.rootElement.querySelector('#space');

        this.confetti = new ConfettiGenerator({ target: 'confetti-canvas', max: 80, size: 1.6 });

        this.attachListeners();

        this.client.subscribe(state => this.update(state));

        this.lastTurn = 0;
        this.rollingDice = false;
    }

    createBoard() {
        this.rootElement.innerHTML = `
            <div id="info-container"></div>
            <canvas id="confetti-canvas"></canvas>
            <button id="roll-button" disabled><span>Roll</span></button>
            <div class="board">
                <div id="tile0" data-id="0" class="tile special">0</div>
                <div id="tile1" data-id="1" class="tile">1</div>
                <div id="tile2" data-id="2" class="tile">2</div>
                <div id="tile3" data-id="3" class="tile">3</div>
                <div id="tile4" data-id="4" class="tile">4</div>
                <div id="tile5" data-id="5" class="tile">5</div>
                <div id="tile6" data-id="6" class="tile">6</div>
                <div id="tile7" data-id="7" class="tile">7</div>
                <div id="tile8" data-id="8" class="tile">8</div>
                <div id="tile9" data-id="9" class="tile">9</div>
                <div id="tile10" data-id="10" class="tile">10</div>
                <div id="tile11" data-id="11" class="tile">11</div>
                <div id="tile31" data-id="31" class="tile">31</div>
                <div id="tile32" data-id="32" class="tile">32</div>
                <div id="tile33" data-id="33" class="tile">33</div>
                <div id="tile34" data-id="34" class="tile">34</div>
                <div id="tile35" data-id="35" class="tile">35</div>
                <div id="tile36" data-id="36" class="tile">36</div>
                <div id="tile37" data-id="37" class="tile">37</div>
                <div id="tile38" data-id="38" class="tile">38</div>
                <div id="tile39" data-id="39" class="tile">39</div>
                <div id="tile40" data-id="40" class="tile">40</div>
                <div id="tile41" data-id="41" class="tile">41</div>
                <div id="tile12" data-id="12" class="tile">12</div>
                <div id="tile30" data-id="30" class="tile">30</div>
                <div id="tile55" data-id="55" class="tile">55</div>
                <div id="tile56" data-id="56" class="tile">56</div>
                <div id="tile57" data-id="57" class="tile">57</div>
                <div id="tile58" data-id="58" class="tile">58</div>
                <div id="tile59" data-id="59" class="tile">59</div>
                <div id="tile60" data-id="60" class="tile">60</div>
                <div id="tile61" data-id="61" class="tile">61</div>
                <div id="tile62" data-id="62" class="tile">62</div>
                <div id="tile63" data-id="63" class="tile special">63</div>
                <div id="tile42" data-id="42" class="tile">42</div>
                <div id="tile13" data-id="13" class="tile">13</div>
                <div id="tile29" data-id="29" class="tile">29</div>
                <div id="tile54" data-id="54" class="tile">54</div>
                <div id="space"></div>
                <div id="tile43" data-id="43" class="tile">43</div>
                <div id="tile14" data-id="14" class="tile">14</div>
                <div id="tile28" data-id="28" class="tile">28</div>
                <div id="tile53" data-id="53" class="tile">53</div>
                <div id="tile52" data-id="52" class="tile">52</div>
                <div id="tile51" data-id="51" class="tile">51</div>
                <div id="tile50" data-id="50" class="tile">50</div>
                <div id="tile49" data-id="49" class="tile">49</div>
                <div id="tile48" data-id="48" class="tile">48</div>
                <div id="tile47" data-id="47" class="tile">47</div>
                <div id="tile46" data-id="46" class="tile">46</div>
                <div id="tile45" data-id="45" class="tile">45</div>
                <div id="tile44" data-id="44" class="tile">44</div>
                <div id="tile15" data-id="15" class="tile">15</div>
                <div id="tile27" data-id="27" class="tile">27</div>
                <div id="tile26" data-id="26" class="tile">26</div>
                <div id="tile25" data-id="25" class="tile">25</div>
                <div id="tile24" data-id="24" class="tile">24</div>
                <div id="tile23" data-id="23" class="tile">23</div>
                <div id="tile22" data-id="22" class="tile">22</div>
                <div id="tile21" data-id="21" class="tile">21</div>
                <div id="tile20" data-id="20" class="tile">20</div>
                <div id="tile19" data-id="19" class="tile">19</div>
                <div id="tile18" data-id="18" class="tile">18</div>
                <div id="tile17" data-id="17" class="tile">17</div>
                <div id="tile16" data-id="16" class="tile">16</div>
            </div>
        `;
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

        const { G, ctx } = state;

        // Play roll animation when needed
        if (G.rollDice && !this.rollingDice) {
            this.rollingDice = true;
            rollADie({
                element: this.spaceElement,
                numberOfDice: rulesets[G.ruleset].DICE_COUNT,
                callback: () => {
                    // Update current player when animation is finished
                    if (ctx.currentPlayer === this.client.playerID) {
                        this.client.moves.updatePlayer();
                    }

                    this.rollingDice = false;
                },
                values: G.dice
            });

            return;
        }

        // Prevent old state updates stemming from optimistic client-side updates
        if (ctx.turn <= this.lastTurn && !ctx.gameover) {
            return;
        }

        // Clear all tiles
        const tiles = this.rootElement.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.innerHTML = tile.dataset.id;
        });

        const spacing = 11 / ctx.numPlayers;
        let i = spacing / 2;
        for (const [id, player] of Object.entries(G.players)) {
            // Draw players that are stationary
            if (G.players[id].moveList.length === 0) {
                this.drawPlayerPosition(i, player.tileNumber, id);
            }

            i += spacing;
        }

        let previousPlayer = (ctx.playOrderPos + 1) % ctx.numPlayers;
        let id = ctx.gameover ? ctx.currentPlayer : ctx.playOrder[previousPlayer];

        let moveList = G.players[id].moveList;

        // Stuck on tile, show info text
        if (ctx.turn > 1 && moveList.length === 0) {
            this.showInfoText(G.infoText, 3000);
        }

        // Animate moving player, scale animation time by number of moves
        for (let [from, to] of moveList) {
            let duration = Math.round(Math.min(500, 1000 / Math.abs(from - to)));
            await this.animatePlayer(G, ctx, id, from, to, duration);
        }

        // Enable roll button for current player
        this.rollButton.disabled = ctx.currentPlayer !== this.client.playerID;

        if (ctx.gameover) {
            this.rollButton.disabled = true;

            if (ctx.gameover.winner) {
                this.confetti.render();
                this.showInfoText(`Player ${ctx.gameover.winner} won!`, -1);
            } else {
                this.showInfoText('All players are stuck! The game ends in a draw.', -1);
            }
        }

        this.lastTurn = ctx.turn;
    }

    // Returns a Promise that resolves after "ms" milliseconds
    timer = (ms) => new Promise(res => setTimeout(res, ms));

    async animatePlayer(G, ctx, id, from, to, duration) {
        let direction = from > to ? -1 : 1;

        for (let i = from; i !== to + direction; i += direction) {
            // Remove old player image
            const oldTile = this.rootElement.querySelector(`[data-id='${i - direction}']`);
            if (oldTile) {
                let oldPlayerImgs = this.rootElement.querySelectorAll(`#player${id}`);
                for (let oldPlayerImg of oldPlayerImgs) {
                    oldPlayerImg.outerHTML = "";
                }
            }

            // Add new player image
            let spacing = 11 / ctx.numPlayers;
            let topSpacing = spacing / 2 + parseInt(id) * spacing;
            this.drawPlayerPosition(topSpacing, i, id);

            const TILE_EVENT_MAP = rulesets[G.ruleset].TILE_EVENT_MAP;
            if (i in TILE_EVENT_MAP && TILE_EVENT_MAP[i].condition(G, ctx) &&
                i === to && G.infoText) {
                await this.showInfoText(G.infoText, 5000);
            }

            // Wait between adding images
            await this.timer(duration);
        }
    }

    drawPlayerPosition(topSpacing, tile, id) {
        const newTile = this.rootElement.querySelector(`[data-id='${tile}']`);
        if (newTile.querySelector('#player' + id)) {
            return;
        }

        const playerGoose = document.createElement('img');

        playerGoose.id = "player" + id;
        playerGoose.classList.add("goose");
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

class App {
    constructor(rootElement) {
        this.client = SplashScreen(rootElement).then((playerID) => {
            return new GoosGameClient(rootElement, { playerID });
        });
    }
}


const appElement = document.querySelector('.app-container');
new App(appElement);

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