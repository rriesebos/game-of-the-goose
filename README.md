# Game of the Goose

## Known issues
- Players leaving the game can be unreliable because it relies on the [Window: beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) event. This leads to 'orphaned' games because matches are only purged from the server when all players leave the game.
