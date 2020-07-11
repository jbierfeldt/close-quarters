import {createID} from './utilities.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0) {
		this.id = 'proj'+createID();
		this.orientation = initialOrientation;
		this.speed = initialSpeed;
		this.damage = 0;
		this.updatedThisTick = true;
		this.liquid=true; //Determines whether to destroy this projectile upon contact with a base or unit
		this.objCategory = "Projectiles";
		this.dump=false;
	}

	update(tick) {
		debug.log(0, "    Updating Projectile " + this.id + "  for tick #" + tick);
	}

	serialize () {
		return {
			id: this.id,
			objCategory: "Projectiles",
			class: this.constructor.name,
			orientation: this.orientation,
			speed: this.speed,
			damage: this.damage
		}
	}
}

export class RayBullet extends Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0)  {
		super(initialOrientation, initialSpeed);
		this.identifier = "RayProj";
		this.damage=8;
	}

	static createFromSerialized (props) {
		return new RayBullet(props.orientation, props.speed);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class MagBullet extends Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0)  {
		super(initialOrientation, initialSpeed);
		this.identifier = "MagProj";
		this.damage = 50;
		this.liquid=false;
		this.distance=1;
	}

	static createFromSerialized (props) {
		return new MagBullet(props.orientation, props.speed);
	}

	update(tick) {
		this.damage = this.damage - 1*distance*distance;
		if(this.damage < 0){
			this.damage=0;
		}
		this.distance=distance+1;
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class JugBullet extends Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0)  {
		super(initialOrientation, initialSpeed);
		this.identifier = "JugProj";
		this.damage = 5;

	}

	static createFromSerialized (props) {
		return new JugBullet(props.orientation, props.speed);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class BalBullet extends Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0)  {
		super(initialOrientation, initialSpeed);
		this.identifier = "BalProj";
		this.damage = 45;
		this.created = 5;
		this.dump=false;
	}

	static createFromSerialized (props) {
		return new BalBullet(props.orientation, props.speed);
	}

	update(tick) {
		super.update(tick);
		this.created = this.created - 1;
		if(this.created === 0){
			this.dump=true;
		}
	}

	serialize () {
		return super.serialize.call(this);
	}
}
