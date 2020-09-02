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
    let newUnitCoord =  this.game.getRandomCoordInPlayerRegion(this.playerNumber, 0);

    if (this.game.isEmptyCoord(newUnitCoord[0], newUnitCoord[1])) {
      this.createOrder('createUnit', {
        unitType: "RayTracer",
        player: this.playerNumber,
        x: newUnitCoord[0],
        y: newUnitCoord[1]
      });
      return true;
    } else {
      this.createRandomUnit();
      return false;
    }
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
