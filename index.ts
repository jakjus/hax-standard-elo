import HaxballJS from "haxball.js";
import addBb from "./bb";
import { calculateChanges, execChanges, calculateAndExec, GetElo, SetElo, ChangeElo, PlayerObjectWithElo } from "./elo";

const getRoom = async () => {
  const HBInit = await HaxballJS
  const room = HBInit({
    roomName: 'asd',
    token: 'thr1.AAAAAGUe_hZC0P80V_rt6Q.Kum8YQw8GyA'
  })
  return room
}

const jajko = async () => {
  const room = await getRoom()

  // example of in-memory data storage
  const memory: { [playerId: number]: PlayerObjectWithElo } = {
    0: { id: 0, name: "test", elo: 1120, team: 1, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
    1: { id: 1, name: "test", elo: 1140, team: 1, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
    2: { id: 2, name: "test", elo: 1330, team: 2, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
    3: { id: 3, name: "test", elo: 1510, team: 2, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
  }

  room.onPlayerJoin = (player) => {
    if (!memory[player.id]) {
      memory[player.id] = {...player, elo: 1200}
    }
  }

  // mock getScores and getPlayerList for test purposes
  room.getScores = () => { return { 
    "red": 0, "blue": 1, 
    "time": 20, "scoreLimit": 3, "timeLimit": 3 }}
  room.getPlayerList = () => Object.values(memory)

  const getEloOfPlayer: GetElo = async (playerId) => memory[playerId].elo

  const changeList = await calculateChanges(room, getEloOfPlayer)
  console.log(changeList)

  const changeEloOfPlayer: ChangeElo = (playerId, change) => {
    memory[playerId].elo += change
  }
  await execChanges(changeList, getEloOfPlayer, changeEloOfPlayer)
  console.log(memory)
}

jajko()
