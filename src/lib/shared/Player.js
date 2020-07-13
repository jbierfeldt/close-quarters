import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Player {

	constructor(id = 0)  {
		this.id = id;
		this.gold = 0;
		this.score = 0;
		this.credits = 10;
		this.baseCount = 0;
	}

	addBase() {
		//
	}

	removeBase() {
		//
	}

	addUnit() {
		//
	}

	removeUnit() {
		//
	}

}
