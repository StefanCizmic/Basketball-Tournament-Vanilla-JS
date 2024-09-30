import groupsJSON from './data/groups.json' with {type: 'json'};
let groups = groupsJSON;

// DOM

const musicButtons = document.querySelectorAll('.fa-volume-high, .fa-volume-xmark');
const song = document.getElementById('song');
const playButton = document.getElementById("play-button");
const heading = document.getElementById('tournament-heading');
const playMsg = document.getElementById('play-msg');
const groupsContainer = document.getElementById('groups-container');

// TOURNAMENT LOGIC 

let groupStage = {};
let groupStageStatistics = {};
let hat = {
  D: [],
  E: [],
  F: [],
  G: [],
};
let quarterFinals = {};
let semiFinals = {};
let finals = {};

const getWinProbability = (team1, team2) => {
  const teamOneProbability = +(
    (team2.FIBARanking / (team1.FIBARanking + team2.FIBARanking)) *
    100
  ).toFixed(2);
  const teamTwoProbability = +(
    (team1.FIBARanking / (team1.FIBARanking + team2.FIBARanking)) *
    100
  ).toFixed(2);
  return {
    Odds1: teamOneProbability,
    Odds2: teamTwoProbability,
  };
};

const getResults = (odds, team1, team2) => {
  const winnerShots = Math.floor(Math.random() * (120 - 100) + 100);
  const loserShots = Math.floor(Math.random() * (100 - 80) + 80);
  if (odds.Odds1 > odds.Odds2) {
    return {
      Result1: winnerShots,
      Result2: loserShots,
      Won: team1.Team,
      Lost: team2.Team,
    };
  } else if (odds.Odds1 < odds.Odds2) {
    return {
      Result1: loserShots,
      Result2: winnerShots,
      Won: team2.Team,
      Lost: team1.Team,
    };
  } else;
};

const generateMatchs = (stage, team) => {
  for (let group in team) {
    const teams = team[group];
    stage[group] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const odds = getWinProbability(teams[i], teams[j]);
        const results = getResults(odds, teams[i], teams[j]);
        stage[group].push({
          Match: {
            Team1: teams[i],
            Team2: teams[j],
          },
          Odds: {
            ...odds,
          },
          Result: {
            ...results,
          },
        });
      }
    }
  }
  return stage;
};

const displayMatches = (teams) => {
  for (let groupSt in teams) {
    console.log(`Group: ${groupSt}`);
    teams[groupSt].map((match) => {
      console.log(
        `${match.Match.Team1.Team} vs ${match.Match.Team2.Team} = ${match.Result.Result1} : ${match.Result.Result2}`
      );
      console.log(`Won: ${match.Result.Won}`);
      console.log(`Lost: ${match.Result.Lost}`);
      console.log(`-----------------------`);
    });
  }
};

const createGroupStageStatistics = () => {
  for (let group in groups) {
    const teamNames = groups[group];
    groupStageStatistics[group] = [];
    teamNames.map((team) => {
      let teamName = team.Team;
      groupStageStatistics[group].push({
        TeamName: teamName,
        Won: 0,
        Lost: 0,
        Points: 0,
        ScoredShoots: 0,
        ReceivedShoots: 0,
        Differential: 0,
      });
    });
  }
};

