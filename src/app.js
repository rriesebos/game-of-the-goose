import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer'
import { GooseGame } from './game';

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

class GoosGameClient {
    constructor(rootElement, { playerID } = {}) {
        this.client = Client({
            game: GooseGame,
            // TODO: make dynamic
            numPlayers: 2,

            multiplayer: Local(),

            playerID,
        });
        this.client.start();

        this.rootElement = rootElement;
        this.createBoard();

        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    createBoard() {
        this.rootElement.innerHTML = `
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
                <div id="space">Game of the goose</div>
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
        // TODO: Link moves to onclick handlers
    }

    update(state) {
        if (state === null) {
            return;
        }

        const tiles = this.rootElement.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.innerHTML = tile.dataset.id;
        });

        const spacing = 11 / state.ctx.numPlayers;
        let i = spacing / 2;
        for (const [id, player] of Object.entries(state.G.players)) {
            const newTile = this.rootElement.querySelector(`[data-id='${player.tileNumber}']`);
            const playerGoose = document.createElement('img');

            playerGoose.id = "player" + id;
            playerGoose.classList.add("player");
            playerGoose.src = PLAYER_IMAGE_MAP[id];
            playerGoose.style.top = `${i}vh`;

            newTile.appendChild(playerGoose);
            i += spacing;
        }
    }
}

const appElement = document.querySelector('.app-container');
const playerIDs = ['0', '1'];
const clients = playerIDs.map(playerID => {
    const rootElement = document.createElement('div');
    appElement.append(rootElement);
    return new GoosGameClient(rootElement, { playerID });
});