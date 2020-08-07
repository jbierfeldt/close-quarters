import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Player {

	constructor(id = 0)  {
		this.id = id;
		this.gold = 0;
		this.score = 0;
		this.credits = 5;
		this.baseCount = 0;
		this.basePlaced = 0;
		//The second number keeps track of when in the simulation it happens.
		this.victoryCondition = [0, 0];
		this.damageDealtToBases = 0;
	}

}
