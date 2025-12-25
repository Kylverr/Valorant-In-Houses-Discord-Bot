import Match from './match.js';

class ValorantMatch extends Match {
    constructor(matchID, gameLeader) {
        super(matchID, gameLeader, ['attacking', 'defending']);
    }

    reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser) {
        if (
            (result === 'W' && this.getTeam('attacking').includes(reportingUser)) ||
            (result === 'L' && this.getTeam('defending').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'attacking',
                'defending'
            );
        }

        if (
            (result === 'L' && this.getTeam('attacking').includes(reportingUser)) ||
            (result === 'W' && this.getTeam('defending').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'defending',
                'attacking'
            );
        }
    }
}

export default ValorantMatch;
