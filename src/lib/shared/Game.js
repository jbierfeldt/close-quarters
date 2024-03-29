import {create2DArray, createID} from './utilities.js';
import Player from './Player.js';
import * as Units from './Unit.js';
import * as Projectiles from './Projectile.js';
import * as Bases from './Base.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(process.env.DEBUG, 0);

const tempConfig = {
	boardDimensions: [20, 30],
	numOfPlayers: 4,
	ticksPerTurn: 100
}

export default class Game {

	constructor(gameObjects = [], players = [], board = new Object, turnNumber = 0) {
		this.id = 'game_'+createID();
		this.players = players;
		this.board = board;
		this.gameObjects = new Map();
		this.turnNumber =  turnNumber;
		this.numberOfProjectiles = 0;
		this.tempNumberOfProjectiles = 0;
		this.numberOfDefeatedPlayers = 0;
		this.history = {
			'turn': {}
		};
		this.currentTurnInitialState = {};

		this.currentPhase = 0;

		this.cleanUpArray = [];
		this.destroyedArray = [];
		for(let j = 0; j < tempConfig.boardDimensions[1]; j = j + 1){
			this.destroyedArray[j] = [];
		}
		for(let x = 0; x < tempConfig.boardDimensions[1]; x = x + 1){
			for(let y = 0; y < tempConfig.boardDimensions[0]; y = y + 1){
				this.destroyedArray[x][y] = 0;
			}
		}

	}

	init() {

		debug.log(0, 'Initialized Game ' + this.id);

		// create new players
		for (var i = 0; i < tempConfig.numOfPlayers; i++) {
			let newPlayer = new Player(i);
			this.players.push(newPlayer);
		}

		// create empty grid
		this.board = create2DArray(tempConfig.boardDimensions[0],tempConfig.boardDimensions[1]);

		//this.placeInitialRandomBases();
		//this.placeAllInitialBases();
		this.currentTurnInitialState = this.createGameSnapshot();

		// creates history (temp)
		this.history.turn[0] = {
			'tick': {
				1: this.currentTurnInitialState,
				2: this.currentTurnInitialState
			}
		};

		this.turnNumber = 1;
		// this.runSimulation();


	}

	createGameSnapshot () {

		// custom serialize gameObjects using serialize method
		let gameObjs = [...this.gameObjects]; // shallow copy
		for (let i = 0; i < gameObjs.length; i++) {
			gameObjs[i][1] = JSON.stringify(gameObjs[i][1].serialize());
		}

		let players = [...this.players];
		for (let i = 0; i < players.length; i++) {
			players[i] = JSON.stringify(players[i]);
		}

		// create serialized GameState with serialized GameObjects and board
		const snapshotObj = {
			id: this.id,
			players: players,
			board: JSON.parse(JSON.stringify(this.board)),
			gameObjects: gameObjs
		}

		return snapshotObj;
	}

	rebuildGameSnapshot (snapshotObj) {

		// rebuild classes from serialized data
		for (let i = 0; i < snapshotObj.players.length; i++) {
			snapshotObj.players[i] = JSON.parse(snapshotObj.players[i]);
		}

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

		this.id = snapshotObj.id;
		this.board = snapshotObj.board;
		this.players = snapshotObj.players;
		this.gameObjects = snapshotObj.gameObjects;

	}

	getHistoryOfTurn (turnNumber) {
		return this.history.turn[turnNumber]
	}

	getLastTurnHistory () {
		if (this.turnNumber > 0) {
			return this.getHistoryOfTurn(this.turnNumber - 1);
		} else {
			return this.getHistoryOfTurn(this.turnNumber);
		}
	}

	placeInitialRandomBases () {
		for (let i = 1; i <= 4; i++) {
			let randCoord = this.getRandomCoordInPlayerRegion(i, 3, 10);
			this.createNewBaseAtCoord("Base", String(i), randCoord[0], randCoord[1]);
		}
	}
		/*for (let i = 1; i <= 4; i++) {
			let baseZones = [0,0,0,1,1];
			let zone = baseZones[Math.floor(Math.random() * baseZones.length)];
			let randCoord = this.getRandomCoordInPlayerRegion(i, 3, zone);
			console.log(i,randCoord[0], randCoord[1]);
			this.createNewBaseAtCoord("Base", String(i), randCoord[0], randCoord[1]);
		}
	}*/

