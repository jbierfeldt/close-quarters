import {createID} from './utilities.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0) {
		this.id = 'proj'+createID();
		this.orientation = initialOrientation;
		this.speed = initialSpeed;
		this.updatedThisTick = true;
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
	}

	static createFromSerialized (props) {
		return new MagBullet(props.orientation, props.speed);
	}

	update(tick) {
		this.damage = this.damage - 10;
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
		this.damage = this.damage - 10;
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}
