import Game from './Game.js';
import * as Units from './Unit.js';
import Base from './Base.js';

export default class BasicAI {

	constructor(game, playerNumber) {
		this.game = game;
		this.playerNumber = playerNumber;
		this.isAI = true; // used in sendRoomState in GameController

		this.ordersToExecute = [];
		this.ordersSubmitted = false;

		this.tempBoard = [];
		this.baseCount = 0;
		this.baseCoordsOne = [];
		this.baseCoordsTwo = [];
	}

	createOrder(orderType, args) {
		let order = {
			player: this.playerNumber,
			turnNumber: this.turnNumber,
			orderType: orderType,
			args: args
		}

		this.ordersToExecute.push(order);
	}

	isEmptyCoord(x, y) {
		try {
			if (this.tempBoard[y][x].length === 0) {
				return true;
			}
			else {
				debug.log(0, "Coord is full - temp");
				return false;
			}
		} catch (e) {
			return false;
		}
	}

	isValidCoord(x, y) {
		try {
			if (this.tempBoard[y][x]) {
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

	addPlaceholderAtCoord(x, y) {
		this.tempBoard[y][x].push('PLACEHOLDER');
	}

	generateOrders(breakPoint) {
		let credits = this.game.players[this.playerNumber - 1].credits;
		let creditCost = 0;
		let saveCredits = 0
		let unitName = " ";
		let allUnits = [1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10];
		let twoCreditsAndBelowUnits = [1, 1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 10, 10, 10, 10];
		let oneCreditUnits = [1, 1, 1, 1, 2, 2, 3, 3, 3];
		let rayZones = [1, 2, 3, 4, 5];
		let redZones = [0, 0, 1, 1, 5];
		let oscZones = [2, 3, 3, 3, 4, 5];
		let balZones = [3, 3, 4];
		let jugZones = [2, 3, 3, 3, 4, 4, 5];
		let triZones = [3, 3, 3, 4, 4];
		let magZones = [2, 3, 3, 3, 4, 4, 5];
		let resZones = [0, 0, 1, 1, 1, 2, 4, 4, 5];
		let intZones = [1, 1, 1, 3, 3, 4, 4, 5];
		let beaZones = [0, 1, 1, 1, 2, 3, 3, 4, 4, 5];
		let zone = 0;
		let unitSelected = 0;


		if (this.game.turnNumber === 1 && this.baseCount < 2) {
			// create two bases on turn 1
			this.baseCoordsOne = this.createAIBase();
			this.baseCoordsTwo = this.createAIBase();
		}

		while (credits > 0) {
			//console.log(this.playerNumber, credits);
			if (credits >= 3) {
				unitSelected = allUnits[Math.floor(Math.random() * allUnits.length)];
			}
			else if (credits == 2) {
				unitSelected = twoCreditsAndBelowUnits[Math.floor(Math.random() * twoCreditsAndBelowUnits.length)];
			}
			else {
				unitSelected = oneCreditUnits[Math.floor(Math.random() * oneCreditUnits.length)];
			}
			if (unitSelected == 1) {
				unitName = "RayTracer";
				creditCost = 1;
				zone = rayZones[Math.floor(Math.random() * rayZones.length)];
			}
			else if (unitSelected == 2) {
				unitName = "RedShifter";
				creditCost = 1;
				zone = redZones[Math.floor(Math.random() * redZones.length)];
			}
			else if (unitSelected == 3) {
				unitName = "Oscillator";
				creditCost = 1;
				zone = oscZones[Math.floor(Math.random() * oscZones.length)];
			}
			else if (unitSelected == 4) {
				unitName = "Ballast";
				creditCost = 2;
				zone = balZones[Math.floor(Math.random() * balZones.length)];
			}
			else if (unitSelected == 5) {
				unitName = "Juggernode";
				creditCost = 2;
				zone = jugZones[Math.floor(Math.random() * jugZones.length)];
			}
			else if (unitSelected == 6) {
				unitName = "Tripwire";
				creditCost = 2;
				zone = triZones[Math.floor(Math.random() * triZones.length)];
			}
			else if (unitSelected == 7) {
				unitName = "Maglev";
				creditCost = 3;
				zone = magZones[Math.floor(Math.random() * magZones.length)];
			}
			else if (unitSelected == 8) {
				unitName = "Resonator";
				creditCost = 3;
				zone = resZones[Math.floor(Math.random() * resZones.length)];
			}
			else if (unitSelected == 9) {
				unitName = "Integrator";
				creditCost = 3;
				zone = intZones[Math.floor(Math.random() * intZones.length)];
			}
			else if (unitSelected == 10) {
				unitName = "BeamSplitter";
				creditCost = 2;
				zone = beaZones[Math.floor(Math.random() * intZones.length)];
			}

			let newUnitCoord = this.game.getRandomCoordInPlayerRegion(this.playerNumber, 0, zone);

			if (this.isEmptyCoord(newUnitCoord[0], newUnitCoord[1])) {
				if (this.game.turnNumber > 1) {
					let targetSpots = this.game.getPossibleTargets(unitName, newUnitCoord[0], newUnitCoord[1], this.playerNumber);
					if (breakPoint < 10000) {
						for (let i = 0; i < targetSpots.length; i = i + 1) {
							let objID = this.game.getObjectsAtCoord(targetSpots[i][0], targetSpots[i][1])[0];
							if (objID) {
								let gameObj = this.game.gameObjects.get(objID);
								if (gameObj.player !== this.playerNumber && gameObj.objCategory === "Bases") {
									this.createOrder('createUnit', {
										unitType: unitName,
										player: this.playerNumber,
										x: newUnitCoord[0],
										y: newUnitCoord[1]
									});
									this.addPlaceholderAtCoord(newUnitCoord[0], newUnitCoord[1]);
									credits = credits - creditCost;
									i = targetSpots.length;
									breakPoint = 0;
								}
							 if(breakPoint > 8000 && gameObj.player !== this.playerNumber && gameObj.objCategory === "Units"){
								 this.createOrder('createUnit', {
									 unitType: unitName,
									 player: this.playerNumber,
									 x: newUnitCoord[0],
									 y: newUnitCoord[1]
								 });
								 this.addPlaceholderAtCoord(newUnitCoord[0], newUnitCoord[1]);
								 credits = credits - creditCost;
								 i = targetSpots.length;
								 breakPoint = 0;
							 }
							}
							else {
								breakPoint = breakPoint + 1;
							}
						}
					}
					else {
						this.createOrder('createUnit', {
							unitType: unitName,
							player: this.playerNumber,
							x: newUnitCoord[0],
							y: newUnitCoord[1]
						});
						this.addPlaceholderAtCoord(newUnitCoord[0], newUnitCoord[1]);
						credits = credits - creditCost;
						breakPoint = 0;
					}
				}
				else {
					  this.createOrder('createUnit', {
						unitType: unitName,
						player: this.playerNumber,
						x: newUnitCoord[0],
						y: newUnitCoord[1]
					});
					this.addPlaceholderAtCoord(newUnitCoord[0], newUnitCoord[1]);
					credits = credits - creditCost;
				}
			} else if(breakPoint > 10000){
					return true;
			}
			else{
				breakPoint = breakPoint + 1;
				newUnitCoord = this.game.getRandomCoordInPlayerRegion(this.playerNumber, 0, zone);
			}
			/*if(credits == 1){
				saveCredits = Math.floor(Math.random()*2);
				if(saveCredits == 1){
					break;
				}
			}*/
		}
		return true;
	}

	createAIBase() {
		let baseZones = [0, 0, 0, 1, 1];
		let zone = baseZones[Math.floor(Math.random() * baseZones.length)];
		let secondBaseCoord = this.game.getRandomCoordInPlayerRegion(this.playerNumber, 0, zone);
		let baseCoordinates = [];
		while(baseCoordinates.length < 1){
		if (this.game.isCoordInPlayerRegion(secondBaseCoord[0], secondBaseCoord[1], this.playerNumber) &&
			this.game.isCoordInPlayerRegion(secondBaseCoord[0] + 1, secondBaseCoord[1], this.playerNumber) &&
			this.game.isCoordInPlayerRegion(secondBaseCoord[0], secondBaseCoord[1] + 1, this.playerNumber) &&
			this.game.isCoordInPlayerRegion(secondBaseCoord[0] + 1, secondBaseCoord[1] + 1, this.playerNumber) &&
			this.isEmptyCoord(secondBaseCoord[0], secondBaseCoord[1]) &&
			this.isEmptyCoord(secondBaseCoord[0] + 1, secondBaseCoord[1]) &&
			this.isEmptyCoord(secondBaseCoord[0], secondBaseCoord[1] + 1) &&
			this.isEmptyCoord(secondBaseCoord[0] + 1, secondBaseCoord[1] + 1)
		) {
			this.createOrder('createBase', {
				baseType: "Base",
				player: this.playerNumber,
				x: secondBaseCoord[0],
				y: secondBaseCoord[1]
			});
			this.addPlaceholderAtCoord(secondBaseCoord[0], secondBaseCoord[1]);
			this.addPlaceholderAtCoord(secondBaseCoord[0]+1, secondBaseCoord[1]);
			this.addPlaceholderAtCoord(secondBaseCoord[0], secondBaseCoord[1]+1);
			this.addPlaceholderAtCoord(secondBaseCoord[0]+1, secondBaseCoord[1]+1);
			this.baseCount++;
			baseCoordinates = [secondBaseCoord[0], secondBaseCoord[1]];
			return baseCoordinates;
		} else {
			secondBaseCoord = this.game.getRandomCoordInPlayerRegion(this.playerNumber, 0, zone);
		//	this.createAIBase();
		//	return false;
			}
		}
	}
}
