import {createID} from './utilities.js';
import Projectile from './Projectile.js';

export default class Unit {

	constructor(maxHealth = 0)  {
		this.id = 'unit'+createID();
		this.maxHealth = maxHealth;
		this.health = 0;
	}

	update (tick) {
		console.log("Updating Unit \'" + this.id + "\' for tick #" + tick);
	}

	unitDestroyed() {
		
	}

}

export class RayTracer extends Unit {

	constructor(maxHealth = 0, health =  maxHealth, player = undefined)  {
		super(maxHealth);
		this.health = health;
		this.player = player;

		this.firing = false;
	}

	startAttack(tick){

		//initialize a project object and pass in the direction based on the tick 

	}
}
export class JuggerNode extends Unit {

	constructor(maxHealth = 0, health =  maxHealth, player = undefined)  {
		super(maxHealth);
		this.health = health;
		this.player = player;

		this.firing = false;
	}

	startAttack(tick){

	}
}