const getGroupStageStatistics = () => {
  for (let groupSt in groupStage) {
    groupStage[groupSt].map((matchs) => {
      for (let groupStatistics in groupStageStatistics)
        groupStageStatistics[groupStatistics].map((teamStat) => {
          if (matchs.Result.Won === teamStat.TeamName) {
            teamStat.Won++;
          }
          if (matchs.Result.Lost === teamStat.TeamName) {
            teamStat.Lost++;
          }
          if (matchs.Match.Team1.Team === teamStat.TeamName) {
            teamStat.ScoredShoots += matchs.Result.Result1;
          }
          if (matchs.Match.Team2.Team === teamStat.TeamName) {
            teamStat.ScoredShoots += matchs.Result.Result2;
          }
          if (matchs.Match.Team1.Team === teamStat.TeamName) {
            teamStat.ReceivedShoots += matchs.Result.Result2;
          }
          if (matchs.Match.Team2.Team === teamStat.TeamName) {
            teamStat.ReceivedShoots += matchs.Result.Result1;
          }
          teamStat.Points = teamStat.Won * 2 + teamStat.Lost;
          teamStat.Differential =
            teamStat.ScoredShoots - teamStat.ReceivedShoots;
          if (teamStat.Differential < 0) {
            teamStat.Differential =
              -1 * (teamStat.ScoredShoots - teamStat.ReceivedShoots);
          } else;
        });
    });
  }
};

const displayGroupStageStatistics = () => {
  for (let groupStatistics in groupStageStatistics) {
    const sorted = groupStageStatistics[groupStatistics].sort(
      (a, b) => (b.Points || b.ScoredShoots) - (a.Points || a.ScoredShoots)
    );
    console.log(`Group: ${groupStatistics}`);
    sorted.map((teamStat) => {
      console.log(
        `${teamStat.TeamName} / ${teamStat.Won} / ${teamStat.Lost} / ${teamStat.Points} / ${teamStat.ScoredShoots} / ${teamStat.ReceivedShoots} / ${teamStat.Differential}`
      );
    });
  }
};

const getRanks = () => {
  let filteredTeams = {};
  let ranked = [];
  for (let groupStatistics in groupStageStatistics) {
    filteredTeams[groupStatistics] = [];
    const teams = groupStageStatistics[groupStatistics];
    const lowestPoints = Math.min(...teams.map((team) => team.Points));
    filteredTeams[groupStatistics] = teams.filter(
      (team) => team.Points > lowestPoints
    );
  }
  for (let group in filteredTeams) {
    const teams = filteredTeams[group];
    const firstPlacePoints = Math.max(...teams.map((team) => team.Points));
    const thirdPlacePoints = Math.min(...teams.map((team) => team.Points));
    const firstPlaceTeams = teams.filter((team) =>
      team.Points === firstPlacePoints ? team.TeamName : ""
    );
    const secondPlaceTeams = teams.filter(
      (team) => team.Points < firstPlacePoints && team.Points > thirdPlacePoints
    );
    const thirdPlaceTeams = teams.filter((team) =>
      team.Points === thirdPlacePoints ? team.TeamName : ""
    );
    ranked.push(...firstPlaceTeams, ...secondPlaceTeams, ...thirdPlaceTeams);
  }
  ranked.sort(
    (a, b) => (b.Points && b.ScoredShoots) - (a.Points && a.ScoredShoots)
  );
  ranked.map((rankedTeam, index) => {
    for (let group in groups) {
      groups[group].map((team) => {
        if (rankedTeam.TeamName === team.Team) {
          if (index < 8) {
            if (index < 2) {
              hat.D.push(team);
            } else if (index < 4) {
              hat.E.push(team);
            } else if (index < 6) {
              hat.F.push(team);
            } else if (index < 8) {
              hat.G.push(team);
            }
          }
        }
      });
    }
  });
};

const displayRankedTeams = () => {
  for (let key in hat) {
    console.log(`${key}:`);
    hat[key].map((team) => {
      console.log(`  ${team.Team}`);
    });
  }
};

const getQuarterFinals = () => {
  const groupPairs = [
    ["D", "G"],
    ["E", "F"],
  ];
  groupPairs.map(([group1, group2]) => {
    const teams1 = hat[group1];
    const teams2 = hat[group2];
    quarterFinals[`${group1}-${group2}`] = [];
    for (let i = 0; i < Math.min(teams1.length, teams2.length); i++) {
      const odds = getWinProbability(teams1[i], teams2[i]);
      const results = getResults(odds, teams1[i], teams2[i]);
      quarterFinals[`${group1}-${group2}`].push({
        Match: {
          Team1: teams1[i],
          Team2: teams2[i],
        },
        Odds: {
          ...odds,
        },
        Result: {
          ...results,
        },
      });
    }
  });
};