	// creates new unit using type, player, and coordinates
	createNewUnitAtCoord(unitType, player, x, y) {
		if(this.players[player-1].credits >= Units[unitType].cost){
			if (this.isEmptyCoord(x, y)) {
				let newUnit = new Units[unitType](player);
				this.registerGameObject(newUnit);
				this.addObjectAtCoord(newUnit, x, y);
				this.players[player-1].unitsPlaced.push(unitType);
				this.players[player-1].credits = this.players[player-1].credits - Units[unitType].cost;
				return true;
			}
			return false;
		}
		return false;
	}

	createNewBaseAtCoord(baseType, player, x, y) {
		if (this.isCoordInPlayerRegion(x, y, player) &&
		this.isCoordInPlayerRegion(x+1, y, player) &&
		this.isCoordInPlayerRegion(x, y+1, player) &&
		this.isCoordInPlayerRegion(x+1, y+1, player) &&
		this.isEmptyCoord(x, y) &&
		this.isEmptyCoord(x+1, y) &&
		this.isEmptyCoord(x, y+1) &&
		this.isEmptyCoord(x+1, y+1)
	)
	{
		let newBase = new Bases[baseType](player);
		this.registerGameObject(newBase);
		this.addObjectAtCoord(newBase, x, y);
		this.addObjectAtCoord(newBase, x+1, y);
		this.addObjectAtCoord(newBase, x, y+1);
		this.addObjectAtCoord(newBase, x+1, y+1);
		this.players[player-1].baseCount = this.players[player-1].baseCount + 1;
		return true;
	}
	return false;
}

createObjectAtCoord (object, x, y) {
	if (this.isValidCoord(x, y)) {
		this.registerGameObject(object);
		this.addObjectAtCoord(object, x, y);
	}
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
	if (object) {
		this.gameObjects.delete(object.id);
	}
}

addObjectAtCoord(object, x, y) {
	this.board[y][x].push(object.id);
}

removeObjectAtCoord(object, x, y) {
	const objIndex = this.board[y][x].indexOf(object.id);
	this.board[y][x].splice(objIndex, 1);
}

removeIDAtCoord(id, x, y) {
	const objIndex = this.board[y][x].indexOf(id);
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
	let tempHealth = obj.health;
	// separate logic for colliding with a base / unit
	switch (obj.objCategory) {

		// COLLIDE WITH UNIT
		case "Units":
		// console.log(proj.id, "( player", proj.player, ") hit ", obj.id, " ( player", obj.player, ")", obj.health);

		if (proj.player !== obj.player) {
			if(proj.damage > 0){
				obj.collidedWith = [true, proj];
			}

			// subtract damage from object health
			obj.health = obj.health - proj.damage;

			// if object not destroyed in collision
			if (obj.health > 0) {
				this.players[proj.player-1].damageDealtThisTurn = this.players[proj.player-1].damageDealtThisTurn + (tempHealth - obj.health);
				if (this.gameObjects.get(proj.unit)) {
					this.gameObjects.get(proj.unit).damageDealt = this.gameObjects.get(proj.unit).damageDealt + (tempHealth - obj.health);
				}
				this.destroyedArray[x][y] = 1;
				//this.destroyedArray[5][5] = 17;
			}
			// if object destroyed in collision
			else {
				this.destroyedArray[x][y] = 1;
				//this.destroyedArray[5][5] = 17;
				console.log("CHECK THIS" + " " + x + " " + y);
				console.log(this.destroyedArray);
				this.players[obj.player-1].unitsLostThisTurn =	this.players[obj.player-1].unitsLostThisTurn + 1;
				this.players[proj.player-1].unitsKilledThisTurn =	this.players[obj.player-1].unitsKilledThisTurn + 1;
				this.players[proj.player-1].damageDealtThisTurn = this.players[proj.player-1].damageDealtThisTurn + (tempHealth - 0);
				if (this.gameObjects.get(proj.unit)) {
					this.gameObjects.get(proj.unit).damageDealt = this.gameObjects.get(proj.unit).damageDealt + (tempHealth - 0);
				}
			}
			if (this.isObjectAlive(obj) === false) {

				this.cleanUpArray.push(obj.id);
				//this.deleteObjectAtCoord(obj, x, y);
			}
			//console.log("CHECK THIS" + x + " " + y);
		}

		if (proj.ableToBeDestroyed) {
			this.cleanUpArray.push(proj.id);
			//this.deleteObjectAtCoord(proj, x, y);
		}
		break

		// COLLIDE WITH BASE
		case "Bases":
		// console.log(proj.id, "( player", proj.player, ") hit ", obj.id, " ( player", obj.player, ")", obj.health);
		if (proj.player !== obj.player) {
			if(proj.damage > 0){
				obj.collidedWith = [true, proj];
			}

			// subtract damage from object health
			obj.health = obj.health - proj.damage

			// if object not destroyed in collision
			if (obj.health > 0){
				this.players[proj.player-1].damageDealtToBases = this.players[proj.player-1].damageDealtToBases + (tempHealth - obj.health);
				this.players[proj.player-1].damageDealtThisTurn = this.players[proj.player-1].damageDealtThisTurn + (tempHealth - obj.health);
				if (this.gameObjects.get(proj.unit)) {
					this.gameObjects.get(proj.unit).damageDealt = this.gameObjects.get(proj.unit).damageDealt + (tempHealth - obj.health);
				}
			}
			// if object destroyed in collision
			else {
				this.players[proj.player-1].damageDealtToBases = this.players[proj.player-1].damageDealtToBases + (tempHealth - 0);
				this.players[proj.player-1].damageDealtThisTurn = this.players[proj.player-1].damageDealtThisTurn + (tempHealth - 0);
				if (this.gameObjects.get(proj.unit)) {
					this.gameObjects.get(proj.unit).damageDealt = this.gameObjects.get(proj.unit).damageDealt + (tempHealth - 0);
				}

			}
			if (this.isObjectAlive(obj) === false) {
				this.cleanUpArray.push(obj.id);
				//this.deleteObjectAtCoord(obj, x, y);
				//WE DO NEED TO DELETE THE OBJECT
				this.players[obj.player-1].baseCount = this.players[obj.player-1].baseCount - 1;
			}
		}

		if (proj.ableToBeDestroyed) {
			this.cleanUpArray.push(proj.id);
			//this.deleteObjectAtCoord(proj, x, y);
		}
		break
	}
}

getPossibleTargets(unitName, x, y, player) {

	let tempArray = Units[unitName].orientations[player];
	let finalArray = [];
	let counter = 0;
	let upperDistance = 30;
	let lowerDistance = 1;
	if (unitName == "Oscillator") {
		upperDistance = 2;
	}
	else if (unitName == "Resonator") {
		lowerDistance = 6;
		upperDistance = 19;
	}
	else if (unitName == "Tripwire") {
		//lowerDistance = 5;
		upperDistance = 6;
	}
	else if (unitName == "Ballast") {
		//lowerDistance = 5;
		upperDistance = 2;
	}
	else if (unitName == "RedShifter") {
		lowerDistance = 12;

		//upperDistance = 2;
	}
	else if (unitName == "BeamSplitter") {
		upperDistance = 9;
		//upperDistance = 2;
	}
	for (let i = 0; i < tempArray.length; i = i + 1) {
		let xx = lowerDistance;
		while ((tempArray[i][0] * xx + x) < 30 && (tempArray[i][0] * xx + x) >= 0 && xx < upperDistance) {
			let yy = 1;
			finalArray[counter] = [(tempArray[i][0] * xx + x), (tempArray[i][1] * xx + y)]
			counter = counter + 1;
			xx = xx + 1;
		}
	}
	if (unitName == "BeamSplitter") {
		let turningPoint = 8;
		if (player == 1) {
			for (let i = 1; i < 25; i = i + 1) {
				finalArray.push([x + turningPoint + i, y + turningPoint]);
				finalArray.push([x + turningPoint, y + turningPoint + i]);
			}
		}
		if (player == 2) {
			for (let i = 1; i < 25; i = i + 1) {
				finalArray.push([x + turningPoint + i, y - turningPoint]);
				finalArray.push([x + turningPoint, y - turningPoint - i]);
			}
		}
		if (player == 3) {
			for (let i = 1; i < 25; i = i + 1) {
				finalArray.push([x - turningPoint - i, y + turningPoint]);
				finalArray.push([x - turningPoint, y + turningPoint + i]);
			}
		}
		if (player == 4) {
			for (let i = 1; i < 25; i = i + 1) {
				finalArray.push([x - turningPoint - i, y - turningPoint]);
				finalArray.push([x - turningPoint, y - turningPoint - i]);
			}
		}

	}
	return finalArray;
}

getRandomCoordInPlayerRegion(playerNumber, margin = 0, zone)  {
	//Six Possible Zones
	//Zone 0 is the players back corner
	//Zone 1 takes a step horizontally toward the other side of the board
	let minY = margin;
	let minX = margin;
	let halfBoardX = (tempConfig.boardDimensions[1]/2);
	let halfBoardY = (tempConfig.boardDimensions[0]/2);

	let maxY = halfBoardY;
	let maxX = halfBoardX;

	if(zone == 0){
		if(playerNumber == 1){
			minX = 0;
			minY = 0;
			maxX = halfBoardX/3;
			maxY = halfBoardY/2;
		}
		if(playerNumber == 2){
			minX = 0;
			minY = halfBoardY/2;
			maxX = halfBoardX/3;
			maxY = halfBoardY;
		}
		if(playerNumber == 3){
			minX = halfBoardX*2/3;
			minY = 0;
			maxX = halfBoardX;
			maxY = halfBoardY/2;
		}
		if(playerNumber == 4){
			minX = halfBoardX*2/3;
			minY = halfBoardY/2;
			maxX = halfBoardX;
			maxY = halfBoardY;
		}
}
else if (zone == 1){
	if(playerNumber == 1){
		minX = halfBoardX/3;
		minY = 0;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY/2;
	}
	if(playerNumber == 2){
		minX = halfBoardX/3;
		minY = halfBoardY/2;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY;
	}
	if(playerNumber == 3){
		minX = halfBoardX/3;
		minY = 0;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY/2;
	}
	if(playerNumber == 4){
		minX = halfBoardX/3;
		minY = halfBoardY/2;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY;
	}
}
	else if (zone == 2){
		if(playerNumber == 1){
			minX = halfBoardX*2/3;
			minY = 0;
			maxX = halfBoardX;
			maxY = halfBoardY/2;
		}
		if(playerNumber == 2){
			minX = halfBoardX*2/3;
			minY = halfBoardY/2;
			maxX = halfBoardX;
			maxY = halfBoardY;
		}
		if(playerNumber == 3){
			minX = 0;
			minY = 0;
			maxX = halfBoardX/3;
			maxY = halfBoardY/2;
		}
		if(playerNumber == 4){
			minX = 0;
			minY = halfBoardY/2;
			maxX = halfBoardX/3;
			maxY = halfBoardY;
		}
}
else if (zone == 3){
	if(playerNumber == 1){
		minX = halfBoardX*2/3;
		minY = halfBoardY/2;
		maxX = halfBoardX;
		maxY = halfBoardY;
	}
	if(playerNumber == 2){
		minX = halfBoardX*2/3;
		minY = 0;
		maxX = halfBoardX;
		maxY = halfBoardY/2;
	}
	if(playerNumber == 3){
		minX = 0;
		minY = halfBoardY/2;
		maxX = halfBoardX/3;
		maxY = halfBoardY;
	}
	if(playerNumber == 4){
		minX = 0;
		minY = 0;
		maxX = halfBoardX/3;
		maxY = halfBoardY/2;
	}
}
else if (zone == 4){
	if(playerNumber == 1){
		minX = halfBoardX/3;
		minY = halfBoardY/2;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY;
	}
	if(playerNumber == 2){
		minX = halfBoardX/3;
		minY = 0;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY/2;
	}
	if(playerNumber == 3){
		minX = halfBoardX/3;
		minY = halfBoardY/2;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY;
	}
	if(playerNumber == 4){
		minX = halfBoardX/3;
		minY = 0;
		maxX = halfBoardX*2/3;
		maxY = halfBoardY/2;
	}
}
else if (zone == 5){
	if(playerNumber == 1){
		minX = 0;
		minY = halfBoardY/2;
		maxX = halfBoardX/3;
		maxY = halfBoardY;
	}
	if(playerNumber == 2){
		minX = 0;
		minY = 0;
		maxX = halfBoardX/3;
		maxY = halfBoardY/2;
	}
	if(playerNumber == 3){
		minX = halfBoardX*2/3;
		minY = halfBoardY/2;
		maxX = halfBoardX;
		maxY = halfBoardY;
	}
	if(playerNumber == 4){
		minX = halfBoardX*2/3;
		minY = 0;
		maxX = halfBoardX;
		maxY = halfBoardY/2;
	}
}

	let randX = Math.floor(Math.random() * ((maxX - margin) - minX)) + minX;
	let randY = Math.floor(Math.random() * ((maxY - margin) - minY)) + minY;


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

isCoordInPlayerRegion (x, y, playerNumber) {
	let xMin, yMin, xMax, yMax;

	switch (parseInt(playerNumber)) {
		case 1:
		xMin = 0;
		yMin = 0;
		xMax = tempConfig.boardDimensions[1]/2;
		yMax = tempConfig.boardDimensions[0]/2;
		break;
		case 2:
		xMin = 0;
		yMin = tempConfig.boardDimensions[0]/2;
		xMax = tempConfig.boardDimensions[1]/2;
		yMax = tempConfig.boardDimensions[0];
		break;
		case 3:
		xMin = tempConfig.boardDimensions[1]/2;
		yMin = 0;
		xMax = tempConfig.boardDimensions[1];
		yMax = tempConfig.boardDimensions[0]/2;
		break;
		case 4:
		xMin = tempConfig.boardDimensions[1]/2;
		yMin = tempConfig.boardDimensions[0]/2;
		xMax = tempConfig.boardDimensions[1];
		yMax = tempConfig.boardDimensions[0];
	}

	if (xMin <= x && x < xMax && yMin <= y && y < yMax)  {
		return true;
	} else {
		debug.log(0, "Coord doesn't belong to player");
		return false;
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

clearProjectiles (player) {
	// if given a player number, only clear projeciles of that player
	for (let i = 0; i < this.board.length; i++)  {
		for (let j = 0; j < this.board[i].length; j++) {
			let objsToClear = [...this.board[i][j]];
				if (objsToClear.length != 0) {
					for (let k = 0; k < objsToClear.length; k++) {
					let gameObj = this.gameObjects.get(objsToClear[k]); // game obj to be updated
		/*	if (this.board[i][j].length != 0) {
				for (let k = 0; k < this.board[i][j].length; k++) {
					let gameObj = this.gameObjects.get(this.board[i][j][k]); // game obj to be updated*/
					if (player) {
						if (gameObj.objCategory === "Projectiles" && gameObj.player == player) {
							this.deleteObjectAtCoord(gameObj, j, i);
						}
					} else {
						if (gameObj.objCategory === "Projectiles") {
							this.deleteObjectAtCoord(gameObj, j, i);
						}
					}
				}
			}
		}
	}
}

clearUnits (player) {
	// if given a player number, only clear units of that player
	for (let i = 0; i < this.board.length; i++)  {
		for (let j = 0; j < this.board[i].length; j++) {
			if (this.board[i][j].length != 0) {
				for (let k = 0; k < this.board[i][j].length; k++) {
					let gameObj = this.gameObjects.get(this.board[i][j][k]); // game obj to be updated
					if (player) {
						if (gameObj.objCategory === "Units" && gameObj.player == player) {
							this.deleteObjectAtCoord(gameObj, j, i);
						}
					} else {
						if (gameObj.objCategory === "Units") {
							this.deleteObjectAtCoord(gameObj, j, i);
						}
					}
				}
			}
		}
	}
}

cleanUpByID (idToClean) {
	for (let i = 0; i < this.board.length; i++)  {
		for (let j = 0; j < this.board[i].length; j++) {
			if (this.board[i][j].length != 0) {
				for (let k = 0; k < this.board[i][j].length; k++) {
					if (this.board[i][j][k] === idToClean) {
						let obj = this.gameObjects.get(idToClean);
						if (obj) {
							// if object hasn't already been deregistered, do both
							this.deleteObjectAtCoord(this.gameObjects.get(idToClean), j, i);
						} else {
							// if object has already been deregistered, just clear id from board
							this.removeIDAtCoord(idToClean, j, i);
						}
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

	for(let i = 0; i < 4; i = i + 1){
		this.players[i].score = 0;
		this.players[i].damageDealtThisTurn = 0;
		this.players[i].damageDealtToBases = 0;
		this.players[i].unitsLostThisTurn = 0;
		this.players[i].unitsKilledThisTurn = 0;
		this.players[i].creditsEarnedThisTurn = 0;
	}
	console.log(this.id+ ": Running simulation for turn " + this.turnNumber);
	this.history.turn[this.turnNumber] = {
		'tick': {}
	};


	for (let tick = 1; tick <= ticksPerTurn; tick++) {
		this.numberOfProjectiles = this.tempNumberOfProjectiles;
		this.tempNumberOfProjectiles = 0;
		// debug.log(0, "Processing tick #" + tick);

		// enable movement at beginning of tick
		this.gameObjects.forEach( (value, key, ownerMap) => {
			value.updatedThisTick = false;
			value.turnsActive = value.turnsActive + 1;
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
						let gameObj = this.gameObjects.get(objsToUpdate[k]); // game obj to be updated
						if (gameObj.updatedThisTick === false) {
							if(gameObj.identifier == "Int"){
								gameObj.update(tick, this.numberOfProjectiles);
							}
							else{
								gameObj.update(tick);
							}

							if(gameObj.objCategory == "Projectiles"){
								this.tempNumberOfProjectiles = this.tempNumberOfProjectiles + 1;
							}
							if(tick == ticksPerTurn){
								if(gameObj.objCategory == "Units"){
									this.players[gameObj.player-1].score = this.players[gameObj.player-1].score + Math.floor(10*gameObj.value*(gameObj.health/gameObj.constructor.maxHealth));
								}
								if(gameObj.objCategory == "Bases"){
									this.players[gameObj.player-1].score = this.players[gameObj.player-1].score + Math.floor(1000*(gameObj.health/gameObj.constructor.maxHealth));
								}
							}

							// if  unit is firing, add projectile to list and place on board
							if (gameObj.dump) {
								this.cleanUpArray.push(gameObj.id);
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
					for (let k = 0; k < collisionStack.length; k++) {
						let obj = this.gameObjects.get(this.board[i][j][k]);
						if (obj.objCategory === "Projectiles") {
							for (let m = 0; m < collisionStack.length; m++) {
								let collisionObj = this.gameObjects.get(collisionStack[m]);
								if(this.isObjectAlive(collisionObj)){
									this.collideProjWithObject(obj, collisionObj, j, i);
								}
							}
						}
					}
				}
			}
		}

		// clean up ids marked for deletion
		let cleanUpArrayTempLength = this.cleanUpArray.length;
		while ( cleanUpArrayTempLength > 0 ){
			this.cleanUpByID(this.cleanUpArray[cleanUpArrayTempLength-1]);
			this.cleanUpArray.pop();
			cleanUpArrayTempLength = cleanUpArrayTempLength-1;
		}

		for (let i = 0; i < 4; i++) {
			// if not already defeated and if no more bases
			if (this.players[i].victoryCondition !== -1 && this.players[i].baseCount == 0) {
				console.log(this.id + ": Player " + i + " Defeated at tick "+ tick);
				this.players[i].victoryCondition = -1;
				this.clearProjectiles(i+1);
				this.clearUnits(i+1);
				this.numberOfDefeatedPlayers = this.numberOfDefeatedPlayers + 1;
			}
		}
		if(this.numberOfDefeatedPlayers == 3){
			for (let i = 0; i < 4; i++) {
				if (this.players[i].victoryCondition !== -1) {
					this.players[i].victoryCondition = 1;
				}
			}
		}

		this.history.turn[this.turnNumber].tick[tick] = this.createGameSnapshot();
	}

	// move to next Turn
	this.clearProjectiles(); // clear all projectiles at the end of the turn

	// increase credits
	for (let p = 0; p < 4; p++) {
		this.players[p].credits = this.players[p].credits + 5 + Math.floor(this.players[p].damageDealtToBases/200);
		this.players[p].creditsEarnedThisTurn = Math.floor(this.players[p].damageDealtToBases/250);
		this.players[p].creditsEarnedTotal = this.players[p].creditsEarnedTotal + this.players[p].creditsEarnedThisTurn;
		this.players[p].damageDealtTotal = this.players[p].damageDealtTotal + this.players[p].damageDealtThisTurn;
		this.players[p].unitsKilledTotal = this.players[p].unitsKilledTotal + this.players[p].unitsKilledThisTurn;
		this.players[p].unitsLostTotal = this.players[p].unitsLostTotal + this.players[p].unitsLostThisTurn;
		let mf = 0;
		let m = 0;
		let item;
		for (let i=0; i < this.players[p].unitsPlaced.length; i++) {
			for (let j=i; j<this.players[p].unitsPlaced.length; j++) {
				if (this.players[p].unitsPlaced[i] == this.players[p].unitsPlaced[j]) {
					m++;
				}
					if (mf<m) {
						mf=m;
						item = this.players[p].unitsPlaced[i];
					}
				}
				m=0;
		}
		this.players[p].frequentUnit = item;
	}

	this.currentTurnInitialState = this.createGameSnapshot();
	this.turnNumber++;
}

}
