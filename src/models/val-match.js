class ValorantMatch {
    constructor(matchID, gameLeader) {
        this.matchID = matchID;
        this.gameLeader = gameLeader;

        this.attackingIDS = [];
        this.defendingIDS = [];

        this.inProgress = true;
    }

    static lowerThreshold = 10;
    static upperThreshold = 100;
    static gameThreshold = 20;
    static SCALE_FACTOR = 0.8;

    generateTeams(players) {
        this.attackingIDS.splice(0, this.attackingIDS.length);
        this.defendingIDS.splice(0, this.defendingIDS.length);

        const ids = Array.from(players.keys());
        const mmrs = Array.from(players.values());

        console.log(ids);
        console.log(mmrs);

        const totalSum = mmrs.reduce((sum, val) => sum + val, 0);
        const targetSum = Math.floor(totalSum / 2);
        console.log(targetSum);

        const dp = Array(targetSum + 1).fill(false);
        dp[0] = true;

        for(const mmr of mmrs) {
            for(let i = targetSum; i >= mmr; i--) {
                dp[i] = dp[i] || dp [i - mmr];
            }
        }

        let curSum = targetSum;
        while(!dp[curSum])
            curSum--;
        console.log(curSum);

        for(let i = 0; i < targetSum + 1; i++) {
            if(dp[i])
                console.log(i);
        }

        let backTrackSum = curSum;
        for(let i = mmrs.length - 1; i >= 0 && backTrackSum > 0; i--) {
            if(backTrackSum >= mmrs[i] && dp[backTrackSum - mmrs[i]]) {
                this.attackingIDS.push(ids[i]);
                console.log(`ID: ${ids[i]}\nMMR: ${mmrs[i]}`);
                backTrackSum -= mmrs[i];
            }
        }
        this.defendingIDS = ids.filter((id) => !this.attackingIDS.includes(id)); 
        this.inProgress = true;
        return { attacking: this.attackingIDS, defending: this.defendingIDS };
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
        const hundredRange = difference <= ValorantMatch.upperThreshold && difference >= -ValorantMatch.upperThreshold ? 
            difference >= 0 ? difference : -difference : ValorantMatch.upperThreshold;
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
                const boundsCorrection = (maxMMRGain / newMMRGain) * ValorantMatch.SCALE_FACTOR;
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
                const boundsCorrection = (maxMMRLoss / newMMRLoss) * ValorantMatch.SCALE_FACTOR;
                newMMRS.set(id, Math.floor(playersWithMMR.get(id) - (newMMRLoss * boundsCorrection)));
            }
        }

        return newMMRS;

    }

    reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser) {
        if (!this.inProgress) {
            console.log(`match already reported`);
            return;
        }
        console.log(`reporting result: ${result}`);
        if(result === 'W' && this.attackingIDS.includes(reportingUser) ||
        result === 'L' && this.defendingIDS.includes(reportingUser)) {
            const newMMRS = this.calculateNewMMRS(this.attackingIDS, this.defendingIDS, playersWithMMR, playersWithTotalGames);
            return newMMRS;
        }
        else if (result === 'L' && this.attackingIDS.includes(reportingUser) ||
        result === 'W' && this.defendingIDS.includes(reportingUser)) {
            const newMMRS = this.calculateNewMMRS(this.defendingIDS, this.attackingIDS, playersWithMMR, playersWithTotalGames);
            return newMMRS;
        }
            
    }

    
}

export default ValorantMatch
