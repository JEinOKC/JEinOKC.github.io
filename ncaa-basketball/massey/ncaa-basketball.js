'use strict';
var request = require('request');
var parse = require('csv-parse/lib/sync');

class MasseyBBall {
	constructor(){
		this.urls = {
			'inter' : 'https://www.masseyratings.com/scores.php?s=379387&sub=11590&all=1&mode=1&format=1',
			'intra' : 'https://www.masseyratings.com/scores.php?s=379387&sub=11590&all=1&mode=2&format=1',
			'names' : 'https://www.masseyratings.com/scores.php?s=379387&sub=11590&all=1&mode=3&format=2'
		};

		this.teams = {};
		this.games = [];
	}

	handleRequest(requestType,response,callback){
		// console.log({
		// 	'requestType' : requestType,
		// 	'response' : response
		// });

		callback(response);
	}

	sendBasicRequest(requestType){
		

		return new Promise((resolve, reject) => {

			request({
				url: this.urls[requestType], 
				rejectUnauthorized: false,
				method: 'GET'
			}, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			  	resolve(body);
			  }
			  else{
			  	reject(error);
			  }
			}.bind(this));

		});

	}

	parseCSV(input){
		var records = parse(input);
		return records;
	}

	processNameResults(myResults){
		var records = this.parseCSV(myResults);

		for(let i=0;i<records.length;i++){
			let currentRecord = records[i];
			this.teams[parseInt(currentRecord[0].trim())] = currentRecord[1].trim();
		}

		// console.log(this.teams);
		
	}

	determineGameSite(homeFieldNum){
		//(1=home, -1=away, 0=neutral)

		if(homeFieldNum == 1){
			return 'home';
		}
		else if(homeFieldNum == 0){
			return 'neutral';
		}
		else{
			return 'road';
		}
		
	}

	processIntraResults(myResults){
		this.processGamesResults(myResults,true);
	}

	getAllGames(){
		return this.games;
	}

	getAllTeams(){
		return this.teams;
	}

	findName(teamID){
		return typeof this.teams[teamID] !== 'undefined' ? this.teams[teamID] : 'unknown';
	}

	nameTheTeams(){
		for(let i=0;i<this.games.length;i++){
			this.games[i].teamA.name = this.findName(this.games[i].teamA.id);
			this.games[i].teamB.name = this.findName(this.games[i].teamB.id);
		}
	}

	processGamesResults(myResults,isIntra){
		var records = this.parseCSV(myResults);
		for(let i=0;i<records.length;i++){
			let currentRecord = records[i];
			let game = {
				'teamA' : {
					'id' : parseInt(currentRecord[2].trim()),
					'score' : parseInt(currentRecord[4].trim()),
					'site' : this.determineGameSite(currentRecord[3].trim()),
				},
				'teamB' : {
					'id' : parseInt(currentRecord[5].trim()),
					'score' : parseInt(currentRecord[7].trim()),
					'site' : this.determineGameSite(currentRecord[6].trim())
				},
				conference : isIntra
			};

			this.games.push(game);
		}
	}


	processInterResults(myResults){
		this.processGamesResults(myResults,false);
	}



	loadEverything(){
		var teamNames 	= [],
			intraGames 	= [],
			interGames 	= [];

		return new Promise((resolve, reject) => {

			Promise.all([this.loadNames(),this.loadIntra(),this.loadInter()])
				.then((result)=>{
					let nameResults = result[0],
						intraResults = result[1],
						interResults = result[2];																																																
					

					this.processNameResults(nameResults);
					this.processIntraResults(intraResults);
					this.processInterResults(interResults);
					this.nameTheTeams();
					console.log('all games processed');

					console.log(this.games);

					//zip the results and the names
					// this.nameTheGames();

					resolve();
				});

		});



		// this.loadNames()
		// .then((result)=> {
		// 	console.log(result);
		// 	this.loadIntra();
		// })
		// .then((result)=>{
		// 	this.loadInter();
		// })
		// .then((result)=>{
		// 	console.log(result);
		// 	console.log('everything is loaded!! how about that!!');
		// });
	}

	//intra-conference games -->  list games if both teams are members of the selected conference
	loadIntra(){

		return this.sendBasicRequest('intra');

	}

	//inter-conference games --> list games that involve a team outside the selected conference
	loadInter(){

		return this.sendBasicRequest('inter');

	}

	//id/name pairs
	loadNames(){

		return this.sendBasicRequest('names');

	}
};

module.exports = MasseyBBall;