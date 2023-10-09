# Haxball Standard Elo
Plugin for calculating ranking points according to ELO system. To be used with node package [haxball.js](https://github.com/mertushka/haxball.js)

## Requirements
- Haxball room script in which you want to use the library

## Installation
```
npm i hax-standard-elo
```

## Documentation
Website documentation is available at [https://hax-standard-elo.github.io](https://hax-standard-elo.github.io)

## Usage
Haxball rooms can use different kinds of data storage. It can be in-memory database, SQL database or other.

To use the library, you have to implement interfaces for 
- `getEloOfPlayer` - getting data of a player (including ELO) 
- `changeEloOfPlayer` - changing data of a player
You can find these definitions at [docs](https://hax-standard-elo.github.io).


For SQL database, it could be:
```js
// db connection
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/chinook.db');

const getEloOfPlayer = async (playerId) => 
{ 
  db.all(`SELECT elo FROM player WHERE playerId = ?`, [playerId], (err, rows) => {
    rows.forEach((row) => return row.elo)
  })
}

// do the same with changeEloOfPlayer
// const changeEloOfPlayer = ...

db.close()
```

### Example

The following example uses in-process memory within Haxball.js room script.

```js
// room.js

import HaxballJS from "haxball.js";
import { calculateChanges, execChanges } from "hax-standard-elo";

const getRoom = async () => {
  const HBInit = await HaxballJS
  const room = HBInit({
    roomName: 'test',
    token: 'yourtokenhere'
  })
  return room
}

// example of in-memory data storage
const memory = {}

const run = async () => {
  const room = await getRoom()

  room.onPlayerJoin = (player) => {
    if (!memory[player.id]) {
      memory[player.id] = {...player, elo: 1200}
    }
  }

  // implement get and change functions for our memory type
  const getEloOfPlayer = async (playerId) => memory[playerId].elo
  const changeEloOfPlayer = (playerId, change) => {
    memory[playerId].elo += change
  }

  const changeList = await calculateChanges(room, getEloOfPlayer)
  console.log(changeList)

  await execChanges(changeList, getEloOfPlayer, changeEloOfPlayer)
  console.log(memory)

  // or at once with
  // await calculateAndExec(room, getEloOfPlayer, changeEloOfPlayer)
}

run()
```

The equivalent example for TypeScript is in [here](example/memory.ts).

### Sidenotes
1. Getting data
For performance purposes, you may want to get all the players data in one query. Then "getEloOfPlayer" should read individual players ELO from parsed data.
