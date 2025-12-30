import Match from './match.js';

class ValorantMatch extends Match {
    constructor(matchID, gameLeader) {
        super(matchID, 'VAL', gameLeader, ['Attacking', 'Defending']);
    }

    reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser) {
        if (
            (result === 'W' && this.getTeam('Attacking').includes(reportingUser)) ||
            (result === 'L' && this.getTeam('Defending').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'Attacking',
                'Defending'
            );
        }

        if (
            (result === 'L' && this.getTeam('Attacking').includes(reportingUser)) ||
            (result === 'W' && this.getTeam('Defending').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'Defending',
                'Attacking'
            );
        }
    }
}

export default ValorantMatch;
