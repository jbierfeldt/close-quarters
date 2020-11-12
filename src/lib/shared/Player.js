import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Player {

	constructor(id = 0)  {
		this.id = id;
		this.gold = 0;
		this.score = 0;
		this.credits = 7;
		this.baseCount = 0;
		this.basePlaced = 0;

		// -1 (defeated), 0, 1 (victorious)
		this.victoryCondition = 0;

		this.damageDealtToBases = 0;


		//Statistics (for review phase)
		this.damageDealtThisTurn = 0;
		this.unitsLostThisTurn = 0;
		this.unitsKilledThisTurn = 0;
		this.creditsEarnedThisTurn = 0;

		this.damageDealtTotal = 0 ;
		this.unitsLostTotal = 0;
		this.unitsKilledTotal = 0;
		this.creditsEarnedTotal = 0;

		this.unitsPlaced = [];
		this.frequentUnit = "";
	}

}
