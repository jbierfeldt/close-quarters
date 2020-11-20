import {createID} from './utilities.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unitID, id) {
		this.id = id || 'proj_'+createID();
		this.player = player;
		this.orientation = initialOrientation;
		this.speed = initialSpeed;
		this.damage = 0;
		this.updatedThisTick = true;
		this.ableToBeDestroyed = true; //Determines whether to destroy this projectile upon contact with a base or unit
		this.objCategory = "Projectiles";
		this.dump = false;
		this.unit = unitID || 234;
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
			distance: this.distance,
			created: this.created,
			projCount: this.projCount,
			unit: this.unit

		}
	}
}

export class RayBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "RayProj";
		this.damage = 10;
	}

	static createFromSerialized (props) {
		return new RayBullet(props.player, props.orientation, props.speed, props.unit, props.id);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class RedBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, damage = 0, distance = 0, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "RedProj";
		this.damage = damage;
		this.ableToBeDestroyed = true;
		this.dump = false;
		this.distance = distance;
		this.firing=false;
		this.player =player;
		this.speed = initialSpeed;
		this.orientation = initialOrientation;
	}

	static createFromSerialized (props) {
		return new RedBullet(props.player, props.orientation, props.speed, props.unit, props.damage, props.distance, props.id);
	}

	update(tick) {
		super.update(tick);
		if(this.distance >= 10){
			this.damage = 30;
		}
		else{
			this.damage = 0;
		}
		this.distance = this.distance + 1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}


export class OscBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, created = 0, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "OscProj";
		this.damage = 60;
		this.orientation = initialOrientation;
		this.created = created;
	}

	static createFromSerialized (props) {
		return new OscBullet(props.player, props.orientation, props.speed, props.unit, props.created, props.id);
	}

	update(tick) {
		super.update(tick);
		if(this.created % 5 == 0){
			let randX = Math.floor(Math.random()*3)-1;
			let randY = Math.floor(Math.random()*3)-1;
			this.orientation = [randX, randY];
		}
		else{
			this.orientation = [0,0];
		}

		this.created = this.created + 1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class MagBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, damage = 40, distance = 0, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "MagProj";
		this.damage = damage;
		this.maxDamage = 40;
		this.ableToBeDestroyed = true;
		this.distance = distance;
	}

	static createFromSerialized (props) {
		return new MagBullet(props.player, props.orientation, props.speed, props.unit, props.damage, props.distance, props.id);
	}

	update(tick) {
		super.update(tick);
		this.damage = this.maxDamage - Math.round(this.distance*this.distance*.35);
		if(this.damage <= 0){
			this.damage = 5;
		}
		this.distance=this.distance+1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class JugBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "JugProj";
		this.damage = 4;
		this.ableToBeDestroyed = false;

	}

	static createFromSerialized (props) {
		return new JugBullet(props.player, props.orientation, props.speed, props.unit, props.id);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class BalBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, created = 5, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "BalProj";
		this.damage = 12;
		this.created = created;
		this.ableToBeDestroyed = false;
		this.dump = false;
	}

	static createFromSerialized (props) {
		return new BalBullet(props.player, props.orientation, props.speed, props.unit, props.created, props.id);
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
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, damage = 0, distance = 6 + Math.floor(Math.random()*11), id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		//distance = 4 + Math.floor(Math.random()*5
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
		this.unit = unit;
	}

	static createFromSerialized (props) {
		return new CirBullet(props.player, props.orientation, props.speed, props.unit, props.damage, props.distance, props.id);
	}

	update(tick) {
		///COME BACK TO
		super.update(tick);
		this.firing=false;
		if(this.distance === 1){
			this.damage = 30;
			this.firing=true;
			for(let i = 0; i < 4; i = i + 1){
				if(i == 0){
					this.projArr[i] = new CirBullet(this.player, [1+1*this.orientation[0],0+1*this.orientation[1]], 0, this.unit, Math.floor(this.damage/2), 0);
				}
				else if(i == 1){
					this.projArr[i] = new CirBullet(this.player, [0+1*this.orientation[0],1+1*this.orientation[1]], 0, this.unit, Math.floor(this.damage/2), 0);
				}
				else if(i == 2){
					this.projArr[i] = new CirBullet(this.player, [0+1*this.orientation[0],-1+1*this.orientation[1]], 0, this.unit, Math.floor(this.damage/2), 0);
				}
				else if(i == 3){
					this.projArr[i] = new CirBullet(this.player, [-1+1*this.orientation[0],0+1*this.orientation[1]], 0, this.unit, Math.floor(this.damage/2), 0);
				}
			}
		}
		if(this.distance == 0){
			this.dump = true;
			this.speed=0;
		}
		this.distance = this.distance - 1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class IntBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, projCount, lifeSpan, unit, distance = 0, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "IntProj";
		this.damage = Math.floor(10*Math.sqrt(lifeSpan));
		this.ableToBeDestroyed = true;
		this.dump = false;
		this.distance = distance;
		this.player =player;
		this.speed = initialSpeed;
		this.orientation = initialOrientation;
	}

	static createFromSerialized (props) {
		return new IntBullet(props.player, props.orientation, props.speed, props.projCount, props.lifeSpan, props.unit, props.distance, props.id);
	}

	update(tick) {
		super.update(tick);
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class TriBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, damage = 0, distance = 3, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "TriProj";
		this.damage = damage;
		this.ableToBeDestroyed = false;
		this.dump = false;
		this.distance = distance;
		this.player = player;
		this.speed = initialSpeed;
		this.orientation = initialOrientation;
	}

	static createFromSerialized (props) {
		return new TriBullet(props.player, props.orientation, props.speed, props.unit, props.damage, props.distance, props.id);
	}

	update(tick) {
		super.update(tick);
		if(this.distance == 0){
			this.dump = true;
			this.speed = 0;
		}
		this.distance = this.distance - 1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}



export class BeaBullet extends Projectile {
	constructor(player, initialOrientation = [0, 0], initialSpeed = 0, unit, distance = 0, id)  {
		super(player, initialOrientation, initialSpeed, unit, id);
		this.identifier = "BeaProj";
		this.damage = 30;
		this.ableToBeDestroyed = true;
		this.dump = false;
		this.distance = distance;
		this.player = player;
		this.speed = initialSpeed;
		this.orientation = initialOrientation;
	}

	static createFromSerialized (props) {
		return new BeaBullet(props.player, props.orientation, props.speed, props.unit, props.distance, props.id);
	}

	update(tick) {
		super.update(tick);
		if(this.distance == 7){
			let rando = Math.floor(Math.random()*2);
			this.orientation[rando] = 0;
		}
		this.distance = this.distance + 1;
	}

	serialize () {
		return super.serialize.call(this);
	}
}
