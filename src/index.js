// TODO: add functionality to join and new match buttons, disable join if matchID parameter is not set and custom match id is empty
// TODO: store player name in local storage
// TODO: join button: redirect directly to the lobby using the matchID from the URL parameter/custom match id
// TODO: create: redirect to /create.html

const newMatchButton = document.querySelector('#new-match-button');
newMatchButton.onclick = () => {
    window.location.href = '/create.html';
};