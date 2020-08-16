import {DEBUG} from './utilities.js';
import {createID} from './utilities.js';

const debug = new DEBUG(true, 5);

export class Base {

	constructor(player, health, id, collidedWith = [false, 4]) {
		this.id = id || 'base'+createID();
		this.player = player;
		this.maxHealth = 1000;
		this.health = health || this.maxHealth;
		this.objCategory = "Bases";
		this.identifier = "Base";
		this.collidedWith = collidedWith;
		this.fullName = "Power Core";
		this.turnsActive = 0;
	}

	static createFromSerialized (props) {
		return new Base(props.player, props.health, props.id, props.collidedWith);
	}

	update(tick) {

		this.collidedWith = [false, 4];
	}

	serialize () {
		return {
			id: this.id,
			objCategory: "Bases",
			class: this.constructor.name,
			player: this.player,
			health: this.health,
			collidedWith: this.collidedWith
		}
	}

}
