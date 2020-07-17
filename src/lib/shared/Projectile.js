import {createID} from './utilities.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, id) {
		this.id = id || 'proj'+createID();
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
			damage: this.damage,
			distance: this.distance
		}
	}
}

export class RayBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, id)  {
		super(player, initialOrientation, initialSpeed, id);
		this.identifier = "RayProj";
		this.damage = 10;
	}

	static createFromSerialized (props) {
		return new RayBullet(props.player, props.orientation, props.speed, props.id);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class MagBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, damage = 80, distance = 0, id)  {
		super(player, initialOrientation, initialSpeed, id);
		this.identifier = "MagProj";
		this.damage = damage;
		this.maxDamage = 80;
		this.ableToBeDestroyed = false;
		this.distance = distance;
	}

	static createFromSerialized (props) {
		return new MagBullet(props.player, props.orientation, props.speed, props.damage, props.distance, props.id);
	}

	update(tick) {
		super.update(tick);
		this.damage = this.maxDamage - Math.round(this.distance*this.distance*.35);
		if(this.damage <= 0){
			this.damage = 1;
		}
		this.distance=this.distance+1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class JugBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, id)  {
		super(player, initialOrientation, initialSpeed, id);
		this.identifier = "JugProj";
		this.damage = 7;

	}

	static createFromSerialized (props) {
		return new JugBullet(props.player, props.orientation, props.speed, props.id);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class BalBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, created = 5, id)  {
		super(player, initialOrientation, initialSpeed, id);
		this.identifier = "BalProj";
		this.damage = 12;
		this.created = created;
		this.ableToBeDestroyed = false;
		this.dump = false;
	}

	static createFromSerialized (props) {
		return new BalBullet(props.player, props.orientation, props.speed, props.created, props.id);
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

export class CirBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, damage = 0, distance = 4+Math.floor(Math.random()*5), id)  {
		super(player, initialOrientation, initialSpeed, id);
		this.identifier = "CirProj";
		this.damage = damage;
		this.ableToBeDestroyed = false;
		this.dump = false;
		this.distance = distance;
		this.firing=false;
		this.projArr = [];
		this.player =player;
		this.speed = initialSpeed;
		this.orientation = initialOrientation;
	}

	static createFromSerialized (props) {
		return new CirBullet(props.player, props.orientation, props.speed, props.damage, props.distance, props.id);
	}

	update(tick) {
		super.update(tick);
		this.firing=false;
		if(this.distance === 1){
			this.damage = 150;
			this.firing=true;
			for(let i = 0; i < 4; i = i + 1){
				if(i == 0){
					this.projArr[i] = new CirBullet(this.player, [1+2*this.orientation[0],0+2*this.orientation[1]], 0,this.damage/2, 0);
				}
				else if(i == 1){
					this.projArr[i] = new CirBullet(this.player, [0+2*this.orientation[0],1+2*this.orientation[1]], 0,this.damage/2, 0);
				}
				else if(i == 2){
					this.projArr[i] = new CirBullet(this.player, [0+2*this.orientation[0],-1+2*this.orientation[1]], 0,this.damage/2, 0);
				}
				else if(i == 3){
					this.projArr[i] = new CirBullet(this.player, [-1+2*this.orientation[0],0+2*this.orientation[1]], 0,this.damage/2, 0);
				}
			}
		}
		if(this.distance == 0){
			this.dump = true;
			if(this.speed == 0){
				console.log(this.id, this.dump, this.updatedThisTick);
			}
		}
		this.distance = this.distance - 1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}
