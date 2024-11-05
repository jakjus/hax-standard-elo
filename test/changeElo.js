const { calculateChanges, execChanges } = require("../dist/elo");
const assert = require("node:assert");

describe("changeElo", () => {
  const memory = {
    0: { id: 0, name: "test", elo: 1100, team: 1, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
    1: { id: 1, name: "test", elo: 1140, team: 1, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
    2: { id: 2, name: "test", elo: 1330, team: 2, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
    3: { id: 3, name: "test", elo: 1510, team: 2, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc"},
  }
  const memoryPreChange = JSON.parse(JSON.stringify(memory))

  // mock getScores and getPlayerList
  const room = {
    getScores: () => {
      return {
        "red": 1, "blue": 0,  // red wins
        "time": 20, "scoreLimit": 3, "timeLimit": 3 }
    },
    getPlayerList: () => Object.values(memory),
  }

  const getEloOfPlayer = async (playerId) => memory[playerId].elo
  const changeEloOfPlayer = (playerId, change) => {
    memory[playerId].elo += change
  }


  // @ts-ignore
  it("should create array of elo changes with proper length", async () => { 
    const changeList = await calculateChanges(room, getEloOfPlayer)
    assert.equal(changeList.length, 4, "changes length is 4")
  })
  it("should have winners gain elo and losers lose elo", async () => {
    const changeList = await calculateChanges(room, getEloOfPlayer)
    assert(changeList.find(c => c.playerId == 0).change > 0, "team 1 wins")
    assert(changeList.find(c => c.playerId == 1).change > 0, "team 1 wins")
    assert(changeList.find(c => c.playerId == 2).change < 0, "team 2 loses")
    assert(changeList.find(c => c.playerId == 3).change < 0, "team 2 loses")
    assert(changeList.find(c => c.playerId == 0).change > changeList.find(c => c.playerId == 1).change, "player 0 wins more ELO than player 1")
    assert(changeList.find(c => c.playerId == 3).change < changeList.find(c => c.playerId == 2).change, "player 3 loses more ELO than player 2")  // change will be negative, so <

    await execChanges(changeList, getEloOfPlayer, changeEloOfPlayer)

    for (const player of Object.values(memory)) {
      assert(player.elo != memoryPreChange[player.id].elo, "elo has changed")
    }
  })
})
