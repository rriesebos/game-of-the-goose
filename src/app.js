import { Client } from "boardgame.io/client";
import { SocketIO } from "boardgame.io/multiplayer";
import { GooseGame } from "./game";
import { rulesets } from "./rulesets";
import { SERVER_URL, PLAYER_IMAGE_MAP } from "./constants";

import { GooseGameLobby } from "./lobby";

import rollADie from "./roll-a-die/roll-a-die";
import ConfettiGenerator from "confetti-js";

const INFO_TEXT_DURATION_SHORT = 2000;
const INFO_TEXT_DURATION_LONG = 4000;

class GooseGameClient {
    constructor(rootElement, { matchID, playerID, credentials }) {
        this.client = Client({
            game: GooseGame,

            multiplayer: SocketIO({ server: SERVER_URL }),

            matchID: matchID,
            playerID: playerID,
            credentials: credentials,

            debug: false,
        });
        this.client.start();

        this.rootElement = rootElement;

        this.client.subscribe((state) => this.update(state));

        this.lastTurn = 0;
        this.rollingDice = false;
        this.boardVisible = false;

        // Create lobby if the game has not yet started
        const state = this.client.getState();
        if (!state || !state.G.started) {
            this.lobby = new GooseGameLobby(this.rootElement, this.client);
        }

        // Leave the match when the page is going to be terminated
        window.addEventListener("pagehide", (event) => {
            const matchID = sessionStorage.getItem("matchID");

            if (!matchID) {
                sessionStorage.clear();
                return;
            }

            const body = new URLSearchParams({
                playerID: sessionStorage.getItem("playerID"),
                credentials: sessionStorage.getItem("playerCredentials"),
            });

            navigator.sendBeacon(`${SERVER_URL}/games/${GooseGame.name}/${matchID}/leave`, body);

            sessionStorage.clear();
        });
    }

