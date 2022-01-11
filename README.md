# Game of the Goose

A 2.5D, fully responsive multiplayer online adaptation of the well-known game of the goose boardgame. The (isometric) board is created using plain HTML and CSS, and the game state + multiplayer are managed by [boardgame.io](https://boardgame.io/).

## Play now
Go to https://game-of-the-goose.herokuapp.com/ to play the game.

## Known issues
- Players leaving the game can be unreliable because it relies on the [Window: pagehide](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event) event. This leads to 'orphaned' games because matches are only purged from the server when all players leave the game.

## Todo's
- Add art to event tiles.
- Add sounds.
- Add unit testing using Jest.

## Screenshots
![Board](https://raw.githubusercontent.com/rriesebos/game-of-the-goose/main/screenshots/board.png?token=GHSAT0AAAAAABOI47BTHXFJGC2SUZ2GGH52YPHA3BA)
![End screen after win](https://raw.githubusercontent.com/rriesebos/game-of-the-goose/main/screenshots/end-screen-win.png?token=GHSAT0AAAAAABOI47BSD5AN3NA5ZSD7FYWWYPHA4FQ)
![Lobby](https://raw.githubusercontent.com/rriesebos/game-of-the-goose/main/screenshots/lobby.png?token=GHSAT0AAAAAABOI47BSAHGYEMWWKUFPAWIUYPHA4GA)
![Home](https://raw.githubusercontent.com/rriesebos/game-of-the-goose/main/screenshots/home.png?token=GHSAT0AAAAAABOI47BSFQXQEDWEROEPVCK4YPHA5KA)
![Create game](https://raw.githubusercontent.com/rriesebos/game-of-the-goose/main/screenshots/create-game.png?token=GHSAT0AAAAAABOI47BS7E6WNLM6JKHPTTDQYPHA4FA)
