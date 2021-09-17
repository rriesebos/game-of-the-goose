import { LobbyClient } from "boardgame.io/client";
import { GooseGame } from "./game";
import { SERVER_URL, PLAYER_IMAGE_MAP } from "./constants";

export class GooseGameLobby {
    constructor(rootElement, client) {
        this.lobbyClient = new LobbyClient({ server: SERVER_URL });

        this.rootElement = rootElement;
        this.client = client;

        const params = new URL(document.location).searchParams;
        this.matchID = params.get("matchID");

        // Retrieve player information from session storage
        this.playerID = sessionStorage.getItem("playerID");
        this.playerName = sessionStorage.getItem("playerName");

        this.validateMatch(this.matchID)
            .then((playerID) => {
                this.createLobby();
                this.joinMatch(playerID);
            })
            .catch((err) => this.showError(err));
    }

    async createLobby() {
        this.rootElement.innerHTML = `
            <div class="lobby-container">
                <div id="title-container">
                    <h2>Game of the Goose</h2>
                    <span id="room-info"></span>
                </div>
                <div id="player-list"></div>

                <div id="start-container">
                    <span id="player-count"></span>
                    <button id="start-match-button" class="button" disabled>Start match</button>
                </div>

                <div id="match-invite-box">
                    <h3>Invite your friends:</h3>
                    <div class="copy-box">
                        <input type="text" id="match-invite-link" class="copy-input" name="match-invite-link" readonly>
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="copy-icon" viewBox="0 0 24 24">
                            <g>
                                <path fill="none" d="M0 0h24v24H0V0z"></path>
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        `;

        this.roomInfoContainer = this.rootElement.querySelector("#room-info");
        this.playerCountText = this.rootElement.querySelector("#player-count");

        this.playerList = this.rootElement.querySelector("#player-list");
        this.startMatchButton = this.rootElement.querySelector("#start-match-button");
        this.matchInviteLinkCopyBox = this.rootElement.querySelector(".copy-box");
        this.matchInviteLinkInput = document.querySelector("#match-invite-link");

        this.startMatchButton.onclick = () => this.startMatch();
        this.matchInviteLinkCopyBox.onclick = () => this.copyMatchInvite();

        // Update match invite link
        // TODO: update url
        this.matchInviteLinkInput.value = `localhost:1234/index.html?matchID=${this.matchID}`;
    }

    getMatch(matchID) {
        return this.lobbyClient.getMatch(GooseGame.name, matchID);
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

    async joinMatch(playerID) {
        // Check if the client has already joined
        if (this.client.playerID && this.client.playerID === this.playerID) {
            return;
        }

        // Enable start button if the player is the first player (game creator if no one leaves)
        this.startMatchButton.disabled = playerID !== "0";

        const { playerCredentials } = await this.lobbyClient.joinMatch(GooseGame.name, this.matchID, {
            playerID: playerID,
            playerName: !this.playerName || this.playerName === "" ? "Player " + playerID : this.playerName,
        });

        this.client.updateMatchID(this.matchID);
        this.client.updatePlayerID(playerID);
        this.client.updateCredentials(playerCredentials);

        // Store current session variables
        sessionStorage.setItem("matchID", this.matchID);
        sessionStorage.setItem("playerID", playerID);
        sessionStorage.setItem("playerCredentials", playerCredentials);
    }

    async leaveMatch() {
        this.lobbyClient.leaveMatch(GooseGame.name, this.matchID, {
            playerID: sessionStorage.getItem("playerID"),
            credentials: sessionStorage.getItem("playerCredentials"),
        });
    }

    async validateMatch(matchID) {
        if (this.playerID) {
            return this.playerID;
        }

        // Redirect to index.html if match id is not set
        if (!matchID) {
            throw "Match ID not set.";
        }

        let playerID = -1;
        try {
            playerID = await this.getPlayerId(matchID);
        } catch (err) {
            throw "Invalid match ID.";
        }

        if (playerID === -1) {
            throw "Match is full.";
        }

        return playerID;
    }

    updatePlayers(playerNames) {
        this.playerNames = playerNames;

        let playerListHTML = "";
        for (let i = 0; i < playerNames.length; i++) {
            let playerName = playerNames[i];

            // Make own name bold
            if (i.toString() === this.client.playerID) {
                playerName = `<b>${playerName}</b>`;
            }

            // Add crown symbol to host
            if (i === 0) {
                playerName += " ♕";
            }

            playerListHTML += `
                <div class="player-info">
                    <img class="player-info-goose" src=${PLAYER_IMAGE_MAP[i.toString()]}></img>
                    <span>${playerName}</span>
                </div>
                <hr>
            `;
        }

        this.playerList.innerHTML = playerListHTML;

        this.updateRoomInfo();
    }

    async updateRoomInfo() {
        const match = await this.getMatch(this.matchID);
        const playerCount = match.players.map((player) => player.name && player.isConnected).filter(Boolean).length;

        this.roomInfoContainer.innerText = `Ruleset: ${match.setupData.ruleset} — Players: ${match.players.length}`;
        this.playerCountText.innerText = `Joined players:  ${playerCount} / ${match.players.length}`;

        // Enable start button if the player is the first player (game creator if no one leaves) and the room is full
        this.startMatchButton.disabled = this.client.playerID !== "0" || playerCount !== match.players.length;
    }

    startMatch() {
        if (!this.matchID) {
            return;
        }

        this.client.moves.startGame(this.playerNames);
    }

    copyMatchInvite() {
        this.matchInviteLinkInput.select();
        this.matchInviteLinkInput.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(this.matchInviteLinkInput.value);
    }

    showError(errorMessage) {
        this.rootElement.innerHTML = "";
        this.rootElement.innerText = errorMessage;
        this.rootElement.innerHTML += `<button class="button" onclick="window.location.href = '/index.html'">Back to home</button>`;
    }
}