    createBoard(ruleset) {
        this.boardVisible = true;

        this.rootElement.innerHTML = `
            <div id="player-list-game"></div>
            <span id="turn-counter">Turn: 1</span>

            <div id="info-container"></div>
            <canvas id="confetti-canvas"></canvas>
            <button id="roll-button" class="button" disabled><span>Roll</span></button>
            
            <div class="board">
                <div id="tile0" data-id="0" class="tile special"><span>0</span></div>
                <div id="tile1" data-id="1" class="tile"><span>1</span></div>
                <div id="tile2" data-id="2" class="tile"><span>2</span></div>
                <div id="tile3" data-id="3" class="tile"><span>3</span></div>
                <div id="tile4" data-id="4" class="tile"><span>4</span></div>
                <div id="tile5" data-id="5" class="tile"><span>5</span></div>
                <div id="tile6" data-id="6" class="tile"><span>6</span></div>
                <div id="tile7" data-id="7" class="tile"><span>7</span></div>
                <div id="tile8" data-id="8" class="tile"><span>8</span></div>
                <div id="tile9" data-id="9" class="tile"><span>9</span></div>
                <div id="tile10" data-id="10" class="tile"><span>10</span></div>
                <div id="tile11" data-id="11" class="tile"><span>11</span></div>
                <div id="tile31" data-id="31" class="tile"><span>31</span></div>
                <div id="tile32" data-id="32" class="tile"><span>32</span></div>
                <div id="tile33" data-id="33" class="tile"><span>33</span></div>
                <div id="tile34" data-id="34" class="tile"><span>34</span></div>
                <div id="tile35" data-id="35" class="tile"><span>35</span></div>
                <div id="tile36" data-id="36" class="tile"><span>36</span></div>
                <div id="tile37" data-id="37" class="tile"><span>37</span></div>
                <div id="tile38" data-id="38" class="tile"><span>38</span></div>
                <div id="tile39" data-id="39" class="tile"><span>39</span></div>
                <div id="tile40" data-id="40" class="tile"><span>40</span></div>
                <div id="tile41" data-id="41" class="tile"><span>41</span></div>
                <div id="tile12" data-id="12" class="tile"><span>12</span></div>
                <div id="tile30" data-id="30" class="tile"><span>30</span></div>
                <div id="tile55" data-id="55" class="tile"><span>55</span></div>
                <div id="tile56" data-id="56" class="tile"><span>56</span></div>
                <div id="tile57" data-id="57" class="tile"><span>57</span></div>
                <div id="tile58" data-id="58" class="tile"><span>58</span></div>
                <div id="tile59" data-id="59" class="tile"><span>59</span></div>
                <div id="tile60" data-id="60" class="tile"><span>60</span></div>
                <div id="tile61" data-id="61" class="tile"><span>61</span></div>
                <div id="tile62" data-id="62" class="tile"><span>62</span></div>
                <div id="tile63" data-id="63" class="tile special"><span>63</span></div>
                <div id="tile42" data-id="42" class="tile"><span>42</span></div>
                <div id="tile13" data-id="13" class="tile"><span>13</span></div>
                <div id="tile29" data-id="29" class="tile"><span>29</span></div>
                <div id="tile54" data-id="54" class="tile"><span>54</span></div>
                <div id="space"></div>
                <div id="tile43" data-id="43" class="tile"><span>43</span></div>
                <div id="tile14" data-id="14" class="tile"><span>14</span></div>
                <div id="tile28" data-id="28" class="tile"><span>28</span></div>
                <div id="tile53" data-id="53" class="tile"><span>53</span></div>
                <div id="tile52" data-id="52" class="tile"><span>52</span></div>
                <div id="tile51" data-id="51" class="tile"><span>51</span></div>
                <div id="tile50" data-id="50" class="tile"><span>50</span></div>
                <div id="tile49" data-id="49" class="tile"><span>49</span></div>
                <div id="tile48" data-id="48" class="tile"><span>48</span></div>
                <div id="tile47" data-id="47" class="tile"><span>47</span></div>
                <div id="tile46" data-id="46" class="tile"><span>46</span></div>
                <div id="tile45" data-id="45" class="tile"><span>45</span></div>
                <div id="tile44" data-id="44" class="tile"><span>44</span></div>
                <div id="tile15" data-id="15" class="tile"><span>15</span></div>
                <div id="tile27" data-id="27" class="tile"><span>27</span></div>
                <div id="tile26" data-id="26" class="tile"><span>26</span></div>
                <div id="tile25" data-id="25" class="tile"><span>25</span></div>
                <div id="tile24" data-id="24" class="tile"><span>24</span></div>
                <div id="tile23" data-id="23" class="tile"><span>23</span></div>
                <div id="tile22" data-id="22" class="tile"><span>22</span></div>
                <div id="tile21" data-id="21" class="tile"><span>21</span></div>
                <div id="tile20" data-id="20" class="tile"><span>20</span></div>
                <div id="tile19" data-id="19" class="tile"><span>19</span></div>
                <div id="tile18" data-id="18" class="tile"><span>18</span></div>
                <div id="tile17" data-id="17" class="tile"><span>17</span></div>
                <div id="tile16" data-id="16" class="tile"><span>16</span></div>
            </div>
        `;

        // Add class to move again tiles
        for (const tile of rulesets[ruleset].MOVE_AGAIN_TILES) {
            const moveAgainTile = this.rootElement.querySelector(`[data-id='${tile}']`);
            moveAgainTile.classList.add("move-again");
        }

        // TODO: add event tile images

        const playerListContainer = this.rootElement.querySelector("#player-list-game");
        for (const player of this.client.matchData) {
            const span = document.createElement("span");
            span.classList.add("player-name");
            span.innerText = player.name;

            if (player.id.toString() === this.client.playerID) {
                span.style.fontWeight = "bold";
            }

            span.dataset.playerId = player.id;

            playerListContainer.appendChild(span);
        }

        this.turnCounter = this.rootElement.querySelector("#turn-counter");

        this.infoContainer = this.rootElement.querySelector("#info-container");
        this.rollButton = this.rootElement.querySelector("#roll-button");
        this.spaceElement = this.rootElement.querySelector("#space");

        this.confetti = new ConfettiGenerator({
            target: "confetti-canvas",
            max: 80,
            size: 1.6,
        });

        this.rollButton.onclick = () => {
            this.hideInfoText();

            this.client.moves.rollDice();
        };
    }

    updatePlayerNames() {
        const playerNames = {};
        for (const player of this.client.matchData) {
            if (player.name && player.isConnected) {
                playerNames[player.id.toString()] = player.name;
            }
        }

        if (this.lobby) {
            this.lobby.updatePlayers(Object.values(playerNames));
        }
    }

