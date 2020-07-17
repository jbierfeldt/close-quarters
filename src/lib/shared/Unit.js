import {createID} from './utilities.js';
import * as Projectiles from './Projectile.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);


//Make sure game checks if a unit is invulnerable before applying damage!!!

export default class Unit {

	constructor(id = undefined)  {
		this.id = id || 'unit'+createID();
		this.health = 0;
		this.invulnerable=false;
		this.objCategory = "Units";
		this.collidedWith = [];
	}

	static createFromSerialized (serializedObject) {
		console.log(JSON.parse(serializedObject));
	}

	update (tick) {
		//this.collidedWith = [false, 4];
		debug.log(0, "    Updating Unit " + this.id + "  for tick #" + tick);
	}

	serialize () {
		return {
			id: this.id,
			objCategory: "Units",
			class: this.constructor.name,
			player: this.player,
			health: this.health,
			firing: this.firing,
			collidedWith: this.collidedWith
		}
	}

}

export class RayTracer extends Unit {

	constructor(player, health = 100, firing = false, id, collidedWith = [false, 4])  {
		super(id);
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.maxHealth = 100;
		this.identifier = "Ray";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 1;
	}

	static createFromSerialized (props) {
		return new RayTracer(props.player, props.health, props.firing, props.id, props.collidedWith)
	}

	startAttack(orientation){

		//initialize a project object and pass in the direction based on the tick
		this.firing = true;
		this.projArr[0]  = new Projectiles.RayBullet(this.player, orientation, 1);

		debug.log(0, "    Unit " + this.id + "  is firing Projectile " + this.firing.id);

	}

	update(tick) {
		super.update(tick);
		this.collidedWith = [false, 4];
		// reset firing
		this.firing = false;
		// Ray Tracer fires every 4 ticks
		if (tick%14 === 0) {
			if(this.player==1 || this.player==2){
				this.startAttack([1,0]);

			}
			else if(this.player==3 || this.player==4){
				this.startAttack([-1,0]);
			}
		}
		else if (tick%7 === 0){
			if(this.player==1 || this.player==3){
				this.startAttack([0,1]);
			}
			else if(this.player==2 || this.player==4){
				this.startAttack([0,-1]);
			}
		}
	}

	serialize () {
		return super.serialize.call(this);
	}

}

export class Juggernode extends Unit {

	constructor(player, health = 400, firing = false, id,  collidedWith = [false, 4])  {
		super(id);
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.maxHealth = 400;
		this.identifier="Jug";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 2;
	}

	static createFromSerialized (props) {
		return new Juggernode(props.player, props.health, props.firing, props.id, props.collidedWith)
	}

	startAttack (orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.JugBullet(this.player, orientation, 1);
	}

	update (tick) {
		super.update(tick);
		this.collidedWith = [false, 4];
		this.firing=false;
		if (tick%8 === 0) {
			if(this.player==1){
				this.startAttack([1,1]);
			}
			else if(this.player==2){
				this.startAttack([1,-1]);
			}
			else if(this.player==3){
				this.startAttack([-1,1]);
			}
			else if(this.player==4){
				this.startAttack([-1,-1]);
			}
		}
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class Maglev extends Unit {

	constructor(player, health = 225, firing = false, id, collidedWith = [false, 4])  {
		super(id);
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.maxHealth = 225;
		this.identifier = "Mag"
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 3;

	}

	static createFromSerialized (props) {
		return new Maglev(props.player, props.health, props.firing, props.id, props.collidedWith)
	}

	startAttack(tick){
		this.firing = true;
		let firingChoice = Math.floor(Math.random()*2);
		const arr = []
		let i = 0;
		for(let a = -1; a < 2; a = a + 1){
			for(let b = -1; b < 2; b = b + 1){
				if(a !== 0 || b !== 0){
					if(firingChoice == 0){
						if(a === 0 || b === 0){
							this.projArr[i] = new Projectiles.MagBullet(this.player, [a,b], 1);
							i = i + 1;
						}
					}
					if(firingChoice == 1){
						if(a !== 0  && b !== 0){
							this.projArr[i] = new Projectiles.MagBullet(this.player, [a,b], 1);
							i = i + 1;
						}
					}

				}
			}
		}
	}

	update(tick) {
		super.update(tick);
		this.collidedWith = [false, 4];
		// reset firing
		this.firing = false;

		// Ray Tracer fires every 4 ticks
		if (tick % 12 === 0) {
			this.startAttack();
		}
	}

	serialize () {
		return super.serialize.call(this);
	}

}

export class Ballast extends Unit {

	constructor(player, health = 250, firing = false, id, collidedWith = [false, 4])  {
		super(id);
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.maxHealth = 250;
		this.identifier="Bal";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 2;
	}

	static createFromSerialized (props) {
		return new Ballast(props.player, props.health, props.firing, props.id, props.collidedWith)
	}

	startAttack (orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.BalBullet(this.player, orientation, 0);
	}

	update (tick) {
		super.update(tick);
		this.collidedWith = [false, 4];
		this.firing=false;
		if(tick % 7 === 0){
			let rando = Math.random()*6;
			let multx = 1;
			let multy = 1;
			let targOne = 6;
			let targTwo = 3;
			if(this.player == 1){
				multx = 1;
				multy = 1;
			}
			else if(this.player == 2){
				multx = 1;
				multy = -1;
			}
			else if(this.player == 3){
				multx = -1;
				multy = 1;
			}
			else if(this.player == 4){
				multx = -1;
				multy = -1;
			}
			if(rando < 1){
				this.startAttack([multx*targOne, multy*targTwo]);
			}
			else if(rando < 2){
				this.startAttack([multx*targOne, multy*-targTwo]);
			}
			else if(rando < 3){
				this.startAttack([multx*targTwo, multy*targOne]);
			}
			else if(rando < 4){
				this.startAttack([multx*targTwo, multy*-targOne]);
			}
			else if(rando < 5){
				this.startAttack([multx*-targTwo, multy*targOne]);
			}
			else if(rando < 6){
				this.startAttack([multx*-targOne, multy*targTwo]);
			}
		}
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class CircuitBreaker extends Unit {

	constructor(player, health = 300, firing = false, id, collidedWith = [false, 4])  {
		super(id);
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.maxHealth = 300;
		this.identifier="Cir";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 3;
	}

	static createFromSerialized (props) {
		return new CircuitBreaker(props.player, props.health, props.firing, props.id, props.collidedWith)
	}

	startAttack (orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.CirBullet(this.player, orientation, 2);
	}

	update (tick) {
		super.update(tick);
		this.collidedWith = [false, 4];
		this.firing=false;
		if(tick % 10 === 0){
			let rando = Math.random()*3;
			if(rando < 1){
				if(this.player == 1 || this.player == 2){
					this.startAttack([1,0]);
				}
				else{
					this.startAttack([-1,0]);
				}
			}
			else if(rando < 2){
				if(this.player == 1){
					this.startAttack([1,1]);
				}
				else if(this.player == 2){
					this.startAttack([1,-1]);
				}
				else if(this.player == 3){
					this.startAttack([-1,1]);
				}
				else if(this.player == 4){
					this.startAttack([-1,-1]);
				}
			}
			else if(rando <= 3){
				if(this.player == 1 || this.player == 3){
					this.startAttack([0,1]);
				}
				else{
					this.startAttack([0,-1]);
				}
			}
		}
	}

	serialize () {
		return super.serialize.call(this);
	}
}





//Unit Pricing
CircuitBreaker.cost = 3;
Maglev.cost = 3;
RayTracer.cost = 1;
Juggernode.cost = 2;
Ballast.cost = 2;
