const addBbCommand = (room: RoomObject) => {
  room.onPlayerChat = (player, msg) => {
    if (msg == "!bb") {
      bbCommandAction(room, player)
    }
    return room.onPlayerChat(player, msg)
  }
}

const bbCommandAction = (room: RoomObject, player: PlayerObject) => {
  room.kickPlayer(player.id, "bb", false)
  return false
}

export { bbCommandAction }
export default addBbCommand