    async update(state) {
        if (state === null) {
            return;
        }

        const { G, ctx } = state;

        if (!G.started) {
            this.updatePlayerNames();
            return;
        }

        if (!this.boardVisible) {
            this.createBoard(G.ruleset);
        }

        // Play roll animation when needed
        if (G.rollDice && !this.rollingDice) {
            this.rollButton.disabled = true;
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
                values: G.dice,
            });

            return;
        }

        // Prevent old state updates stemming from optimistic client-side updates
        if (ctx.turn <= this.lastTurn && !ctx.gameover) {
            return;
        }

        // Update turn counter
        this.turnCounter.innerText = `Turn: ${ctx.turn}`;

        // Clear all tiles
        const tiles = this.rootElement.querySelectorAll(".tile");
        tiles.forEach((tile) => {
            tile.innerHTML = `<span>${tile.dataset.id}</span>`;
        });

        const spacing = 80 / ctx.numPlayers;
        for (const [id, player] of Object.entries(G.players)) {
            // Draw players that are stationary
            if (G.players[id].moveList.length === 0) {
                this.drawPlayerPosition(spacing, player.tileNumber, id);
            }
        }

        let previousPlayerIndex = ctx.playOrderPos === 0 ? ctx.numPlayers - 1 : ctx.playOrderPos - 1;
        let previousPlayerID =
            ctx.gameover || ctx.turn === 1 || ctx.numPlayers === 1
                ? ctx.currentPlayer
                : ctx.playOrder[previousPlayerIndex];
        let moveList = G.players[previousPlayerID].moveList;

        // Stuck on tile, show info text
        if (ctx.turn > 1 && moveList.length === 0) {
            this.rollButton.disabled = true;
            await this.showInfoText(G.infoText, INFO_TEXT_DURATION_SHORT);
        }

        // Animate moving player, scale animation time by number of moves
        for (let [from, to] of moveList) {
            let duration = Math.round(Math.min(500, 1000 / Math.abs(from - to)));
            await this.animatePlayer(G, ctx, previousPlayerID, from, to, duration);
        }

        for (let i = 0; i < ctx.numPlayers; i++) {
            const id = i.toString();

            // Clear player turn indicator
            const currentPlayerText = this.rootElement.querySelector(`[data-player-id='${id}']`);
            currentPlayerText.classList.remove("player-selected");

            // Add player turn indicator
            if (id === ctx.currentPlayer) {
                currentPlayerText.classList.add("player-selected");
            }
        }

        // Enable roll button for current player
        this.rollButton.disabled = ctx.currentPlayer !== this.client.playerID;

        if (ctx.gameover) {
            this.rollButton.disabled = true;

            // TODO: add replay button?
            if (ctx.gameover.winner) {
                this.confetti.render();
                this.showInfoText(`${ctx.gameover.winner} won!`, -1);
            } else {
                this.showInfoText("All players are stuck! The game ends in a draw.", -1);
            }
        }

        this.lastTurn = ctx.turn;
    }

    // Returns a Promise that resolves after "ms" milliseconds
    timer = (ms) => new Promise((res) => setTimeout(res, ms));

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
            const spacing = 80 / ctx.numPlayers;
            this.drawPlayerPosition(spacing, i, id);

            const TILE_EVENT_MAP = rulesets[G.ruleset].TILE_EVENT_MAP;
            if (i in TILE_EVENT_MAP && TILE_EVENT_MAP[i].condition(G, ctx) && i === to && G.infoText) {
                await this.showInfoText(G.infoText, INFO_TEXT_DURATION_LONG);
            }

            // Wait between adding images
            await this.timer(duration);
        }
    }

    drawPlayerPosition(spacing, tile, id) {
        const newTile = this.rootElement.querySelector(`[data-id='${tile}']`);
        if (newTile.querySelector("#player" + id)) {
            return;
        }

        const playerGoose = document.createElement("img");

        playerGoose.id = "player" + id;
        playerGoose.classList.add("goose");
        playerGoose.src = PLAYER_IMAGE_MAP[id];

        const topSpacing = (spacing - 20) / 2 + parseInt(id) * spacing;
        playerGoose.style.top = `${topSpacing}%`;

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

const appElement = document.querySelector(".container");

const matchID = sessionStorage.getItem("matchID");
const playerID = sessionStorage.getItem("playerID");
const playerCredentials = sessionStorage.getItem("playerCredentials");
new GooseGameClient(appElement, {
    matchID: matchID,
    playerID: playerID,
    credentials: playerCredentials,
});
