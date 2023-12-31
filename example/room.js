const HaxballJS = require("haxball.js");
const { calculateChanges, execChanges } = require("hax-standard-elo");

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
    room.setPlayerAdmin(player.id, true)
    if (!memory[player.id]) {
      memory[player.id] = {...player, elo: 1200}
    }
  }

  // implement get and change functions for our memory type
  const getEloOfPlayer = async (playerId) => memory[playerId].elo
  const changeEloOfPlayer = (playerId, change) => {
    memory[playerId].elo += change
  }

  room.onTeamVictory = async _ => {
    try {
      const changeList = await calculateChanges(room, getEloOfPlayer)
      console.log(changeList)
      await execChanges(changeList, getEloOfPlayer, changeEloOfPlayer)
      console.log(memory)
    } catch(e) {
      console.log(e)
    }
  }

  room.onRoomLink = link => {
    console.log(link)
  }
}

run()
