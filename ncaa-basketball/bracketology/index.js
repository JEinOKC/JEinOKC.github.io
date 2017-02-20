'use strict';



class Bracketology{
	constructor(data,ratingsArray){
		this.data = data;
		this.ratingsArray=ratingsArray;
		this.ratings = {};

		this.nodeBracket = this.buildGames();
		
	}
	getData(){
		return this.data;
	}

	getTeamOrder(size){

		if(size == 16){
			return [1,16,8,9,5,12,4,13,6,11,14,3,10,7,15,2];	
		}
		else if(size == 8){//cut the array down for 8
			return [1,8,5,4,6,3,7,2];	
		}
		else if(size == 4){
			return [1,4,3,2];		
		}
		else if(size == 2){
			return [1,2];
		}

		throw "unable to sort an array of that size";

	}

	getBracket(){
		return this.nodeBracket;
	}

	createNode(){
		return {
			'left' : null,
			'right' : null,
			'winner' : null,
			'score' : null
		}
	}

	placeTeamInNodeArray(nodeArray,team,leftOrRight){
		//each team element must be an object. we will assign an ancestor value into that object, so if it is anything else, we will create an object and push the definition into 'value'
		if(typeof team !== 'object'){
			team.value = team;
		}

		if(leftOrRight == 'left'){
			//left branches get filled first, so only the last one needs to be checked
			if(nodeArray[nodeArray.length-1].left === null){
				nodeArray[nodeArray.length-1].left = team;
				team.ancestor = nodeArray[nodeArray.length-1]
				return nodeArray;

			}

			//all branches are full. add a node to the nodeArray and with current team on the left
			var newNode = this.createNode();
			newNode.left = team;
			team.ancestor = newNode;
			nodeArray.push(newNode);
			return nodeArray;
		}
			
		else{
			for(var i=nodeArray.length-1;i>=0;i--){//if all left branches are taken, go for the right branches
				if(nodeArray[i].right == null){
					nodeArray[i].right = team;
					team.ancestor=nodeArray[i];
					return nodeArray;
				}
			}

			//all branches are full. add a node to the nodeArray and with current team on the left
			var newNode = this.createNode();
			newNode.right = team;
			team.ancestor=newNode;
			nodeArray.push(newNode);
			return nodeArray;
		}
			

		

	}

	buildWeeks(nodeArray){
		var arrayLen = nodeArray.length;
		//at the top
		if(arrayLen % 2 == 1){
			return nodeArray;
		}
		else{
			let newNodeArray = [this.createNode()];

			for(var i=0;i<arrayLen;i++){

				let leftOrRight = (i%2==0?'left':'right');
				newNodeArray = this.placeTeamInNodeArray(newNodeArray,nodeArray[i],leftOrRight);
			}

			return this.buildWeeks(newNodeArray);
		}

	}

	determineWinner(team1,team2,weight){
		/*should look up the ratings for each team, considering the weigh, and return a winner*/
	}

	lookupRating(teamName){

		var teamNameArray = teamName.split('/');

		if(teamNameArray.length > 1){
			// console.log(teamNameArray);
			let totalScore = 0;
			let totalTeams = teamNameArray.length; 
			for(var j=0;j<teamNameArray.length;j++){

				let tempTeamName = teamNameArray[j].trim();
				let tempTeamScore = Number(this.lookupRating(tempTeamName));
				// console.log({
				// 	'name':tempTeamName,
				// 	'score':tempTeamScore
				// });
				totalScore+=tempTeamScore;

			}	

			//return an average
			// console.log(totalScore/totalTeams);
			return totalScore/totalTeams;
		}
		


		//format the team name to replace leading rating numbers
		//format the team name to replace the spaces with underscores

		teamName = teamName.replace(/^\d+\.\s*/, '').replace(/ /g,"_");
		// console.log(teamName);
		if(teamName == ''){
			return 0;
		}

		//match team name (or if separated by slash - multiple names) to our rating score
		if(typeof this.ratings[teamName] !== 'undefined'){
			return this.ratings[teamName];
		}

		if(typeof this.ratingsArray !== 'undefined'){
			// console.log(this.ratingsArray);

			for(var i=0;i<this.ratingsArray.length;i++){
				if(teamName == this.ratingsArray[i].team_name){
					// console.log(teamName+"'s rating is " +this.ratingsArray[i].rating[0]);
					return this.ratingsArray[i].rating[0];
				}
			}
		}

		// return 0;
		if(teamName != '&nbsp;'){
			console.log('cannot find a rating for ' + teamName);	
		}
		
		return Math.random().toFixed(4);
	}

