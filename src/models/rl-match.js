import Match from './match.js';

class RocketLeagueMatch extends Match {
    constructor(matchID, gameLeader) {
        super(matchID, gameLeader, ['blue', 'orange']);
    }

    reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser) {
        if (
            (result === 'W' && this.getTeam('blue').includes(reportingUser)) ||
            (result === 'L' && this.getTeam('orange').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'blue',
                'orange'
            );
        }

        if (
            (result === 'L' && this.getTeam('blue').includes(reportingUser)) ||
            (result === 'W' && this.getTeam('orange').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'orange',
                'blue'
            );
        }
    }
}

export default ValorantMatch;
