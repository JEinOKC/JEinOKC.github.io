;(function($){
	'use strict';

	var myBracket = null;
	var evenRatingsWeight = 0;
	var minRatingsWeight = -100;
	var ratingsWeight = 0;

	var buildGame = function(region,parentUL,topTeam,bottomTeam,gameObj,spacerClass){
// gameUUID

	
		var gameUUID = typeof gameObj.gameUUID == 'undefined' ? '' : gameObj.gameUUID;

		
		var gameRegion = typeof region !== 'undefined' ? region : '';
		var topSeed = typeof topTeam.seed !== 'undefined' ? String(topTeam.seed).concat('. ') : '';
		var bottomSeed = typeof bottomTeam.seed !== 'undefined' ? String(bottomTeam.seed).concat('. ') : '';

		// console.log(gameRegion);
		var topText = typeof topTeam.name !== 'undefined' ? topSeed + topTeam.name : '&nbsp;';
		var bottomText = typeof bottomTeam.name !== 'undefined' ? bottomSeed + bottomTeam.name : '&nbsp;';
// console.log(topTeam);
// console.log(myBracket.lookupRating(topText));
		var ancestorId = typeof gameObj.ancestor !== 'undefined' ? gameObj.ancestor.gameUUID : myBracket.getFinalFourRegion(gameRegion);
		
		// console.log({'gameId' : gameUUID,'topTeamAncestor':topTeam.ancestor});
		// console.log({'gameId' : gameUUID,'ancestorId':ancestorId});

		var spacer1 = $('<li>').addClass('spacer').html('&nbsp;');
// console.log(region);
		topTeam = $('<li>')
							.addClass('game')
							.addClass('game-top')
							.html(topText)
							.addClass('game-'+gameUUID)
							.addClass('ancestor-'+ancestorId)
							.addClass('region-'+gameRegion)
							.prop('title','rating = ' + myBracket.lookupRating(topText))
							.data('region',gameRegion)
							.data('gameId',gameUUID)
							.data('ancestor',ancestorId);
		
		var spacer2 = $('<li>').addClass('game-spacer').html('&nbsp;');

		if(typeof spacerClass !== 'undefined'){
			spacer2.addClass(spacerClass);
		}
		
		bottomTeam = $('<li>')
							.addClass('game')
							.addClass('game-bottom')
							.html(bottomText)
							.addClass('game-'+gameUUID)
							.addClass('ancestor-'+ancestorId)
							.addClass('region-'+gameRegion)
							.prop('title','rating = ' + myBracket.lookupRating(bottomText))
							.data('region',gameRegion)
							.data('gameId',gameUUID)
							.data('ancestor',ancestorId);

		var spacer3 = $('<li>').addClass('spacer').html('&nbsp;');







		if(parentUL.is(':empty')){
			parentUL.append(spacer1);
		}

		parentUL.append(topTeam).append(spacer2).append(bottomTeam).append(spacer3);


	};

	var getIndexOfElement = function(myLi){

		var index = $('li').index(myLi);

		return index;
	};

	var findElByGameUUID = function(gameUUID){
		var possibleLis = $("li.game-"+gameUUID);

		return possibleLis;
		// console.log(possibleLis);
	};

	var eraseAncestorText = function(ancestorEl){
		var currentText = ancestorEl.html();

		var otherAncestors = $('li.game-'+ancestorEl.data('ancestor'));//;

		let foundOtherAncestors = true;
		while(foundOtherAncestors){
			
			foundOtherAncestors = false;
			
			for(var i=0;i<otherAncestors.length;i++){
				let currentAncestor = $(otherAncestors[i]);

				if(currentAncestor.html()==currentText){

					currentAncestor.removeClass('winner').html('&nbsp');
					otherAncestors = $('li.game-'+currentAncestor.data('ancestor'));
					foundOtherAncestors = true;
					break;
				}
			}

		}

		ancestorEl.html('&nbsp;');
	};

	//will set a value of the ancestor based on the winner. will also return that ancestor element
	var setWinner = function(myEl,ancestorId){
		var myJqueryEl = $(myEl);
		var ancestorGameLis = findElByGameUUID(ancestorId);
		var arrayOfIndexes = [];
		var indexOfMyEl = getIndexOfElement(myEl);
		var gamesWithSharedAncestor = $('li.ancestor-'+ancestorId);
		var teamsWithSameGame = $('li.game-'+myJqueryEl.data('gameId'));

		var result = myBracket.setWinner(myJqueryEl.data('gameId'),myJqueryEl.text());

		if(typeof result === 'undefined'){
			return;
		}

		// console.log(result);

		// console.log(gamesWithSharedAncestor);

		//if 2 or more games have a lower number, the element will be on the lower bracket
		//if 1 or fewer games have a lower number, the element will be on the upper bracket
		var gamesWithLowerNumber = 0;

		for(var i=0;i<gamesWithSharedAncestor.length;i++){
			let currentIndex = getIndexOfElement(gamesWithSharedAncestor[i]);

			if(currentIndex < indexOfMyEl){
				gamesWithLowerNumber+=1;
			}
		}

		teamsWithSameGame.removeClass('winner');
		$('.game-TournamentWinner').addClass('winner');
		$(myEl).addClass('winner');



		var ancestor = $('li.game-'+result.direction+'.game-'+ancestorId);
		// if(gamesWithLowerNumber > 1){
		// 	ancestor = $('li.game-bottom.game-'+ancestorId);
		// }

		var ancestorHTML = ancestor.html();
		var myElHTML = myJqueryEl.html();



		if(ancestorHTML !== myElHTML && ancestorHTML !== '&nbsp;'){
			//if the other team was chosen as the winner before. erase it
			eraseAncestorText(ancestor);
		}

		ancestor.html(myElHTML);
		ancestor.prop('title',myJqueryEl.prop('title'));

		// .prop('title','rating = ' + myBracket.lookupRating(topText))


		return ancestor;


	};

	var setupWinnerClickers = function(mainObj){
		var allLis = mainObj.find('li.game');

		$(mainObj).on('click','li.game',function(){
			var gameId = $(this).data('gameId');
			var region = $(this).data('region');

			var ancestorId = $(this).data('ancestor');

			var ancestor = setWinner(this,ancestorId);

			// while(typeof ancestor !== 'undefined'){
				
			// 	ancestorId = ancestor.data('ancestor');
			// 	ancestor = setWinner(ancestor,ancestorId);
			// }
			
		});

	};

	var ulLooper = function(myBracket,bracketNodes,level){
		var currUL = $('<ul>').addClass('round');
		var regionCount = 0;

		var gamesObj = {};
		var regionOrderArray = [];
		var finalFour = myBracket.data.finalFour;
		var regionGames = 0;
		var i=0,j=0,k=0;
		for(i=0;i<finalFour.length;i++){
			for(j=0;j<finalFour[i].length;j++){
				regionOrderArray.push(finalFour[i][j]);
			}
		}

		for(k=0;k<regionOrderArray.length;k++){
			let region = regionOrderArray[k];

			regionCount++;
			regionGames = myBracket.findRegionGames(region);

			var gamesToBuildInRegion = {};

			for(i=0; i<regionGames.length; i++){
				var currGame = regionGames[i];

				for(j=0;j<level;j++){
					if(typeof currGame.ancestor == 'undefined'){

						return {'gameCount':0,'element':currUL};
					}
					currGame=currGame.ancestor;
				}

				if(typeof currGame !== 'undefined'){
					gamesToBuildInRegion[currGame.gameUUID] = currGame;
					
				}
					
			}
// console.log(gamesToBuildInRegion);
			var gameCount = 0;
			for(var tmpGameUUID in gamesToBuildInRegion){
				let tmpGame = gamesToBuildInRegion[tmpGameUUID];

				let leftTeam = typeof tmpGame.left !== 'undefined' ? tmpGame.left : {'name':''};
				let rightTeam = typeof tmpGame.right !== 'undefined' ? tmpGame.right : {'name':''};
				
				//this will allow us to label the regions using classes. looking for the mid element to make it look the best
				var spacerClass = gameCount == (Object.keys(gamesToBuildInRegion).length/2) && level === 0 ? 'region-'+region : null;
				
				buildGame(region,currUL,leftTeam,rightTeam,tmpGame,spacerClass);
				gameCount+=1;
			}

		}

		var totalGamesInRound = regionCount * regionGames.length /  Math.pow(2,level) ;

		return {'gameCount':totalGamesInRound,'element':currUL};
	};


	var determineWinner = function(gameArray){

		//if ratings weight == 0, we won't use them and will just use random selection
		if(gameArray.length == 2 && ratingsWeight > minRatingsWeight){
			//we have a good game
			var topTeam = {
				'element' : gameArray[0]
			};
			var bottomTeam = {
				'element' : gameArray[1]
			};

			//if a winner was already chosen, keep the same winner
			if(topTeam.element.hasClass('winner')){
				return topTeam.element;
			}
			else if(bottomTeam.element.hasClass('winner')){
				return bottomTeam.element;
			}

			//no winner yet. lets find the teams' ratings
			topTeam.name = topTeam.element.text();
			bottomTeam.name = bottomTeam.element.text();

			topTeam.rating = myBracket.lookupRating(topTeam.name);
			bottomTeam.rating = myBracket.lookupRating(bottomTeam.name);

			//all ratings are on a scale of -1 to 1. need to normalize and scale it from 0-1
			topTeam.rating = (topTeam.rating+1)/2;
			bottomTeam.rating = (bottomTeam.rating+1)/2;

			topTeam.p_rating = topTeam.rating* (1-bottomTeam.rating);
			bottomTeam.p_rating = bottomTeam.rating* (1-topTeam.rating);

			topTeam.win_odds = topTeam.p_rating/(topTeam.p_rating+bottomTeam.p_rating);
			bottomTeam.win_odds = bottomTeam.p_rating/(topTeam.p_rating+bottomTeam.p_rating);

			var ratingSkewer = ratingsWeight-evenRatingsWeight;
			var favoredTeam = topTeam.win_odds > bottomTeam.win_odds ? topTeam : bottomTeam;
			var underdogTeam = topTeam.win_odds > bottomTeam.win_odds ? bottomTeam : topTeam;

			//closer to 100% odds
			if(ratingSkewer >= 0){
				let diffFrom100 = 1-favoredTeam.win_odds;
				favoredTeam.win_odds = favoredTeam.win_odds + (Math.abs(ratingSkewer)*diffFrom100/100);
				underdogTeam.win_odds = 1-favoredTeam.win_odds;
			}
			else{//closer to 50% odds
				let diffFrom50=favoredTeam.win_odds-0.5;
				favoredTeam.win_odds = favoredTeam.win_odds - (Math.abs(ratingSkewer)*diffFrom50/100);
				underdogTeam.win_odds = 1-favoredTeam.win_odds;
			}


			var randomNumber = Math.random();

			if(randomNumber > favoredTeam.win_odds){
				return underdogTeam.element;
			}
			else{
				return favoredTeam.element;
			}
			

		}

		//either we want random or the array is not of length 2 and must go with random

		//just go random for now:
		var randomIdx = Math.floor(Math.random() * gameArray.length);
		// console.log('random index-->'+randomIdx);
		// console.log(gameArray);
		
		var randomWinner = gameArray[Math.floor(Math.random() * gameArray.length)];

		return randomWinner;

	};

	var scrollToWinner = function(){

		var el = $(".game-TournamentWinner");
		var elOffset = el.offset().top;
		
		
		$('html, body').animate({
	        scrollTop: elOffset - 200
	    }, 1500);

	};

	var generateBracket = function(e){
		// console.log('click!!');
		var myButton = $(e.target);
		var main = myButton.closest('main');
		var myBracket = main.find('div.bracket');

		var rounds = myBracket.find('ul.round');

		for(var i=0;i<rounds.length;i++){
			var myRound = rounds[i];
			var gameElements = $(myRound).find('li.game');

			var gameObject = {};

			for(var j=0;j<gameElements.length;j++){
				// console.log(gameElements[j]);
				var gameId = $(gameElements[j]).data('gameId');
				// console.log(gameId);

				if(typeof gameObject[gameId] === 'undefined'){
					gameObject[gameId] = [];
				}

				gameObject[gameId].push($(gameElements[j]));
			}

			//all the games are sorted into the game object. start clicking off winners
			for(var gameKey in gameObject){

				// console.log(gameKey);
				let currentGame = gameObject[gameKey];
				// console.log('currentGame',currentGame);
				let winner = determineWinner(currentGame);
				// console.log('winner',winner);
				$(winner).trigger('click');

			}


			// console.log(gameObject);


		}

		scrollToWinner();

		// console.log(rounds);


	};

	var ratingsWeightUpdater = function(e){
		var myInput = $(e.target);

		ratingsWeight = myInput.prop('value');
	};

	var resetSlider = function(e){
		var myInput = $('.ratingsSlider');
		myInput.prop('value',evenRatingsWeight);
		ratingsWeight=evenRatingsWeight;
	};

	var buildBracketInstructions = function(){
		var instructions = $('<div>').addClass('instructions')
								.append(
									$('<p>').addClass('text-right')
										.append(
											$('<a>').prop('href','//twitter.com/JEinOKC').html('@JEinOKC')
										)
								)
								.append(
									$('<div>')
										.append(
											$('<h5>').text('Instructions')
										)
										.append(
											$('<dl>')
												.append(
													$('<dt>').text('Use the slider to change the sensitivity of predictions')
												)
												.append(
													$('<dd>').text('keep the slider in the middle for the best accuracy. Move it to the right if you hate adventure.')
												)
												.append(
													$('<dt>').text('Manually select a game\'s winner by clicking on their name')
												)
												.append(
													$('<dd>').text('Allow your favorite team to skate unskathed all the way into the championship game and just generate everything else.')
												)
										)
								);
		return instructions;

	};

	var buildBoard = function(){


		$.when(
			$.get('https://static.jameseng.land/ncaa-basketball/data/ratings-latest.json'),
			$.get('https://static.jameseng.land/ncaa-basketball/bracketology/data/in/bracket-information-2024.json')
		).done(function(ratingsResp,bracketResp){

			var bracketJSON = bracketResp[0];
			var ratingsJSON = ratingsResp[0];

			myBracket = new Bracketology(bracketJSON,ratingsJSON);
			var allULs = [];

			var bracketNodes = myBracket.getBracket();

			var main = $('main');

			main.empty();

			main

				.append(
					$('<div>')
						.addClass('row')
						.append(
							$('<div>')
								.addClass('options-column').addClass('col-xs-12').addClass('col-sm-12').addClass('col-md-6')
								.append(
									$('<label>')
										.addClass('slider-holder')
										.append(
											$('<span>').addClass('madness-text').text('madness |').prop('title','Ratings be damned. Bring on the "madness"')
										)
										.append(
											$('<input>')
												.addClass('ratingsSlider')
												.prop('type','range')
												.prop('step',1)
												.prop('min',minRatingsWeight)
												.prop('max',(minRatingsWeight*-1))
												.prop('value',ratingsWeight)
												.change(ratingsWeightUpdater)
										)
										.append(
											$('<span>').addClass('march-text').text('| march').prop('title','top rated teams will "March" towards the championship')
										)
										.append(
											$('<span>')
										)
									)


						)
						.append(
							$('<div>')
								.addClass('options-column').addClass('col-xs-12').addClass('col-sm-12').addClass('col-md-6').addClass('text-right')
								.append(
									$('<button>').text('Clear Board').addClass('btn').addClass('btn-danger').addClass('clear-board-btn').click(buildBoard)
								)
								.append(
									$('<button>').text('Reset Slider').addClass('btn').addClass('btn-default').addClass('reset-slider-btn').click(resetSlider)
								)
								.append(
									$('<button>').text('Generate Bracket').addClass('btn').addClass('btn-success').addClass('generate-bracket-btn').click(generateBracket)
								)
						)
				
								
			);


			main.append($('<div>').addClass('clearfix'));
			main.append($('<hr>'));

			




			var bracketDiv = $('<div>').addClass('bracket').append(buildBracketInstructions());
			main.append(bracketDiv);

			

			//loop through all levels of the regional rounds of the tournament
			var roundGameCount = 0;
			var level = 0;
			do{
				var looperResult = ulLooper(myBracket,bracketNodes,level);
				roundGameCount = looperResult.gameCount;
				
				if(roundGameCount > 0){
					bracketDiv.append(looperResult.element);	
				}
				
				level+=1;

			}
			while(roundGameCount >=1);


			//need to connect the regions for the championship games
			var finalFourUL = $('<ul>').addClass('round');

			var finalFour = myBracket.data.finalFour;
			
			//build the final four
			for(var i=0;i<finalFour.length;i++){
				buildGame(
					'finalFour',
					finalFourUL,
					{'name':''},
					{'name':''},
					{
						'gameUUID' : myBracket.getFinalFourRegion(finalFour[i][0]),
						'ancestor': {'gameUUID' : 'ChampionshipGame'}
					}
				);
			}
			

			//build the championship
			var championshipGameUL = $('<ul>').addClass('round');
			buildGame(
				'ChampionshipGame',
				championshipGameUL,
				{'name':''},
				{'name':''},
				{
					'gameUUID' : 'ChampionshipGame',
					'ancestor': {'gameUUID' : 'TournamentWinner'}
				}
			);

			bracketDiv.append(finalFourUL);
			bracketDiv.append(championshipGameUL);
			setupWinnerClickers(bracketDiv);


			var championUL = $('<ul>')
									.addClass('champion')
									.addClass('round')
									.append(
										$('<li>')
												.addClass('game')
												.addClass('game-top')
												.addClass('winner')
												.addClass('game-TournamentWinner')
												.data('gameId','TournamentWinner')
												.html('&nbsp;&nbsp;&nbsp;')
			);

			bracketDiv.append(championUL);

		});

	};

	buildBoard();

	
})(jQuery);