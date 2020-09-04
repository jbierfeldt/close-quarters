import Game from './Game.js';
import * as Units from './Unit.js';
import Base from './Base.js';

export default class BasicAI {

	constructor (game, playerNumber) {
    this.game = game;
    this.playerNumber = playerNumber;

    this.ordersToExecute = [];
  }

  createOrder (orderType, args) {
		let order = {
			player: this.playerNumber,
			turnNumber: this.turnNumber,
			orderType: orderType,
			args: args
		}

		this.ordersToExecute.push(order);
  }

  createRandomUnit () {
		let credits = this.game.players[this.playerNumber-1].credits;
		let creditCost = 0;
		let saveCredits = 0
		let unitName = " ";
		let allUnits = [1,1,1,1,2,2,3,3,3,4,4,5,5,5,5,6,7,7,7,7,7,7,7,8,8,8,8,8,9,9,9,9,9];
		let twoCreditsAndBelowUnits = [1,1,1,1,2,2,3,3,3,4,4,5,5,5,5,6];
		let oneCreditUnits = [1,1,1,1,2,2,3,3,3];
		let rayZones = [1,2,3,4,5];
		let redZones = [0,0,1,1,5];
		let oscZones = [2,3,3,3,4,5];
		let balZones = [3,3,4];
		let jugZones = [2,3,3,3,4,4,5];
		let triZones = [3,3,3,4,4];
		let magZones = [2,3,3,3,4,4];
		let resZones = [0,0,1,1,1,2,4,5];
		let intZones = [1,1,1,3,3,4,4,5];
		let zone =0;
		let unitSelected = 0;

		while(credits > 0){
			//console.log(this.playerNumber, credits);

			if(credits >= 3){
				unitSelected = allUnits[Math.floor(Math.random() * allUnits.length)];
			}
			else if(credits == 2){
				unitSelected = twoCreditsAndBelowUnits[Math.floor(Math.random() * twoCreditsAndBelowUnits.length)];
			}
			else{
				unitSelected = oneCreditUnits[Math.floor(Math.random() * oneCreditUnits.length)];
			}
			if(unitSelected == 1){
				unitName = "RayTracer";
				creditCost = 1;
				zone = rayZones[Math.floor(Math.random() * rayZones.length)];
			}
			else if(unitSelected == 2){
				unitName = "RedShifter";
				creditCost = 1;
				zone = redZones[Math.floor(Math.random() * redZones.length)];
			}
			else if(unitSelected == 3){
				unitName = "Oscillator";
				creditCost = 1;
				zone = oscZones[Math.floor(Math.random() * oscZones.length)];
			}
			else if(unitSelected == 4){
				unitName = "Ballast";
				creditCost = 2;
				zone = balZones[Math.floor(Math.random() * balZones.length)];
			}
			else if(unitSelected == 5){
				unitName = "Juggernode";
				creditCost = 2;
				zone = jugZones[Math.floor(Math.random() * jugZones.length)];
			}
			else if(unitSelected == 6){
				unitName = "Tripwire";
				creditCost = 2;
				zone = triZones[Math.floor(Math.random() * triZones.length)];
			}
			else if(unitSelected == 7){
				unitName = "Maglev";
				creditCost = 3;
				zone = magZones[Math.floor(Math.random() * magZones.length)];
			}
			else if(unitSelected == 8){
				unitName = "Resonator";
				creditCost = 3;
				zone = resZones[Math.floor(Math.random() * resZones.length)];
			}
			else if(unitSelected == 9){
				unitName = "Integrator";
				creditCost = 3;
				zone = intZones[Math.floor(Math.random() * intZones.length)];
			}

	    let newUnitCoord =  this.game.getRandomCoordInPlayerRegion(this.playerNumber, 0, zone);


	    if (this.game.isEmptyCoord(newUnitCoord[0], newUnitCoord[1])) {
	      this.createOrder('createUnit', {
	        unitType: unitName,
	        player: this.playerNumber,
	        x: newUnitCoord[0],
	        y: newUnitCoord[1]
	      });
				credits = credits - creditCost;
	    } else {
	      this.createRandomUnit();
	      return false;
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

  createSecondBase () {

    let secondBaseCoord = this.game.getRandomCoordInPlayerRegion(this.playerNumber, 1);

    if (this.game.isCoordInPlayerRegion(secondBaseCoord[0], secondBaseCoord[1], this.playerNumber) &&
				this.game.isCoordInPlayerRegion(secondBaseCoord[0]+1, secondBaseCoord[1], this.playerNumber) &&
				this.game.isCoordInPlayerRegion(secondBaseCoord[0], secondBaseCoord[1]+1, this.playerNumber) &&
				this.game.isCoordInPlayerRegion(secondBaseCoord[0]+1, secondBaseCoord[1]+1, this.playerNumber) &&
				this.game.isEmptyCoord(secondBaseCoord[0], secondBaseCoord[1]) &&
				this.game.isEmptyCoord(secondBaseCoord[0]+1, secondBaseCoord[1]) &&
				this.game.isEmptyCoord(secondBaseCoord[0], secondBaseCoord[1]+1) &&
				this.game.isEmptyCoord(secondBaseCoord[0]+1, secondBaseCoord[1]+1)
			) {
        this.createOrder('createBase', {
          baseType: "Base",
          player: this.playerNumber,
          x: secondBaseCoord[0],
          y: secondBaseCoord[1]
        });
        return true;
      } else {
        this.createSecondBase();
        return false;
      }

  }
}
