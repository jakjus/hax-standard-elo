## Haxball Standard Elo
Plugin for calculating ranking points according to ELO system. To be used with node package [haxball.js](https://github.com/mertushka/haxball.js)

### Requirements
- node.js
- npm
- haxball.js

### Installation
```
npm i hax-standard-elo
```

### Documentation
Generated documentation is available at [https://hax-standard-elo.github.io](https://hax-standard-elo.github.io)

### Usage
Haxball rooms can use different kinds of data storage. It can be in-memory database, SQL database or other.

To use the library, you have to implement interfaces for 
- `getEloOfPlayer` - getting data of a player (including ELO) 
- `changeEloOfPlayer` - changing data of a player

For SQL database, it could be:
```
// db connection
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/chinook.db');

const getEloOfPlayer = async (playerId) => 
{ 
  db.all(`SELECT elo FROM player WHERE playerId = ?`, [playerId], (err, rows) => {
    rows.forEach((row) => return row.elo)
  })
}

// do the same to changeEloOfPlayer
// const changeEloOfPlayer = ...

// db close
```

### Example

The following exaple uses in-process memory.

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
