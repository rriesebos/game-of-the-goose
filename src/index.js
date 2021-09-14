// TODO: store player name in local storage

const playerNameInput = document.querySelector('#player-name');
const matchIdInput = document.querySelector('#match-id');

const joinMatchButton = document.querySelector('#join-match-button');
const newMatchButton = document.querySelector('#new-match-button');

const params = (new URL(document.location)).searchParams;
joinMatchButton.disabled = !params.get('matchID') && matchIdInput.value === '';

matchIdInput.addEventListener('input', (e) => {
    matchID = e.target.value;
    joinMatchButton.disabled = !params.get('matchID') && matchID === '';
});

joinMatchButton.onclick = () => {
    window.location.href = `/game.html?matchID=${matchID}`;
};

newMatchButton.onclick = () => {
    window.location.href = '/create.html';
};