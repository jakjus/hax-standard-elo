const defaultElo = 1200
type GetElo = (playerId: number) => Promise<number>
type SetElo = (playerId: number, newElo: number) => void
type AddElo = (playerId: number, change: number) => void  // change can be negative
interface PlayerObjectWithElo extends PlayerObject {
  elo: number,
}

const getAvgElo = (playerListWithElo: PlayerObjectWithElo[]): number => {
  return playerListWithElo.length == 0 ? defaultElo : playerListWithElo
  .map(p => p.elo)
  .reduce((a,b) => a+b, 0)/playerListWithElo.length
}

const calculateChanges = async (room: RoomObject, getEloOfPlayer: GetElo): Promise<number[][]> => {
  const k = 30
  const getp1 = (elo: number, enemyTeamElo: number) => 1 / (1 + 10 ** ((elo - enemyTeamElo) / 400));

  const scores = room.getScores()
  const winnerTeamId = scores.red > scores.blue ? 0 : 1
  const loserTeamId = scores.red > scores.blue ? 1 : 0

  const promisePlayersWithElo: Promise<PlayerObjectWithElo[]> = Promise.all(room.getPlayerList().filter(p => p.team != 2).map(async p => { 
    const elo = await getEloOfPlayer(p.id)
    return {...p, elo }}))
  const playersWithElo = await promisePlayersWithElo

  const losers = playersWithElo.filter(p => p.team == loserTeamId)
  const loserTeamElo = getAvgElo(losers)
  const winners = playersWithElo.filter(p => p.team == winnerTeamId)
  const winnerTeamElo = getAvgElo(winners)

  // calculate change losers
  const changeLosers = losers.map(p => {
    const p1 = getp1(p.elo, winnerTeamElo)
    const change = Math.floor((k * (1 - p1)))
    if (isNaN(change)) { throw "change is not a number" }
    return [p.id, -change]
  })

  // calculate change winners
  const changeWinners = winners.map(p => {
    const p1 = getp1(p.elo, loserTeamElo)
    const change = Math.floor((k * (1 - p1)))
    if (isNaN(change)) { throw "change is not a number" }
    return [p.id, change]
  })

  const allChanges = [...changeLosers, ...changeWinners]
  return allChanges
}

const execChanges = (changeList: number[][], getEloOfPlayer?: GetElo, addEloOfPlayer?: AddElo, setEloOfPlayer?: SetElo) => {
  // either use SetElo or atomic AddElo
  if (setEloOfPlayer) {
    changeList.forEach(c => setEloOfPlayer(c[0], c[1]))
  } else if (addEloOfPlayer && getEloOfPlayer) {
    changeList.forEach(async c => {
      const elo = await getEloOfPlayer(c[0])
      addEloOfPlayer(c[0], elo+c[1])
    })
  } else {
    throw("Specify [addEloOfPlayer AND getEloOfPlayer] OR setEloOfPlayer") 
  }
}

const calculateAndExec = async (room: RoomObject, getEloOfPlayer: GetElo, addEloOfPlayer?: AddElo, setEloOfPlayer?: SetElo): Promise<void> => {
  const changeList = await calculateChanges(room, getEloOfPlayer)
  execChanges(changeList, getEloOfPlayer, addEloOfPlayer, setEloOfPlayer)
}

export { calculateChanges, execChanges, calculateAndExec }
