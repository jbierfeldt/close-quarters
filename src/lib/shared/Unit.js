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
	}

	static createFromSerialized (serializedObject) {
		console.log(JSON.parse(serializedObject));
	}

	update (tick) {
		debug.log(0, "    Updating Unit " + this.id + "  for tick #" + tick);
	}

	serialize () {
		return {
			id: this.id,
			objCategory: "Units",
			class: this.constructor.name,
			player: this.player,
			health: this.health,
			firing: this.firing
		}
	}

}

export class RayTracer extends Unit {

	constructor(player, health, firing, id)  {
		super(id);
		this.player = player;
		this.health = health || 100;
		this.firing = firing || false;
		this.maxHealth = 100;
		this.identifier = "Ray";
		this.projArr = [];
	}

	static createFromSerialized (props) {
		return new RayTracer(props.player, props.health, props.firing, props.id)
	}

	startAttack(orientation){

		//initialize a project object and pass in the direction based on the tick
		this.firing = true;
		this.projArr[0]  = new Projectiles.RayBullet(orientation, 1);

		debug.log(0, "    Unit " + this.id + "  is firing Projectile " + this.firing.id);

	}

	update(tick) {
		super.update(tick);

		// reset firing
		this.firing = false;
		// Ray Tracer fires every 4 ticks
		if (tick%10 === 0) {
			if(this.player==1 || this.player==2){
			this.startAttack([1,0]);

			}
			else if(this.player==3 || this.player==4){
				this.startAttack([-1,0]);
			}
		}
		else if (tick%5 === 0){
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

	constructor(player, health, firing, id)  {
		super(id);
		this.player = player;
		this.health = health || 500;
		this.firing = firing || false;
		this.maxHealth = 500;
		this.identifier="Jug";
		this.projArr = [];
	}

	static createFromSerialized (props) {
		return new Juggernode(props.player, props.health, props.firing, props.id)
	}

	startAttack (orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.JugBullet(orientation, 1);
	}

	update (tick) {
		this.firing=false;
		if (tick%4 !== 0) {
			this.invulnerable == true;
		}
		else {
			this.invulnerable == false;
			this.startAttack([1,1]);
		}
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class Maglev extends Unit {

	constructor(player, health, firing, id)  {
		super(id);
		this.player = player;
		this.health = health || 100;
		this.firing = firing || false;
		this.maxHealth = 100;
		this.identifier = "Mag"
		this.projArr = [];
	}

	static createFromSerialized (props) {
		return new Maglev(props.player, props.health, props.firing, props.id)
	}

	startAttack(tick){
		const arr = []
		let i = 0;
		for(let a = -1; a < 2; a = a + 1){
			for(let b = -1; b < 2; b = b + 1){
			   if(a !== 0 || b !== 0){
		       	this.projArr[i] = new Projectiles.MagBullet([a,b], 1);
		       	i = i + 1;
					}
				}
	  }
	  this.firing = true;
	}

	update(tick) {
		super.update(tick);

		// reset firing
		this.firing = false;

		// Ray Tracer fires every 4 ticks
		if (tick % 8 === 0) {
			this.startAttack();
		}
	}

	serialize () {
		return super.serialize.call(this);
	}

}
