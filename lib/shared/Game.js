import {create2DArray, createID} from './utilities.js';
import Player from './Player.js';
import * as Units from './Unit.js';

const tempConfig = {
	boardDimensions: [20, 30],
	numOfPlayers: 4,
	ticksPerTurn: 40
}

export default class Game {

 	constructor(gameObjects = [], players = [], board = new Object, turnNumber = 1) {
 		this.id = 'game'+createID();
 		this.players = players;
 		this.board = board;
 		this.gameObjects = gameObjects;
 		this.turnNumber =  turnNumber;
 		this.history = {
 			'turn': {}
 		};

 		this.currentPhase = 0;
	}

	init() {

		// create new players
		for (var i = 0; i < tempConfig.numOfPlayers; i++) {
			let newPlayer = new Player(i);
			this.players.push(newPlayer);
		}

		// create empty grid
		this.board = create2DArray(tempConfig.boardDimensions[0],tempConfig.boardDimensions[1]);

		debug.log(0, 'Initialized Game ' + this.id);

	}

	registerGameObject(object) {
		// validate object
		this.gameObjects.push(object);
	}

	deregisterGameObject(object) {
		let idx = this.gameObjects.indexOf(object);
		this.gameObjects.splice(idx, 1);
	}

	addObjectAtCoord(object, x, y) {
		if (this.isValidCoord(x, y)) {
			this.board[y][x].push(object);
		}
	}

	removeObjectAtCoord(object, x, y) {
		const objIndex = this.board[y][x].indexOf(object);
		this.board[y][x].splice(objIndex, 1);
	}

	moveObject(object, old_x, old_y, new_x, new_y) {
		if (this.isValidCoord(new_x, new_y)) {
			this.board[new_y][new_x].push(object);
			this.removeObjectAtCoord(object, old_x, old_y);
		}
		else { 
			this.removeObjectAtCoord(object, old_x, old_y);
			this.deregisterGameObject(object);
		}

	}

	isValidCoord(x, y) {
		if (this.board[y][x] !== undefined) {
			return true;
		}
		else {
			debug.log(0, "Invalid Coord");
			return false;
		}
	}

	runSimulation(ticksPerTurn = tempConfig.ticksPerTurn) {
		// updates game state based on ticks. Sweeps board and updates
		// any game object on the board
		// note: j is x and i is y
		debug.log(0, "Running simulation for turn " + this.turnNumber);
		this.history.turn[this.turnNumber] = {
			'tick': {}
		};

		for (let tick = 1; tick <= ticksPerTurn; tick++) {
			debug.log(0, "Processing tick #" + tick, JSON.parse(JSON.stringify(this.board)));

			// enable movement at beginning of tick
			for (let i = 0; i < this.gameObjects.length; i++) {
				this.gameObjects[i].updatedThisTick = false;
			}

			for (let i = 0; i < this.board.length; i++)  {
				for (let j = 0; j < this.board[i].length; j++) {
					if (this.board[i][j].length != 0) {
						for (let k = 0; k < this.board[i][j].length; k++) {
							let gameObj = this.board[i][j][k] // game obj to be updated
							if (gameObj.updatedThisTick === false) {

								gameObj.update(tick);

								// if  unit is firing, add projectile to list and place on board
								if (gameObj.firing) {
									let newProj = gameObj.firing;
									this.registerGameObject(newProj);
									this.addObjectAtCoord(newProj, j + newProj.orientation[0], i + newProj.orientation[1]);
								}
	
								// if object has speed and orientation, move to next position (if valid)
								if (gameObj.speed > 0) {
									let new_x = j + (gameObj.speed * gameObj.orientation[0]);
									let new_y = i + (gameObj.speed * gameObj.orientation[1]);
									this.moveObject(gameObj, j, i, new_x, new_y);
								}

								gameObj.updatedThisTick = true;
							}
						}
					}
				}
			}

			// update
			// validate
			// saveState
			this.history.turn[this.turnNumber].tick[tick] = JSON.parse(JSON.stringify(this.board));
		}

		// move to next Turn
		this.turnNumber++;
	}

}