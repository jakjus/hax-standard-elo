import HaxballJS from "haxball.js";
import addBb from "./bb";

const getRoom = async () => {
  const HBInit = await HaxballJS
  const room = HBInit({
    roomName: 'asd',
    token: 'thr1.AAAAAGUKwZSqX8brfGEzWg.YsJpfDDfseA'
  })
  return room
}

const jajko = async () => {
  const room = await getRoom()
  room.onPlayerChat = (player, msg) => {
    console.log('msg')
    return false
  }
  addBb(room)
  await new Promise(r => setTimeout(r, 2000));
  console.log(JSON.stringify(room.onPlayerChat, null, 2))
}

jajko()
