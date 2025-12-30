import Match from './match.js';

class RocketLeagueMatch extends Match {
    constructor(matchID, gameLeader) {
        super(matchID, 'RL', gameLeader, ['Blue', 'Orange']);
    }

    reportResult(result, playersWithMMR, playersWithTotalGames, reportingUser) {
        if (
            (result === 'W' && this.getTeamPlayers('Blue').includes(reportingUser)) ||
            (result === 'L' && this.getTeamPlayers('Orange').includes(reportingUser))
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
            (result === 'L' && this.getTeamPlayers('Blue').includes(reportingUser)) ||
            (result === 'W' && this.getTeamPlayers('Orange').includes(reportingUser))
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
