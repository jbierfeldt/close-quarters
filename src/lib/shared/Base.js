import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Base {

	constructor(player,x,y)  {

		this.maxHealth = 300;
		this.health = 300;
		this.player=player;
	}
	update(tick){
		
	}

}
