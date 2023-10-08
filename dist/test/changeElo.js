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
Object.defineProperty(exports, "__esModule", { value: true });
const elo_1 = require("../elo");
const assert = require("node:assert");
describe("changeElo", () => {
    // mock getScores and getPlayerList
    const room = {
        getScores: () => {
            return {
                "red": 1, "blue": 0,
                "time": 20, "scoreLimit": 3, "timeLimit": 3
            };
        },
        getPlayerList: () => Object.values(memory),
    };
    const memory = {
        0: { id: 0, name: "test", elo: 1100, team: 1, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc" },
        1: { id: 1, name: "test", elo: 1140, team: 1, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc" },
        2: { id: 2, name: "test", elo: 1330, team: 2, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc" },
        3: { id: 3, name: "test", elo: 1510, team: 2, admin: false, position: { x: 0, y: 0 }, auth: "abc", conn: "abc" },
    };
    it("should calculate new elo", (done) => __awaiter(void 0, void 0, void 0, function* () {
        const getEloOfPlayer = (playerId) => __awaiter(void 0, void 0, void 0, function* () { return memory[playerId].elo; });
        const changeEloOfPlayer = (playerId, change) => {
            memory[playerId].elo += change;
        };
        const memoryPreChange = memory;
        // @ts-ignore
        const changeList = yield (0, elo_1.calculateChanges)(room, getEloOfPlayer);
        assert.equal(changeList.length, 4, "changes length is 4");
        assert(changeList.find((c) => c.playerId == 0).change > 0, "team 1 wins");
        assert(changeList.find((c) => c.playerId == 1).change > 0, "team 1 wins");
        assert(changeList.find((c) => c.playerId == 2).change < 0, "team 2 loses");
        assert(changeList.find((c) => c.playerId == 3).change < 0, "team 2 loses");
        assert(changeList.find((c) => c.playerId == 0).change > changeList.find((c) => c.playerId == 1).change, "player 0 wins more ELO than player 1");
        assert(changeList.find((c) => c.playerId == 3).change < changeList.find((c) => c.playerId == 2).change, "player 3 loses more ELO than player 2"); // change will be negative, so <
        yield (0, elo_1.execChanges)(changeList, getEloOfPlayer, changeEloOfPlayer);
        for (const player of Object.values(memory)) {
            assert(player.elo != memoryPreChange[player.id].elo, "elo has changed");
        }
        done();
    }));
});
//# sourceMappingURL=changeElo.js.map