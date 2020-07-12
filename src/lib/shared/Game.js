import {create2DArray, createID} from './utilities.js';
import Player from './Player.js';
import * as Units from './Unit.js';
import * as Projectiles from './Projectile.js';
import * as Bases from './Base.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 0);

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
 		this.gameObjects = new Map();
 		this.turnNumber =  turnNumber;
 		this.history = {
 			'turn': {}
 		};
		this.currentTurnInitialState = {};

 		this.currentPhase = 0;

		this.cleanUpArray = [];
	}

	init() {

		// create new players
		for (var i = 0; i < tempConfig.numOfPlayers; i++) {
			let newPlayer = new Player(i);
			this.players.push(newPlayer);
		}

		// create empty grid
		this.board = create2DArray(tempConfig.boardDimensions[0],tempConfig.boardDimensions[1]);

		this.placeInitialRandomBases();

		this.currentTurnInitialState = this.createGameSnapshot();

		// creates history (temp)
		this.history.turn[0] = {
			'tick': {
				1: this.currentTurnInitialState
			}
		};


		debug.log(0, 'Initialized Game ' + this.id);

	}

	createGameSnapshot () {

		// custom serialize gameObjects using serialize method
		let gameObjs = [...this.gameObjects];
		for (let i = 0; i < gameObjs.length; i++) {
			gameObjs[i][1] = JSON.stringify(gameObjs[i][1].serialize());
		}

		// create serialized GameState with serialized GameObjects and board
		const snapshotObj = {
			id: this.id,
			players: this.players,
			board: JSON.parse(JSON.stringify(this.board)),
			gameObjects: gameObjs
		}

		return snapshotObj;
	}

	rebuildGameSnapshot (snapshotObj) {

		// rebuild classes from serialized data
		for (let i = 0; i < snapshotObj.gameObjects.length; i++) {
			snapshotObj.gameObjects[i][1] = JSON.parse(snapshotObj.gameObjects[i][1]);
			let newObject = snapshotObj.gameObjects[i][1];
			switch (newObject.objCategory) {
				case "Units":
					newObject = Units[newObject.class].createFromSerialized(newObject);
					break
				case "Projectiles":
					newObject = Projectiles[newObject.class].createFromSerialized(newObject);
					break
				case "Bases":
					newObject = Bases[newObject.class].createFromSerialized(newObject);
			}
			snapshotObj.gameObjects[i][1] = newObject;
		}

		// rebuild map with reconstructed classes
		snapshotObj.gameObjects = new Map(snapshotObj.gameObjects);

		return snapshotObj;
	}

	loadGameSnapshot (snapshotObj) {

		this.board = snapshotObj.board;
		this.players = snapshotObj.players;
		this.gameObjects = snapshotObj.gameObjects;

	}

	serializeGameState(gameState) {
		return JSON.stringify(gameState);
	}

	saveSerializedTurn(turn) {

		return JSON.stringify(turn);

	}

	loadSerializedGameState(serializedGameState) {

		return JSON.parse(serializedGameState);

	}

	placeInitialRandomBases () {
		for (let i = 1; i <= 4; i++) {
			let randCoord = this.getRandomCoordInPlayerRegion(i, 2);
			this.createNewBaseAtCoord("Base", i, randCoord[0], randCoord[1]);
		}
	}

	// creates new unit using type, player, and coordinates
	createNewUnitAtCoord(unitType, player, x, y) {
		if(this.players[player-1].credits >= Units[unitType].cost){
			if (this.isEmptyCoord(x, y)) {
				let newUnit = new Units[unitType](player);
				this.registerGameObject(newUnit);
				this.addObjectAtCoord(newUnit, x, y);
			}
			this.players[player-1].credits = this.players[player-1].credits - Units[unitType].cost;
		}
	}

	createNewBaseAtCoord(baseType, player, x, y) {
		if (this.isEmptyCoord(x, y) && this.isEmptyCoord(x+1, y) && this.isEmptyCoord(x, y+1) && this.isEmptyCoord(x+1, y+1)) {
			let newBase = new Bases[baseType](player);
			this.registerGameObject(newBase);
			this.addObjectAtCoord(newBase, x, y);
			this.addObjectAtCoord(newBase, x+1, y);
			this.addObjectAtCoord(newBase, x, y+1);
			this.addObjectAtCoord(newBase, x+1, y+1);
		}
	}

	createObjectAtCoord (object, x, y) {
		this.registerGameObject(object);
		this.addObjectAtCoord(object, x, y);
	}

	deleteObjectAtCoord (object, x, y) {
		this.deregisterGameObject(object);
		this.removeObjectAtCoord(object, x, y);
	}

	registerGameObject(object) {
		// validate object
		this.gameObjects.set(object.id, object);
	}

	deregisterGameObject (object) {
		this.gameObjects.delete(object.id);
	}

	addObjectAtCoord(object, x, y) {
			this.board[y][x].push(object.id);
	}

	removeObjectAtCoord(object, x, y) {
		const objIndex = this.board[y][x].indexOf(object.id);
		this.board[y][x].splice(objIndex, 1);
	}

	getObjectsAtCoord(x, y) {
		try {
			if (this.board[y][x].length !== 0) {
				return this.board[y][x];
			}
			else {
				// debug.log(0, "No objects at Coord");
				return false;
			}
		} catch (e) {
			// debug.log(0, "Edge of map");
			return false;
		}
	}

	isObjectAlive (obj) {
		if (obj.health && obj.health > 0) {
			return true;
		} else {
			return false;
		}
	}

	collideProjWithObject(proj, obj, x, y) {
		console.log(proj.id, "( player", proj.player, ") hit ", obj.id, " ( player", obj.player, ")", obj.health);
		switch (obj.objCategory) {
			case "Units":
				if (proj.player !== obj.player) {
					obj.health = obj.health - proj.damage;
					if (this.isObjectAlive(obj) === false) {
						this.deleteObjectAtCoord(obj, x, y);
					}
				}

				if (proj.ableToBeDestroyed) {
					this.deleteObjectAtCoord(proj, x, y);
				}
				break
			case "Bases":
				if (proj.player !== obj.player) {
					obj.health = obj.health - proj.damage;
					if (this.isObjectAlive(obj) === false) {
						this.cleanUpArray.push(obj.id);
						this.deleteObjectAtCoord(obj, x, y);
					}
				}
				this.deleteObjectAtCoord(proj, x, y);
				break
		}
	}

	getRandomCoordInPlayerRegion(playerNumber, margin = 0)  {

		let min = 0 + margin;
		let randX = Math.floor(Math.random() * (((tempConfig.boardDimensions[1]/2) - margin) - min)) + min;
		let randY = Math.floor(Math.random() * (((tempConfig.boardDimensions[0]/2) - margin) - min)) + min;

		switch (playerNumber) {
			case 1:
				break
			case 2:
				randY = randY + (tempConfig.boardDimensions[0]/2);
				break
			case 3:
				randX = randX + (tempConfig.boardDimensions[1]/2);
				break
			case 4:
				randX = randX + (tempConfig.boardDimensions[1]/2);
				randY = randY + (tempConfig.boardDimensions[0]/2);
				break
		}

		return  [randX, randY];
	}

	moveObject(object, old_x, old_y, new_x, new_y) {
		if (this.isValidCoord(new_x, new_y)) {
			this.addObjectAtCoord(object, new_x, new_y);
			this.removeObjectAtCoord(object, old_x, old_y);
		}
		else {
			// debug.log(0, "edge of map, removing", new_x, new_y);
			this.removeObjectAtCoord(object, old_x, old_y);
			this.deregisterGameObject(object);
		}

	}

	isEmptyCoord(x, y) {
		try {
			if (this.board[y][x].length === 0) {
				return true;
			}
			else {
				debug.log(0, "Coord is full");
				return false;
			}
		} catch (e) {
			return false;
		}
	}

	isValidCoord(x, y) {
    	try {
			if (this.board[y][x]) {
				return true;
			}
			else {
				// debug.log(0, "Invalid Coord", x, y);
				return false;
			}
      	} catch (e) {
					// debug.log(0, "Invalid Coord", x, y);
        	return false;
      	}
	}

	clearProjectiles () {
		for (let i = 0; i < this.board.length; i++)  {
			for (let j = 0; j < this.board[i].length; j++) {
				if (this.board[i][j].length != 0) {
					for (let k = 0; k < this.board[i][j].length; k++) {
						let gameObj = this.gameObjects.get(this.board[i][j][k]); // game obj to be updated
						if (gameObj.objCategory === "Projectiles") {
							this.deleteObjectAtCoord(gameObj, j, i);
						}
					}
				}
			}
		}
	}

	cleanUpByID (idToClean) {
		console.log("cleaning...", idToClean);
		for (let i = 0; i < this.board.length; i++)  {
			for (let j = 0; j < this.board[i].length; j++) {
				if (this.board[i][j].length != 0) {
					for (let k = 0; k < this.board[i][j].length; k++) {
						if (this.board[i][j][k] === idToClean) {
							console.log("got one...", idToClean, j, i);
							const idx = this.board[i][j].indexOf(this.board[i][j][k]);
							this.board[i][j].splice(idx, 1);
						}
					}
				}
			}
		}
	}

	runSimulation(ticksPerTurn = tempConfig.ticksPerTurn) {
		// updates game state based on ticks. Sweeps board and updates
		// any game object on the board
		// note: j is x and i is y
		// debug.log(0, "Running simulation for turn " + this.turnNumber);
		this.history.turn[this.turnNumber] = {
			'tick': {}
		};

		for (let tick = 1; tick <= ticksPerTurn; tick++) {
			debug.log(0, "Processing tick #" + tick);

			// enable movement at beginning of tick
			this.gameObjects.forEach( (value, key, ownerMap) => {
				value.updatedThisTick = false;
			});

			// update walk
			for (let i = 0; i < this.board.length; i++)  {
				for (let j = 0; j < this.board[i].length; j++) {
					if (this.board[i][j].length != 0) {

						// make a shallow copy of the final array
						// so that updates that remove the object from the board
						// do not change the array length
						let objsToUpdate = [...this.board[i][j]];

						for (let k = 0; k < objsToUpdate.length; k++) {
							console.log("updating", objsToUpdate[k]);
							let gameObj = this.gameObjects.get(objsToUpdate[k]); // game obj to be updated
							if (gameObj.updatedThisTick === false) {

								gameObj.update(tick);

								// if  unit is firing, add projectile to list and place on board
								if (gameObj.dump) {
									this.deleteObjectAtCoord(gameObj, j, i);
								}

								if (gameObj.firing) {
									for (let l = 0; l < gameObj.projArr.length; l++){
									let newProj = gameObj.projArr[l];
									this.createObjectAtCoord(newProj, j + newProj.orientation[0], i + newProj.orientation[1])
									}
								}

								// if object has speed and orientation, move to next position (if valid)
								if (gameObj.speed > 0) {
									let new_x = j + (gameObj.speed * gameObj.orientation[0]);
									let new_y = i + (gameObj.speed * gameObj.orientation[1]);
									this.moveObject(gameObj, j, i, new_x, new_y);
								}

								// after object has been updated, set updatedThisTick to true
								gameObj.updatedThisTick = true;
							}
						}
					}
				}
			}

			// validate walk (collision detection)
			for (let i = 0; i < this.board.length; i++)  {
				for (let j = 0; j < this.board[i].length; j++) {
					if (this.board[i][j].length > 1) {
						let collisionStack = this.board[i][j];
						// console.log("collide", tick, i, j, collisionStack);
						for (let k = 0; k < collisionStack.length; k++) {
							let obj = this.gameObjects.get(this.board[i][j][k]);
							if (obj.objCategory === "Projectiles") {
								for (let m = 0; m < collisionStack.length; m++) {

									let collisionObj = this.gameObjects.get(collisionStack[m]);
									this.collideProjWithObject(obj, collisionObj, j, i);

								}
							}
						}
					}
				}
			}

			// clean up ids marked for deletion
			if (this.cleanUpArray.length > 0) {
				for (let i = 0; i < this.cleanUpArray.length; i++) {
					this.cleanUpByID(this.cleanUpArray[i]);
					this.cleanUpArray.splice(i, 1);
				}
			}

			// update
			// validate
			// saveState
			this.history.turn[this.turnNumber].tick[tick] = this.createGameSnapshot();
		}

		// move to next Turn
		this.clearProjectiles(); // clear all projectiles at the end of the turn
		this.currentTurnInitialState = this.createGameSnapshot();

		this.turnNumber++;
		for(let p = 0; p < 4; p = p + 1){
			this.players[p].credits = this.players[p].credits + 3;
	 }
	}

}
