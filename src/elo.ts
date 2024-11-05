type GetElo = (playerId: number) => Promise<number>
type SetElo = (playerId: number, newElo: number) => void
type ChangeElo = (playerId: number, change: number) => void  // change can be negative
interface Change {
  playerId: number,
  change: number,
}
interface Options {
  k: number  // coefficient in ELO algorithm. maximum ELO point change per game. default: 30
}
const defaults: Options = {
  k: 30
}

interface PlayerObjectWithElo extends PlayerObject {
  elo: number,
}

const getAvgElo = (playerListWithElo: PlayerObjectWithElo[]): number => {
  if (playerListWithElo.length == 0) {
    throw("There are no players with elo in one of the teams.")
  }
  return playerListWithElo
  .map(p => p.elo)
  .reduce((a,b) => a+b, 0)/playerListWithElo.length
}

const calculateChanges = async (room: RoomObject, getEloOfPlayer: GetElo, playerlistWithElo?: PlayerObjectWithElo[], options?: Options): Promise<Change[]> => {
  const mergedOptions: Options = { ...defaults, ...options }
  const k = mergedOptions.k
  const getp1 = (elo: number, enemyTeamElo: number) => 1 / (1 + 10 ** ((elo - enemyTeamElo) / 400));

  const scores = room.getScores()
  if (!scores) {
    throw("Game was not running and has no scores to calculate from.")
  }
  if (scores.red == scores.blue) {
    throw("Draw is not supported.")
  }
  const winnerTeamId = scores.red > scores.blue ? 1 : 2
  const loserTeamId = scores.red > scores.blue ? 2 : 1

  const promisePlayersWithElo: Promise<PlayerObjectWithElo[]> = Promise.all(room.getPlayerList().filter(p => p.team != 0).map(async p => {
    const elo = await getEloOfPlayer(p.id)
    return {...p, elo }}))
  const playersWithElo = playerlistWithElo || await promisePlayersWithElo

  const losers = playersWithElo.filter(p => p.team == loserTeamId)
  const loserTeamElo = getAvgElo(losers)
  const winners = playersWithElo.filter(p => p.team == winnerTeamId)
  const winnerTeamElo = getAvgElo(winners)

  // calculate changes
  const changeLosers = losers.map(p => {
    const p1 = getp1(p.elo, winnerTeamElo)
    const change = -Math.round((k * (1 - p1)))
    if (isNaN(change)) { throw("Change is not a number.") }
    return { playerId: p.id, change }
  })

  const changeWinners = winners.map(p => {
    const p1 = getp1(p.elo, loserTeamElo)
    const change = Math.round((k * p1))
    if (isNaN(change)) { throw("Change is not a number.")}
    return { playerId: p.id, change }
  })

  const allChanges = [...changeLosers, ...changeWinners]
  return allChanges
}

const execChanges = async (changeList: Change[], getEloOfPlayer?: GetElo, changeEloOfPlayer?: ChangeElo, setEloOfPlayer?: SetElo) => {
  // either use atomic ChangeElo or non-atomic SetElo
  if (changeEloOfPlayer) {
    changeList.forEach(c => changeEloOfPlayer(c.playerId, c.change))
  } else if (setEloOfPlayer && getEloOfPlayer) {
    changeList.forEach(async c => {
      const elo = await getEloOfPlayer(c.playerId)
      setEloOfPlayer(c.playerId, elo+c.change)
    })
  } else {
    throw("Specify [changeEloOfPlayer AND getEloOfPlayer] OR setEloOfPlayer.") 
  }
}

const calculateAndExec = async (room: RoomObject, getEloOfPlayer: GetElo, changeEloOfPlayer?: ChangeElo, setEloOfPlayer?: SetElo, playerlistWithElo?: PlayerObjectWithElo[], options?: Options): Promise<void> => {
  const changeList = await calculateChanges(room, getEloOfPlayer, playerlistWithElo, options)
  await execChanges(changeList, getEloOfPlayer, changeEloOfPlayer, setEloOfPlayer)
}

export { calculateChanges, execChanges, calculateAndExec, GetElo, ChangeElo, SetElo, PlayerObjectWithElo, Change, Options, defaults }
