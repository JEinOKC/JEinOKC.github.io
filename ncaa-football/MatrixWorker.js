'use strict';

class MatrixWorker {
	constructor(){
		this.math = require('mathjs');
	};

	create2Darray(x,y){
		var arr = new Array(x);

	    for(var i=0;i<x;i++){
	    	arr[i] = new Array(y);
	    	for(var j=0;j<y;j++){
	    		arr[i][j]=0;
	    	}
	    }
	    
	    return arr;
	};

	matrixTemplates(gameCount,teamCount){
		return {
			'gameMatrixArray' : this.create2Darray(gameCount, teamCount),
			'diffMatrixArray' : this.create2Darray(gameCount, 1)
		};
	};

	populateMatrices(myMatrices,TeamArray,scheduleArray){
		let zeroArr = [];//array of rows/columns with all 0s

		for(var i=0;i<scheduleArray.length;i++){
			let Game = scheduleArray[i].calcs;

			let foundCount = 0;

			for(var j=0;j<TeamArray.length;j++){
				var tmpTeam = TeamArray[j];
				if(tmpTeam.team_id == Game.home_team_code){
					// console.log("MATCH!!");
					foundCount++;
					myMatrices.gameMatrixArray[i][j] = Game.homeRep;
				}
				else if (tmpTeam.team_id == Game.opponent_code){
					// console.log("MATCH!!");
					foundCount++;
					myMatrices.gameMatrixArray[i][j] = Game.awayRep;
				}	
				else{
					myMatrices.gameMatrixArray[i][j] = 0;
				}
					
			}

			if(foundCount == 0){
				zeroArr.push(i);
			}
			else if(foundCount > 1){
				// console.log('found ' + foundCount + ' in row ' + i);
			}

			myMatrices.diffMatrixArray[i][0] = Game.ptDiff;

		}

		// console.log('empty values: ' + zeroArr.length);
		// process.exit(1);
		// fs.writeFileSync('./data/matrix_x.json',JSON.stringify({'matrix':myMatrices.gameMatrixArray}, null, 4));
		// fs.writeFileSync('./data/matrix_y.json',JSON.stringify({'matrix':myMatrices.diffMatrixArray}, null, 4));
		// process.exit(1);

		myMatrices.gameMatrix = this.math.matrix(myMatrices.gameMatrixArray,'sparse');
		myMatrices.diffMatrix = this.math.matrix(myMatrices.diffMatrixArray);

		return myMatrices;
	};

 	matrixMagic(myMatrices){
		var matrix_X = myMatrices.gameMatrix;//an nxn matrix of games played
		var matrix_Y = myMatrices.diffMatrix;//an nx1 matrix of game results
		console.log('transposing the game matrix', new Date());
		var matrix_xTrans = this.math.transpose(matrix_X); //matrix_X.transpose();
		console.log('transposing complete', new Date());
		console.log('creating xTx', new Date());
		var xTx = this.math.multiply(matrix_xTrans,matrix_X); // matrix_xTrans.x(matrix_X);
		console.log('xTx complete', new Date());
		console.log('creating xTy', new Date());
		var xTy = this.math.multiply(matrix_xTrans,matrix_Y); //matrix_xTrans.x(matrix_Y);
		console.log('xTy complete', new Date());

// 		fs.writeFileSync('./data/matrix_x.txt',JSON.stringify(matrix_X, null, 4));
// 		fs.writeFileSync('./data/matrix_y.txt',JSON.stringify(matrix_Y, null, 4));
// process.exit(1);
		// fs.writeFileSync('./data/matrix_xTx.txt',JSON.stringify(xTx, null, 4));


		// fs.writeFileSync('./data/matrix_xTy.txt',JSON.stringify(xTy, null, 4));


		// return;

		// console.log('xTx',xTx);
// console.log('determinite of xTx',this.math.det(xTx));

console.log('matrix magic going well!!!',new Date());
console.log('making inverses', new Date());
		var xtx_Inverse = this.math.inv(xTx);
		// console.log(xtx_Inverse);
		// console.log(xTy);
console.log('inverse created', new Date());
console.log('performing final multiplication', new Date());
		var xtx_Inverse_xTy = this.math.multiply(xtx_Inverse,xTy);
console.log('final product created!!', new Date());		
		// console.log(xtx_Inverse_xTy);
		// process.exit(1);
		return xtx_Inverse_xTy;
	};

	run(teamArray,schedule){
		var myMatrices = this.matrixTemplates(schedule.length, teamArray.length);
		myMatrices = this.populateMatrices(myMatrices,teamArray,schedule);
console.log('matrices populated',new Date());
		let results = this.matrixMagic(myMatrices)._values;
		// console.log(results);
		// process.exit(1);
		return results;
// 		console.log(results);
// 		fs.writeFileSync('./data/results.json',JSON.stringify(results, null, 4));
// console.log('we actually got some results!!! YEEHAAWW!!',new Date());
	};
};

module.exports = MatrixWorker;