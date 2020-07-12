import {createID} from './utilities.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0) {
		this.id = 'proj'+createID();
		this.player = player;
		this.orientation = initialOrientation;
		this.speed = initialSpeed;
		this.damage = 0;
		this.updatedThisTick = true;
		this.ableToBeDestroyed = true; //Determines whether to destroy this projectile upon contact with a base or unit
		this.objCategory = "Projectiles";
		this.dump=false;
	}

	update(tick) {
		debug.log(0, "    Updating Projectile " + this.id + "  for tick #" + tick);
	}

	serialize () {
		return {
			id: this.id,
			player: this.player,
			objCategory: "Projectiles",
			class: this.constructor.name,
			orientation: this.orientation,
			speed: this.speed,
			damage: this.damage
		}
	}
}

export class RayBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0)  {
		super(player, initialOrientation, initialSpeed);
		this.identifier = "RayProj";
		this.damage=8;
	}

	static createFromSerialized (props) {
		return new RayBullet(props.player, props.orientation, props.speed);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class MagBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, damage)  {
		super(player, initialOrientation, initialSpeed);
		this.identifier = "MagProj";
		this.damage = damage || 50;
		this.ableToBeDestroyed = false;
		this.distance=0;
	}

	static createFromSerialized (props) {
		return new MagBullet(props.player, props.orientation, props.speed, props.damage);
	}

	update(tick) {
		super.update(tick);
		this.damage = 50-this.distance*this.distance*.25;
		if(this.damage < 0){
			this.damage=0;
		}
		console.log(this.id, this.damage);
		this.distance=this.distance+1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class JugBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0)  {
		super(player, initialOrientation, initialSpeed);
		this.identifier = "JugProj";
		this.damage = 5;

	}

	static createFromSerialized (props) {
		return new JugBullet(props.player, props.orientation, props.speed);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class BalBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0)  {
		super(player, initialOrientation, initialSpeed);
		this.identifier = "BalProj";
		this.damage = 45;
		this.created = 5;
		this.ableToBeDestroyed = false;
		this.dump = false;
	}

	static createFromSerialized (props) {
		return new BalBullet(props.player, props.orientation, props.speed);
	}

	update(tick) {
		super.update(tick);
		this.created = this.created - 1;
		if(this.created === 0){
			this.dump = true;
		}
	}

	serialize () {
		return super.serialize.call(this);
	}
}
