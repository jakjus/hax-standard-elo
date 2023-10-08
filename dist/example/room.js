"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const haxball_js_1 = __importDefault(require("haxball.js"));
const elo_1 = require("./elo");
const getRoom = () => __awaiter(void 0, void 0, void 0, function* () {
    const HBInit = yield haxball_js_1.default;
    const room = HBInit({
        roomName: 'test',
        token: 'yourtokenhere'
    });
    return room;
});
// example of in-memory data storage
const memory = {};
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield getRoom();
    room.onPlayerJoin = (player) => {
        if (!memory[player.id]) {
            memory[player.id] = Object.assign(Object.assign({}, player), { elo: 1200 });
        }
    };
    const getEloOfPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () { return memory[playerId].elo; });
    const changeList = yield (0, elo_1.calculateChanges)(room, getEloOfPlayer);
    console.log(changeList);
    const changeEloOfPlayer = (playerId, change) => {
        memory[playerId].elo += change;
    };
    yield (0, elo_1.execChanges)(changeList, getEloOfPlayer, changeEloOfPlayer);
    console.log(memory);
});
run();
//# sourceMappingURL=room.js.map