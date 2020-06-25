import {createID} from './utilities.js';
import * as Projectiles from './Projectile.js';
import {DEBUG} from './utilities.js';

const debug = new DEBUG(true, 5);

export default class Unit {

	constructor(maxHealth = 0)  {
		this.id = 'unit'+createID();
		this.maxHealth = maxHealth;
		this.health = 0;
		this.invulnerable=false;
	}

	update (tick) {
		debug.log(0, "    Updating Unit " + this.id + "  for tick #" + tick);
	}

	unitDestroyed() {

	}

}

export class RayTracer extends Unit {

	constructor(maxHealth = 0, health =  maxHealth, player = 1)  {
		super(maxHealth);
		this.health = health;
		this.player = player;
		this.identifier = "Ray";
		this.firing = false;
		this.projArr = [];
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
}
export class Juggernode extends Unit {

	constructor(maxHealth = 0, health =  maxHealth, player = undefined)  {
		super(maxHealth);
		this.health = health;
		this.player = player;
		this.identifier="Jug";
		this.projArr = [];
		this.firing = false;
	}

	startAttack(orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.JugBullet(orientation, 1);

	}
	update(tick) {
		this.firing=false;
	if(tick%4 !== 0){
		this.invulnerable==true;
	}
	else{
		this.invulnerable==false;
		this.startAttack([1,1]);
	}
	}
}

export class Maglev extends Unit {

	constructor(maxHealth = 0, health =  maxHealth, player = undefined)  {
		super(maxHealth);
		this.health = health;
		this.player = player;
		this.identifier = "Mag"
		this.firing = false;
		this.projArr = [];
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

}
