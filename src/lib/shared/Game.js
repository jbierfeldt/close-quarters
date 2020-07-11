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
 		this.s_history = {
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

	// creates new unit using type, player, and coordinates
	createNewUnitAtCoord(unitType, player, x, y) {
		let newUnit = new Units[unitType](player);
		this.registerGameObject(newUnit);
		this.addObjectAtEmptyCoord(newUnit, x, y);
	}

	createNewBaseAtCoord(baseType, player, x, y) {
		let newBase = new Bases[baseType](player);
		this.registerGameObject(newBase);
		this.addObjectAtEmptyCoord(newBase, x, y);
		this.addObjectAtEmptyCoord(newBase, x+1, y);
		this.addObjectAtEmptyCoord(newBase, x, y+1);
		this.addObjectAtEmptyCoord(newBase, x+1, y+1);
	}

	createObjectAtCoord (object, x, y) {
		this.registerGameObject(object);
		this.addObjectAtEmptyCoord(object, x, y);
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

	addObjectAtEmptyCoord(object, x, y) {
		if (this.isEmptyCoord(x, y)) {
			this.board[y][x].push(object.id);
		}
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

	collideProjWithObject(proj, obj) {
		switch (obj.objCategory) {
			case "Units":
				debug.log(1, obj.id, " hit by ", proj.id, " doing ", proj.damage, "damage!");
				obj.health = obj.health - proj.damage;
				break
			case "Bases":
				debug.log(1, obj.id, " hit by ", proj.id, " doing ", proj.damage, "damage!");
				obj.health = obj.health - proj.damage;
				break
		}
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
						for (let k = 0; k < this.board[i][j].length; k++) {
							let gameObj = this.gameObjects.get(this.board[i][j][k]); // game obj to be updated
							if (gameObj.updatedThisTick === false) {

								gameObj.update(tick);

								// if  unit is firing, add projectile to list and place on board
								if (gameObj.dump) {
									this.deleteObjectAtCoord (gameObj, j, i);
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
						console.log("collide", collisionStack);
						for (let k = 0; k < collisionStack.length; k++) {
							let obj = this.gameObjects.get(this.board[i][j][k]);
							if (obj.objCategory === "Projectiles") {
								for (let m = 0; m < collisionStack.length; m++) {

									let collisionObj = this.gameObjects.get(collisionStack[m]);
									this.collideProjWithObject(obj, collisionObj);

								}
							}
						}
					}
				}
			}

			// update
			// validate
			// saveState
			this.history.turn[this.turnNumber].tick[tick] = this.createGameSnapshot();
		}

		// move to next Turn
		this.clearProjectiles(); // clear all projectiles at the end of the turn
		this.turnNumber++;
	}

}
