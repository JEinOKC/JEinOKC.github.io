'use strict';

var MasseyBBall = require('./massey/ncaa-basketball');
var MatrixWorker = require('./MatrixWorker');
var rankingMethods = require('generic-ranking-methods');
var fs = require('fs');
var _ = require('lodash');

var myMasseyBBall = new MasseyBBall();

var determinePointDiff = function(homeScore,roadScore,isInConference){
	//home score is already altered for home field advantage

	var totalScore = homeScore + roadScore;
    var winnerPoints = totalScore;
    var loserPoints = 0;
    var ptDiff = 0;
    var ratio = 0;

    
    if(homeScore > roadScore){
        winnerPoints = homeScore;
        loserPoints = roadScore;
    }
    else{
    	winnerPoints = roadScore;
    	loserPoints = homeScore;
    }

  	if(isNaN(winnerPoints/totalScore)){
  		return ratio;
  	}
  		
	ratio = winnerPoints/totalScore;

  	if(isInConference){
  		ratio = ratio * 1.1;
  	}
console.log('ratio = ' + ratio);
    return ratio;
}

var getHomeFieldAdvantageAverage = function(masseyGames){
	var homePoints = 0;
	var roadPoints = 0;
	var gamesCount = 0;

	for(let i=0;i<masseyGames.length;i++){
		let currentGame = masseyGames[i];

		if(currentGame.teamA.site == 'home'){
			homePoints += currentGame.teamA.score;
			roadPoints += currentGame.teamB.score;
		}
		else if(currentGame.teamA.site == 'road'){
			homePoints += currentGame.teamB.score;
			roadPoints += currentGame.teamA.score;
		}

		gamesCount+=1;//gamesCount != length because of neutral site games

	}

	let ptDiffCnt = homePoints - roadPoints;

	let HomeFieldAdv = ptDiffCnt/gamesCount;

	console.log('home court advantage calculated as ' + HomeFieldAdv + ' points per game');

	return HomeFieldAdv;

}


var formatTeams = function(allTeams){
	var formattedTeams = [];

	/*
		allTeams is an object - not an array. Keys = id. Value = team name

		formate we need to get it into:

		{
			"team_id": 1,
			"team_name": "New York"
		}
	*/

	for(let key in allTeams){
		let newTeam = {
			'team_id' : key,
			'team_name' : allTeams[key]
		};

		formattedTeams.push(newTeam);
	}

	return formattedTeams;
}

var formatGames = function(allGames,HomeFieldAdv){
	var formattedGames = [];

	/*
		format of array item:
		{
			'teamA' : {
				'id' : integer
				'score' : integer
				'site' : home|neutral|road
			},
			'teamB' : {
				'id' : integer
				'score' : integer
				'site' : home|neutral|road
			},
			conference : true|false
		}

		format we need to get it into:
		{
			"calcs": {
				"home_team_code": 1,
				"opponent_code": 2,
				"ptDiff" : 14, 
				"homeRep" : 1,
				"awayRep" : -1
			}

		}



	*/

	for(let i=0;i<allGames.length;i++){
		let currentGame = allGames[i];
		let currentHomeTeam = 'teamA';
		let isNeutralSite = false;

		if(currentGame.teamB.site == 'home'){
			currentHomeTeam = 'teamB';
		}
		else if(currentGame.teamB.site == 'neutral'){
			isNeutralSite = true;
		}

		if(!isNeutralSite){
			currentGame[currentHomeTeam.score] = currentGame[currentHomeTeam.score] - HomeFieldAdv;
		}

		let currentRoadTeam = ( currentHomeTeam == 'teamA' ? 'teamB' : 'teamA' );

		let calcs = {
			'home_team_code' : currentGame[currentHomeTeam].id,
			'opponent_code' : currentGame[currentRoadTeam].id,
			'ptDiff' : determinePointDiff(currentGame[currentHomeTeam].score,currentGame[currentRoadTeam].score,currentGame.conference),
			'homeRep' : ( currentGame[currentHomeTeam].score > currentGame[currentRoadTeam].score ? 1 : -1 ),
			'awayRep' : ( currentGame[currentHomeTeam].score < currentGame[currentRoadTeam].score ? 1 : -1 )
		};


		if(calcs.ptDiff != 0){
			formattedGames.push({'calcs':calcs});
		}

		
	}

	return formattedGames;
};

var buildRatings = function(teams,results){

	for(var i=0;i<teams.length;i++){
		teams[i].rating = results[i][0];
	}

	teams = _.sortBy(teams,'rating').reverse();

	for(i=0;i<teams.length;i++){
		teams[i].rank = i+1;
		console.log(teams[i]);
	}

	let top25 = [];
	for(i=0;i<25;i++){
		let tmpTeam = teams[i];
		top25.push(tmpTeam.rank + ". " + tmpTeam.team_name);
	}

	let myDate = new Date();
	let myDateString = (myDate.getMonth() + 1) + "." + myDate.getDate() + "." + myDate.getFullYear();


	fs.writeFileSync('./data/ratings-'+myDateString+'.json',JSON.stringify(teams, null, 4));
	fs.writeFileSync('./data/ratings-latest.json',JSON.stringify(teams, null, 4));
	fs.writeFileSync('./data/top-25-'+myDateString+'.json',JSON.stringify(top25, null, 4));

};

myMasseyBBall.loadEverything()
	.then(()=>{
		
		//now that all the games have been pulled from online, I need to convert the results into what the generic ranking methods can understand

		
		// console.log(allGames[100]);		
		let masseyGames = myMasseyBBall.getAllGames();
		let HFA = getHomeFieldAdvantageAverage(masseyGames);
		let formattedGames = formatGames(masseyGames,HFA);
		let formattedTeams = formatTeams(myMasseyBBall.getAllTeams());

		//run the rankings
		
		try{
			let results = rankingMethods.Run(formattedTeams, formattedGames);	
			
			// let myMatrixWorker = new MatrixWorker();
			// fs.writeFileSync('./data/teams.json',JSON.stringify(formattedTeams, null, 4));
			// let results = myMatrixWorker.run(formattedTeams, formattedGames);
			// fs.writeFileSync('./data/results.json',JSON.stringify(results, null, 4));
			buildRatings(formattedTeams,results);
			// console.log(results);
			console.log('done');
		}
		catch(err){
			console.log(err);
		}
		
	})
	.catch((reason)=>{
        console.log('Handle rejected promise ('+reason+') here.');
	});


// myMasseyBBall.loadIntra(function(result){
// 	console.log(result);
// });