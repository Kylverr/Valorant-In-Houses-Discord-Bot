class Match {
    constructor(matchID, game, gameLeader, teamNames) {
        this.matchID = matchID;
        this.game = game;
        this.gameLeader = gameLeader;

        // Example: ['attacking', 'defending'] or ['blue', 'orange']
        this.teamNames = teamNames;

        // Map teamName -> array of player IDs
        this.teams = new Map();
        for (const name of teamNames) {
            this.teams.set(name, []);
        }

        this.inProgress = true;

        this.winner = null;
        this.loser = null;
    }

    // ===== Generic helpers =====

    getTeamPlayers(name) {
        return this.teams.get(name);
    }

    getPlayersByTeam() {
        const result = {};
        for (const [teamName, players] of this.teams.entries()) {
            result[teamName] = players;
        }
        return result;
    }

    getAllPlayers() {
        let allPlayers = [];
        for (const team of this.teams.values()) {
            allPlayers = allPlayers.concat(team);
        }
        return allPlayers;
    }

    clearTeams() {
        for (const team of this.teams.values()) {
            team.length = 0;
        }
    }

    static lowerThreshold = 10;
    static upperThreshold = 100;
    static gameThreshold = 20;
    static SCALE_FACTOR = 0.8;

    generateTeams(players) {
        this.clearTeams();

        const [teamA, teamB] = this.teamNames;

        const ids = Array.from(players.keys());
        const mmrs = Array.from(players.values());

        const totalSum = mmrs.reduce((sum, val) => sum + val, 0);
        const targetSum = Math.floor(totalSum / 2);

        const dp = Array(targetSum + 1).fill(false);
        dp[0] = true;

        for (const mmr of mmrs) {
            for (let i = targetSum; i >= mmr; i--) {
                dp[i] = dp[i] || dp[i - mmr];
            }
        }

        let curSum = targetSum;
        while (!dp[curSum]) curSum--;

        let backTrackSum = curSum;
        for (let i = mmrs.length - 1; i >= 0 && backTrackSum > 0; i--) {
            if (backTrackSum >= mmrs[i] && dp[backTrackSum - mmrs[i]]) {
                this.teams.get(teamA).push(ids[i]);
                backTrackSum -= mmrs[i];
            }
        }

        this.teams.set(
            teamB,
            ids.filter(id => !this.teams.get(teamA).includes(id))
        );

        this.inProgress = true;

        return {
            [teamA]: this.teams.get(teamA),
            [teamB]: this.teams.get(teamB)
        };
    }

    shuffleTeams() {

    }

    calculateNewMMRS(winners, losers, playersWithMMR, playersWithTotalGames) {
        // calculate total sums of the MMR of both teams
        const winnersSum = winners.reduce((sum, id) => sum + playersWithMMR.get(id), 0);
        const losersSum = losers.reduce((sum, id) => sum + playersWithMMR.get(id), 0);
        console.log(`Winners sum: ${winnersSum}\nLosers sum: ${losersSum}`);
        // calculate the difference between loser sum and winner sum
        const difference = (losersSum - winnersSum);
        console.log(`Difference: ${difference}`);
        // shift the difference to be in the range [-upperThreshold, upperThreshold]
        const hundredRange = difference <= Match.upperThreshold && difference >= -Match.upperThreshold ? 
            difference >= 0 ? difference : -difference : Match.upperThreshold;
        // shift the difference to be in the range [0, upperThreshold]
        console.log(`Hundred range: ${hundredRange}`);
        const teamImbalanceCorrection = Math.floor(Math.sqrt(hundredRange - 1)); 
        const netGain = difference >= 0 ? teamImbalanceCorrection + 10 : 10 - teamImbalanceCorrection;
        console.log(`Net gain: ${netGain}`);

        const newMMRS = new Map();

        for(const id of winners) {
            const normalMMRGain = Math.floor(Math.pow(1.3179, -(playersWithTotalGames.get(id) - 20)) + 1);
            const newMMRGain = Math.floor(normalMMRGain * (netGain / 10));
            const maxMMRGain = 1000 - playersWithMMR.get(id);
            // ensure the new MMR isn't outside the range [1, 1000]
            if (newMMRGain < maxMMRGain)
                newMMRS.set(id, playersWithMMR.get(id) + newMMRGain);
            else {
                const boundsCorrection = (maxMMRGain / newMMRGain) * Match.SCALE_FACTOR;
                newMMRS.set(id, Math.floor(playersWithMMR.get(id) + (newMMRGain * boundsCorrection)));
            }
        }

        for(const id of losers) {
            const normalMMRLoss = Math.floor(Math.pow(1.3179, -(playersWithTotalGames.get(id) - 20)) + 1);
            const newMMRLoss = Math.floor(normalMMRLoss * (netGain / 10));
            const maxMMRLoss = playersWithMMR.get(id) - 1;
            // ensure the new MMR isn't outside the range [1, 1000]
            if (newMMRLoss < maxMMRLoss) {
                newMMRS.set(id, playersWithMMR.get(id) - newMMRLoss);
            }
            else {
                const boundsCorrection = (maxMMRLoss / newMMRLoss) * Match.SCALE_FACTOR;
                newMMRS.set(id, Math.floor(playersWithMMR.get(id) - (newMMRLoss * boundsCorrection)));
            }
        }

        return newMMRS;

    }

    reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser) {
        if (!this.inProgress) return;

        const teamA = this.teamNames[0];
        const teamB = this.teamNames[1];

        let winners, losers;
        if (result === 'W' && this.teams.get(teamA).includes(reportingUser) ||
            result === 'L' && this.teams.get(teamB).includes(reportingUser)) {
            winners = this.teams.get(teamA);
            losers = this.teams.get(teamB);

            this.winner = teamA;
            this.loser = teamB;
        }
        else {
            winners = this.teams.get(teamB);
            losers = this.teams.get(teamA);

            this.winner = teamB;
            this.loser = teamA;
        }

        return this.calculateNewMMRS(winners, losers, playersWithMMR, playersWithTotalGames);
    }
}

export default Match;
