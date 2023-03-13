'use strict';
var fs = require('fs');
var path = require('path');
var Bracketology = require(path.join(__dirname,'bracketology'));

var data = JSON.parse( 
	fs.readFileSync(
		path.join(
			__dirname,
			'bracketology/data/in/bracket-information-2023.json'
		),
		'UTF-8'
	) 
);

var ratingsJSON = JSON.parse( 
	fs.readFileSync(
		path.join(
			__dirname,
			'data/ratings-latest.json'
		),
		'UTF-8'
	) 
);


var myBracket = new Bracketology(data,ratingsJSON);
// console.log(JSON.stringify(myBracket.getBracket(),undefined,4));
myBracket.print();

// myBracket.buildGames();
// console.log(myBracket.getData());