import Match from './match.js';

class RocketLeagueMatch extends Match {
    constructor(matchID, gameLeader) {
        super(matchID, gameLeader, ['Blue', 'Orange']);
    }

    reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser) {
        if (
            (result === 'W' && this.getTeam('Blue').includes(reportingUser)) ||
            (result === 'L' && this.getTeam('Orange').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'Blue',
                'Orange'
            );
        }

        if (
            (result === 'L' && this.getTeam('Blue').includes(reportingUser)) ||
            (result === 'W' && this.getTeam('Orange').includes(reportingUser))
        ) {
            return super.reportResult(
                result,
                playersWithMMR,
                playersWithTotalGames,
                reportingUser,
                'Orange',
                'Blue'
            );
        }
    }
}

export default RocketLeagueMatch;
