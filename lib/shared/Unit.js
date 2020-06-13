import {createID} from './utilities.js';
import Projectile from './Projectile.js';

export default class Unit {

	constructor(maxHealth = 0)  {
		this.id = 'unit'+createID();
		this.maxHealth = maxHealth;
		this.health = 0;
	}

	update (tick) {
		debug.log(0, "    Updating Unit " + this.id + "  for tick #" + tick);
	}

	unitDestroyed() {
		
	}

	serialize() {
		const vals = Object.keys(this);
		debug.log(2, vals);

		const replacer = function(name, val) {
			if (val instanceof Object && !(val instanceof Unit)) {
				return val.id;
			}
			else {
				return val;
			}
		}

		debug.log(2, JSON.stringify(this, replacer));
		return {
			_class: this.constructor.name
		}
	}

}

export class RayTracer extends Unit {

	constructor(maxHealth = 0, health =  maxHealth, player = 1)  {
		super(maxHealth);
		this.health = health;
		this.player = player;
		this.identifier = "Ray"
		this.firing = false;
	}

	startAttack(tick){

		//initialize a project object and pass in the direction based on the tick 
		this.firing = new Projectile([1, 0], 1);
		debug.log(0, "    Unit " + this.id + "  is firing Projectile " + this.firing.id);

	}

	update(tick) {
		super.update(tick);

		// reset firing
		this.firing = false;

		// Ray Tracer fires every 4 ticks
		if (tick%4 === 0) {
			this.startAttack();
		}
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