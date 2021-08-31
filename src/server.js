const { Server, Origins } = require('boardgame.io/server');
const { GooseGame } = require('./game');

const server = Server({
    games: [GooseGame],
    origins: [Origins.LOCALHOST],
});

server.run(8000);