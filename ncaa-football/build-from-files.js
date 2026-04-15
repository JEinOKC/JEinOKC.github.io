'use strict';
var fs = require('fs');
var _ = require('lodash');

var teams = JSON.parse(fs.readFileSync('./data/teams.json'));
var results = JSON.parse(fs.readFileSync('./data/results.json'));

for(var i=0;i<teams.length;i++){
	teams[i].rating = results[i];
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


fs.writeFileSync('./data/ratings.json',JSON.stringify(teams, null, 4));
fs.writeFileSync('./data/top-25.json',JSON.stringify(top25, null, 4));
