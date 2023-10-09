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
exports.calculateAndExec = exports.execChanges = exports.calculateChanges = void 0;
const defaults = {
    k: 30
};
const getAvgElo = (playerListWithElo) => {
    if (playerListWithElo.length == 0) {
        throw ("There are no players with elo in one of the teams.");
    }
    return playerListWithElo
        .map(p => p.elo)
        .reduce((a, b) => a + b, 0) / playerListWithElo.length;
};
const calculateChanges = (room, getEloOfPlayer, options) => __awaiter(void 0, void 0, void 0, function* () {
    const mergedOptions = Object.assign(Object.assign({}, defaults), options);
    const k = mergedOptions.k;
    const getp1 = (elo, enemyTeamElo) => 1 / (1 + Math.pow(10, ((elo - enemyTeamElo) / 400)));
    const scores = room.getScores();
    if (!scores) {
        throw ("Game was not running and has no scores to calculate from.");
    }
    if (scores.red == scores.blue) {
        throw ("Draw is not supported.");
    }
    const winnerTeamId = scores.red > scores.blue ? 1 : 2;
    const loserTeamId = scores.red > scores.blue ? 2 : 1;
    const promisePlayersWithElo = Promise.all(room.getPlayerList().filter(p => p.team != 0).map((p) => __awaiter(void 0, void 0, void 0, function* () {
        const elo = yield getEloOfPlayer(p.id);
        return Object.assign(Object.assign({}, p), { elo });
    })));
    const playersWithElo = yield promisePlayersWithElo;
    const losers = playersWithElo.filter(p => p.team == loserTeamId);
    const loserTeamElo = getAvgElo(losers);
    const winners = playersWithElo.filter(p => p.team == winnerTeamId);
    const winnerTeamElo = getAvgElo(winners);
    // calculate changes
    const changeLosers = losers.map(p => {
        const p1 = getp1(p.elo, winnerTeamElo);
        const change = -Math.round((k * (1 - p1)));
        if (isNaN(change)) {
            throw ("Change is not a number.");
        }
        return { playerId: p.id, change };
    });
    const changeWinners = winners.map(p => {
        const p1 = getp1(p.elo, loserTeamElo);
        const change = Math.round((k * p1));
        if (isNaN(change)) {
            throw ("Change is not a number.");
        }
        return { playerId: p.id, change };
    });
    const allChanges = [...changeLosers, ...changeWinners];
    return allChanges;
});
exports.calculateChanges = calculateChanges;
const execChanges = (changeList, getEloOfPlayer, changeEloOfPlayer, setEloOfPlayer) => __awaiter(void 0, void 0, void 0, function* () {
    // either use atomic ChangeElo or non-atomic SetElo
    if (changeEloOfPlayer) {
        changeList.forEach(c => changeEloOfPlayer(c.playerId, c.change));
    }
    else if (setEloOfPlayer && getEloOfPlayer) {
        changeList.forEach((c) => __awaiter(void 0, void 0, void 0, function* () {
            const elo = yield getEloOfPlayer(c.playerId);
            setEloOfPlayer(c.playerId, elo + c.change);
        }));
    }
    else {
        throw ("Specify [changeEloOfPlayer AND getEloOfPlayer] OR setEloOfPlayer.");
    }
});
exports.execChanges = execChanges;
const calculateAndExec = (room, getEloOfPlayer, changeEloOfPlayer, setEloOfPlayer, options) => __awaiter(void 0, void 0, void 0, function* () {
    const changeList = yield calculateChanges(room, getEloOfPlayer, options);
    yield execChanges(changeList, getEloOfPlayer, changeEloOfPlayer, setEloOfPlayer);
});
exports.calculateAndExec = calculateAndExec;
//# sourceMappingURL=elo.js.map