	buildGames(){
		var myTeams 	= this.data.teams;
		var treeBuilt	= false;
		var allRegions	= {};
		// console.log(myTeams);

		//loop through each region. for basketball, each region is an array of 16 teams
		for(var region in myTeams){
			let nodeArray = new Array(myTeams[region].length);

			var sortedArr = this.getTeamOrder(myTeams[region].length);

			//we know the teams are sorted 1-16
			for(var i=0;i<myTeams[region].length;i++){
				let leftOrRight = (i<(myTeams[region].length/2)?'left':'right');
				// console.log(leftOrRight);
				let currentTeam = {
					'name' : myTeams[region][i],
					'seed' : i+1,
					'rating' : this.lookupRating(myTeams[region][i])
				};

				this.ratings[currentTeam.name] = currentTeam.rating;
				this.ratings[currentTeam.seed + '. ' + currentTeam.name] = currentTeam.rating;

				this.ratings[currentTeam.name.replace(/ /g,"_")] = currentTeam.rating;
				this.ratings[(currentTeam.seed + '. ' + currentTeam.name).replace(/ /g,"_")] = currentTeam.rating;
				

				let arrayPos = 0;
				for(var j=0;j<sortedArr.length;j++){
					if(sortedArr[j]==currentTeam.seed){
						nodeArray[j] = currentTeam;
						break;
					}
				}

				// console.log(nodeArray);
				
			}

			let fullRegion = this.buildWeeks(nodeArray);

			allRegions[region] = fullRegion;
			// console.log(JSON.stringify(fullRegion,undefined,4));
		}

		return allRegions;
		//at this point, all regions are built. need to connect them together
// console.log(allRegions);
// console.log(this.data.finalFour);

		var FinalFourNode1 = this.createNode();
			FinalFourNode1.left = allRegions[this.data.finalFour[0][0]];
			FinalFourNode1.right = allRegions[this.data.finalFour[0][1]];
			FinalFourNode1.foo="FinalFourNode1";

			allRegions[this.data.finalFour[0][0]].ancestor=FinalFourNode1;
			allRegions[this.data.finalFour[0][1]].ancestor=FinalFourNode1;

		var FinalFourNode2 = this.createNode();
			FinalFourNode2.left = allRegions[this.data.finalFour[1][0]];
			FinalFourNode2.right = allRegions[this.data.finalFour[1][1]];
			FinalFourNode2.foo="FinalFourNode2";

			allRegions[this.data.finalFour[1][0]].ancestor=FinalFourNode2;
			allRegions[this.data.finalFour[1][1]].ancestor=FinalFourNode2;

		var ChampionshipNode = this.createNode();
			ChampionshipNode.left = FinalFourNode1;
			ChampionshipNode.right = FinalFourNode2;

			FinalFourNode1.ancestor = ChampionshipNode;
			FinalFourNode2.ancestor = ChampionshipNode;

		var returnObj = {'NCAA':ChampionshipNode};
		return returnObj;
		// var newNode = 
		// 	newNode.left = team;
		// 	team.ancestor = newNode;
		// 	nodeArray.push(newNode);

		// return allRegions;

		// console.log(JSON.stringify(allRegions,undefined,4));


	}

	printNode(myNode,nodeDepth){
		var leftOrRight = '';
		if(typeof myNode.ancestor !== 'undefined'){
			leftOrRight = myNode.ancestor.left == myNode ? 'left' : 'right';
			// console.log(leftOrRight);	
		}

		if(typeof myNode.left !== 'undefined'){
			this.printNode(myNode.left,nodeDepth-1);
		}

		// console.log(nodeDepth);
		let stupidString = '-----------------';
		while(stupidString.length < nodeDepth*40){
			stupidString = ' ' + stupidString;
		}

		if(stupidString.length > 0){
			console.log(stupidString);
		}

		if(typeof myNode.right !== 'undefined'){
			this.printNode(myNode.right,nodeDepth-1);
			// console.log('------');
		}

		if(
			typeof myNode.name !== 'undefined' 
			&& 
			typeof myNode.seed !== 'undefined'
													){
			// console.log('('+leftOrRight+') - ' + myNode.seed + '. ' + myNode.name);
		console.log(myNode.seed + '. ' + myNode.name);
		// console.log('('+nodeDepth+') - ' + myNode.seed + '. ' + myNode.name);
		}



		

		

		// console.log(typeof myNode.ancestor);

	}

	searchNodeDepth(myNode){
		var totalDepth = 0;
		while(typeof myNode.left !== 'undefined'){
			totalDepth+=1;
			myNode=myNode.left;
		}

		return totalDepth;
	}

	printRegion(region){

		for(var i=0;i<region.length;i++){
			let myNode = region[i];
			let nodeDepth = this.searchNodeDepth(myNode);
			this.printNode(myNode,nodeDepth);
		}

	}

	getUUID(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	}

	getFinalFourRegion(regionName){
		var finalFourInfo = this.data.finalFour;

		for(var i=0;i<finalFourInfo.length;i++){
			var game = finalFourInfo[i];
			var foundGame=false;
			var gameConcat = '';
			for(var j=0;j<game.length;j++){
				gameConcat = gameConcat+game[j];
				if(game[j]==regionName){
					foundGame = true;
				}
			}

			if(foundGame){
				// console.log('found a game -->'+gameConcat);
				return gameConcat;
			}

		}

		return '';
		
	}

	findNodeGames(myArray,myNode){
		// console.log(myNode);

		if(typeof myNode === 'undefined' || typeof myNode.left === 'undefined' || typeof myNode.right === 'undefined'){
			return;
		}

		if(typeof myNode.gameUUID === 'undefined'){
			myNode.gameUUID = this.getUUID();
		}

		//at the end of the tree
		if(typeof myNode.left !== 'undefined' && typeof myNode.right !== 'undefined'){
			this.findNodeGames(myArray,myNode.left);
			this.findNodeGames(myArray,myNode.right);
		}
		
		if(typeof myNode.left.name !== 'undefined' && typeof myNode.right.name !== 'undefined'){
			myArray.push(myNode);
		}

	}

	findRegionGames(region){

		var results = [];
		var regionData = this.nodeBracket[region];
		for(var i=0;i<region.length;i++){
			let myNode = regionData[i];
			// myNode.region = region;
			// let nodeDepth = this.searchNodeDepth(myNode);
			this.findNodeGames(results,myNode);
		}

		for(i=0;i<results.length;i++){
			results[i].region=region;
		}
		// console.log('region = ' + region);
		// console.log('result length = ' + results.length);
// console.log(results);
		return results;

	}

	print(){
		for(var region in this.nodeBracket){
			console.log('Region ' + region);
			console.log('------------------');
			this.printRegion(this.nodeBracket[region]);
		}
	}


}; 

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports = Bracketology;
}
else{
  	window.Bracketology = Bracketology;
}