const displayQuarterFinals = () => {
  for (let knockout in quarterFinals) {
    const knockouts = quarterFinals[knockout];
    knockouts.map((match) => {
      console.log(`${match.Match.Team1.Team} - ${match.Match.Team2.Team}`);
    });
  }
};

const filterGames = (game) => {
  let winnerNames = [];
  let winners = {};
  for (let quarter in game) {
    const quarterGames = game[quarter];
    winners[quarter] = [];
    quarterGames.map((match) => {
      const winner = match.Result.Won;
      winnerNames.push(winner);
      if (winner === match.Match.Team1.Team) {
        winners[quarter].push(match.Match.Team1);
      } else if (winner === match.Match.Team2.Team) {
        winners[quarter].push(match.Match.Team2);
      }
    });
  }
  return winners;
};

const getSemiFinals = () => {
  const winners = filterGames(quarterFinals);
  semiFinals = generateMatchs(semiFinals, winners);
};

const getFinals = () => {
  const winners = filterGames(semiFinals);
  const team1 = winners["D-G"][0];
  const team2 = winners["E-F"][0];
  const odds = getWinProbability(team1, team2);
  const results = getResults(odds, team1, team2);
  finals["Final Match"] = [
    {
      Match: {
        Team1: team1,
        Team2: team2,
      },
      Odds: {
        ...odds,
      },
      Result: {
        ...results,
      },
    },
  ];
};

console.log(`                                BASKETBALL TOURNAMENT`);
generateMatchs(groupStage, groups);
console.log(`GROUP STAGE MATCHES`);
displayMatches(groupStage);
console.log(`GROUP STAGE STATISTICS`);
createGroupStageStatistics();
getGroupStageStatistics();
displayGroupStageStatistics();
console.log(`-----------------------`);
console.log(`DRAW`);
getRanks();
displayRankedTeams();
console.log(`-----------------------`);
console.log(`KNOCKOUT STAGE`);
getQuarterFinals();
displayQuarterFinals();
console.log(`-----------------------`);
console.log(`QUARTERFINALS MATCHES`);
displayMatches(quarterFinals);
console.log(`SEMIFINALS MATCHES`);
filterGames();
getSemiFinals();
displayMatches(semiFinals);
console.log(`FINALS`);
getFinals();
displayMatches(finals);

// EVENT LISTENERS

let isMusicPlaying = false;
musicButtons.forEach(button => {
  button.addEventListener('click', () => {
      if (button.classList.contains('fa-volume-xmark')) {
          song.play();
          musicButtons[0].style.display = 'block';
          musicButtons[1].style.display = 'none'; 
      } else {
          song.pause();
          musicButtons[0].style.display = 'none';
          musicButtons[1].style.display = 'block'; 
      }
      isMusicPlaying = !isMusicPlaying; 
  });
});

playButton.addEventListener("click", () => {
  playButton.style.display = "none";
  heading.innerText = 'Teams';
  for (let group in groups) {
      const teams = groups[group];
      const cards = document.createElement('div');
      cards.classList.add('group-card');
      const cardGroups = document.createElement('h3');
      cardGroups.innerText = `Group ${group}`;
      cards.appendChild(cardGroups);
      teams.forEach(team => {
          const teamsP = document.createElement('p');
          teamsP.innerText = `${team.Team} ${team.FIBARanking}`;
          cards.appendChild(teamsP);
      });
      groupsContainer.appendChild(cards);
  }
  setTimeout(() => {
  playMsg.style.visibility = 'visible';
  }, 4000)
});

playMsg.addEventListener('click', () => {
  playMsg.style.display = 'none';
  groupsContainer.style.display = 'none';
});