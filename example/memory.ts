import HaxballJS from "haxball.js";
import { calculateChanges, execChanges, GetElo, ChangeElo, PlayerObjectWithElo } from "../src/elo";

const getRoom = async () => {
  const HBInit = await HaxballJS
  const room = HBInit({
    roomName: 'test',
    token: 'yourtokenhere'
  })
  return room
}

// example of in-memory data storage
const memory: { [playerId: number]: PlayerObjectWithElo } = {}

const run = async () => {
  const room = await getRoom()

  room.onPlayerJoin = (player) => {
    if (!memory[player.id]) {
      memory[player.id] = {...player, elo: 1200}
    }
  }

  // implement get and change functions for our memory type
  const getEloOfPlayer: GetElo = async (playerId) => memory[playerId].elo
  const changeEloOfPlayer: ChangeElo = (playerId, change) => {
    memory[playerId].elo += change
  }

  const changeList = await calculateChanges(room, getEloOfPlayer)
  console.log(changeList)

  await execChanges(changeList, getEloOfPlayer, changeEloOfPlayer)
  console.log(memory)
}

run()
