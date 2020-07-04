import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Base {

	constructor(id = 0,player)  {
		this.id = id;
		this.maxHealth = 300;
		this.health = 300;
		this.player=player;
	}

	updateBase(player,damage){
		this.health=this.health-damage;
	}

	serialize () {
		return {
			id: this.id,
			class: this.constructor.name,
			player: this.player,
			health: this.health
		}
	}

}
