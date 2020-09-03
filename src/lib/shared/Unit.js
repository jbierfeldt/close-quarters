import {createID} from './utilities.js';
import * as Projectiles from './Projectile.js';
import {DEBUG} from './utilities.js';
import Game from './Game.js';

const debug = new DEBUG(true, 5);

//Next Unit - The Haywire
//Make sure game checks if a unit is invulnerable before applying damage!!!

export default class Unit {

	constructor(id = undefined)  {
		this.id = id || 'unit'+createID();
		this.health = 0;
		this.invulnerable=false;
		this.objCategory = "Units";
		this.collidedWith = [];
		this.turnsActive = 0;
		this.damageDealt = 0;
		//this.lifeSpan = 0;
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
			collidedWith: this.collidedWith,
			tripped: this.tripped,
			lifeSpan: this.lifeSpan,
			ticksSinceDamage: this.ticksSinceDamage,
			tripDamage: this.tripDamage,
			turnsActive: this.turnsActive,
			damageDealt: this.damageDealt
			//ADD ALL OTHER VARIABLES
	}

}
}
export class RayTracer extends Unit {

	constructor(player, health = 100, firing = false, id, collidedWith = [false, 4], lifeSpan = 0, damageDealt=0)  {
		super(id);
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.identifier = "Ray";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 1;
		this.fullName = "Ray Tracer";
		this.damageDealt = damageDealt;
	}

	static maxHealth = 100;
	static cost = 1;
	static orientations = {
		1: [[1,0],[0,1]],
		2: [[1,0],[0,-1]],
		3: [[-1,0],[0,1]],
		4: [[-1,0],[0,-1]]
	}
	static description = "The Ray Tracer is a precise offensive machine used for reliable multifrontal attacks. It alternates firing horizontally and vertically, dealing 10 damage with each blast.";

	static createFromSerialized (props) {
		return new RayTracer(props.player, props.health, props.firing, props.id, props.collidedWith,props.lifeSpan,props.damageDealt)
	}

	startAttack(orientation){

		//initialize a project object and pass in the direction based on the tick
		this.firing = true;
		this.projArr[0]  = new Projectiles.RayBullet(this.player, orientation, 1, this.id);

		debug.log(0, "    Unit " + this.id + "  is firing Projectile " + this.firing.id);

	}

	update(tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		this.collidedWith = [false, 4];
		// reset firing
		this.firing = false;
		// Ray Tracer fires every 4 ticks
		if (tick%12 === 0) {
			if(this.player==1 || this.player==2){
				this.startAttack([1,0]);

			}
			else if(this.player==3 || this.player==4){
				this.startAttack([-1,0]);
			}
		}
		else if (tick%6 === 0){
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

export class RedShifter extends Unit {

	constructor(player, health = 50, firing = false, id, collidedWith = [false, 4],lifeSpan = 0,damageDealt=0)  {
		super(id);
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.identifier = "Red";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 1;
		this.fullName = "Red Shifter";
		this.damageDealt = damageDealt;
	}

	static maxHealth = 50;
	static cost = 1;
	static orientations = {
		1: [[1,0],[0,1],[1,1]],
		2: [[1,0],[0,-1],[1,-1]],
		3: [[-1,0],[0,1],[-1,1]],
		4: [[-1,0],[0,-1],[-1,-1]]
	}
	static description = "The Red Shifter is an offensive long-range unit that has low health and deals average damage. It randomly fires in two directions and the strikes must travel at least 10 tiles in order to have  an effect.";

	static createFromSerialized (props) {
		return new RedShifter(props.player, props.health, props.firing, props.id, props.collidedWith, props.lifeSpan,props.damageDealt)
	}

	startAttack(orientation){

		//initialize a project object and pass in the direction based on the tick
		this.firing = true;
	  let direction = 1+Math.floor(Math.random()*3);
	//let direction =1;
		if(direction === 1){
			if(this.player == 1){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [1,0], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [1,1], 1, this.id);
			}
			else if(this.player == 2){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [1,0], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [1,-1], 1, this.id);
			}
			else if(this.player == 3){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [-1,0], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [-1,1], 1, this.id);
			}
			else if(this.player == 4){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [-1,0], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [-1,-1], 1, this.id);
			}
		}
		else if(direction === 2){
			if(this.player == 1){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,1], 1, this.id);
		   	this.projArr[1]  = new Projectiles.RedBullet(this.player, [1,1], 1, this.id);
			}
			else if(this.player == 2){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,-1], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [1,-1], 1, this.id);
			}
			else if(this.player == 3){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,1], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [-1,1], 1, this.id);
			}
			else if(this.player == 4){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,-1], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [-1,-1], 1, this.id);
			}
		}
		else{
			if(this.player == 1){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,1], 1, this.id);
		    this.projArr[1]  = new Projectiles.RedBullet(this.player, [1,0], 1, this.id);
			}
			else if(this.player == 2){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,-1], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [1,0], 1, this.id);
			}
			else if(this.player == 3){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,1], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [-1,0], 1, this.id);
			}
			else if(this.player == 4){
				this.projArr[0]  = new Projectiles.RedBullet(this.player, [0,-1], 1, this.id);
				this.projArr[1]  = new Projectiles.RedBullet(this.player, [-1,0], 1, this.id);
			}

		}

		debug.log(0, "    Unit " + this.id + "  is firing Projectile " + this.firing.id);

	}

	update(tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		this.collidedWith = [false, 4];
		this.projArr = [];
		// reset firing
		this.firing = false;
		if(tick % 18 === 0){
			this.startAttack(0);
		}

	}

	serialize () {
		return super.serialize.call(this);
	}

}

export class Oscillator extends Unit {

	constructor(player, health = 250, firing = false, id, collidedWith = [false, 4], lifeSpan = 0, damageDealt = 0)  {
		super(id);
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.identifier = "Osc";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 1;
		this.fullName = "Oscillator";
		this.damageDealt = damageDealt;
	}

	static maxHealth = 250;
	static cost = 1;
	static orientations = {
		1: [[1,1]],
		2: [[1,-1]],
		3: [[-1,1]],
		4: [[-1,-1]]
	}
	static description = "The Oscillator is an inexpensive defensive unit that generates a single, powerful projectile at the start of each round. The beam begins diagonally and then acts as a random mover until hitting a target, where it deals 60 damage.";

	static createFromSerialized (props) {
		return new Oscillator(props.player, props.health, props.firing, props.id, props.collidedWith, props.lifeSpan, props.damageDealt)
	}

	startAttack(orientation){

		//initialize a project object and pass in the direction based on the tick
		this.firing = true;
		this.projArr[0]  = new Projectiles.OscBullet(this.player, orientation, 1, this.id);

		debug.log(0, "    Unit " + this.id + "  is firing Projectile " + this.firing.id);

	}

	update(tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		this.collidedWith = [false, 4];
		// reset firing
		this.firing = false;
		// Oscillator fires at the beginning of the turn
		if (tick === 1) {
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
	}

	serialize () {
		return super.serialize.call(this);
	}

}

export class Juggernode extends Unit {

	constructor(player, health = 400, firing = false, id,  collidedWith = [false, 4], lifeSpan = 0, damageDealt = 0)  {
		super(id);
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.identifier="Jug";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 2;
		this.fullName = "Juggernode";
		this.damageDealt = damageDealt;
	}

	static maxHealth = 400;
	static cost = 2;
	static orientations = {
		1: [[1,1],[-1,1],[1,-1]],
		2: [[-1,-1],[1,-1],[1,1]],
		3: [[-1,-1],[-1,1],[1,1]],
		4: [[-1,-1],[-1,1],[1,-1]]
	}
	static description = "The Juggernode is a standard defensive unit that also delivers diagonal strikes. Its photon beam fires toward the opposite corner of the player, dealing a small amount of damage to everything within the path.";

	static createFromSerialized (props) {
		return new Juggernode(props.player, props.health, props.firing, props.id, props.collidedWith, props.lifeSpan, props.damageDealt)
	}

	startAttack (orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.JugBullet(this.player, orientation, 1, this.id);
	}

	update (tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		this.collidedWith = [false, 4];
		this.firing=false;
		let direction = 1+Math.floor(Math.random()*3);
		if (tick%9 === 0) {
			if(direction === 1){
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
			else if(direction === 2){
				if(this.player==1){
					this.startAttack([1,-1]);
				}
				else if(this.player==2){
					this.startAttack([-1,-1]);
				}
				else if(this.player==3){
					this.startAttack([1,1]);
				}
				else if(this.player==4){
					this.startAttack([-1,1]);
				}
			}
			else if(direction === 3){
				if(this.player==1){
					this.startAttack([-1,1]);
				}
				else if(this.player==2){
					this.startAttack([1,1]);
				}
				else if(this.player==3){
					this.startAttack([-1,-1]);
				}
				else if(this.player==4){
					this.startAttack([1,-1]);
				}
			}
		}
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class Maglev extends Unit {

	constructor(player, health = 300, firing = false, id, collidedWith = [false, 4], lifeSpan = 0, damageDealt = 0)  {
		super(id);
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.identifier = "Mag"
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 3;
		this.fullName = "Maglev";
		this.damageDealt = damageDealt;
	}

  static maxHealth = 300;
	static cost = 3;
	static orientations = {
		1: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]],
		2: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]],
		3: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]],
		4: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]]
	}
	static description = "The Maglev is a lightweight offensive powerhouse that emits magnetic pulses. It will randomly strike either in every diagonal direction or orthogonal direction. The pulses begin with a high base damage and fade off exponentially as they travel.";

	static createFromSerialized (props) {
		return new Maglev(props.player, props.health, props.firing, props.id, props.collidedWith, props.lifeSpan, props.damageDealt);
	}

	startAttack(tick){
		this.firing = true;
		let firingChoice = Math.floor(Math.random()*2);
		let i = 0;
		for(let a = -1; a < 2; a = a + 1){
			for(let b = -1; b < 2; b = b + 1){
				if(a !== 0 || b !== 0){
					if(firingChoice == 0){
						if(a === 0 || b === 0){
							this.projArr[i] = new Projectiles.MagBullet(this.player, [a,b], 1, this.id);
							i = i + 1;
						}
					}
					if(firingChoice == 1){
						if(a !== 0  && b !== 0){
							this.projArr[i] = new Projectiles.MagBullet(this.player, [a,b], 1, this.id);
							i = i + 1;
						}
					}

				}
			}
		}
	}

	update(tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		this.collidedWith = [false, 4];
		// reset firing
		this.firing = false;

		if (tick % 13 === 0) {
			this.startAttack();
		}
	}

	serialize () {
		return super.serialize.call(this);
	}

}
export class Tripwire extends Unit {

	constructor(player, health = 250, firing = false, id, collidedWith = [false, 4], ticksSinceDamage = 0,tripped = false, tripDamage = 0, lifeSpan = 0, damageDealt = 0)  {
		super(id);
		this.lifeSpan =lifeSpan;
		this.player = player;
		this.health = health;
		this.tripDamage = tripDamage;
		this.firing = firing;
		this.identifier="Tri";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.ticksSinceDamage = ticksSinceDamage;
		this.tripped = tripped;
		this.value = 2;
		this.fullName = "Tripwire";
		this.damageDealt = damageDealt;
	}

	static maxHealth = 250;
	static cost = 2;
	static orientations = {
		1: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]],
		2: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]],
		3: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]],
		4: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1],[1,-1]]
	}
	static description = "The Tripwire is a retaliatory machine that returns magnified energy at a higher frequency. It requires an initial stimulus to activate or become 'tripped' and then a second stimulus in quick succession which is reflected in all diagonal and orthogonal directions with three times the destructive power. These pulses cover a short distance and cannot be blocked by other machines or cores.";

	static createFromSerialized (props) {
		return new Tripwire(props.player, props.health, props.firing, props.id, props.collidedWith, props.ticksSinceDamage, props.tripped, props.tripDamage, props.lifeSpan, props.damageDealt);
	}

	startAttack (damage){
		this.firing = true;
		let i = 0;
		for(let a = -1; a < 2; a = a + 1){
			for(let b = -1; b < 2; b = b + 1){
				if(a !== 0 || b !== 0){
							this.projArr[i] = new Projectiles.TriBullet(this.player, [a,b], 1, damage, this.id);
							i = i + 1;
				}
			}
		}
	}

	update (tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		if(tick == 1){
			this.tripped = false;
		}
		this.firing=false;
		this.ticksSinceDamage = this.ticksSinceDamage + 1;
		if(this.collidedWith[0] == true && this.tripped == false){
			this.ticksSinceDamage = 0;
			this.tripDamage = this.health;
			this.tripped = true;
		}
		else if(this.collidedWith[0] == true && this.tripped == true){
			if(this.ticksSinceDamage < 10){
				this.startAttack(3*(this.tripDamage-this.health));
				this.tripped = false;
			}
			else{
				this.tripped = false;
			}
		}
		//this.startAttack(0);
		this.collidedWith = [false, 4];
		//this.firing=false;
	}

	serialize () {
		return super.serialize.call(this);
	}
}

export class Ballast extends Unit {

	constructor(player, health = 300, firing = false, id, collidedWith = [false, 4], lifeSpan = 0, damageDealt = 0)  {
		super(id);
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.identifier="Bal";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 2;
		this.fullName = "Ballast";
		this.damageDealt = damageDealt;
		this.targOne = 6;
		this.targTwo = 3;
	}
	static coordOne = 6;
	static coordTwo = 3;
	static maxHealth = 300;
	static cost = 2;

	//Methodology is player then x then y in each subArray
	static orientations = {
		// 1: [[coordOne,coordTwo],[coordOne,-coordTwo],[coordTwo,coordOne],[-coordTwo,coordOne],[coordOne,coordTwo],[coordOne,coordTwo]]
		1: [[Ballast.coordOne,Ballast.coordTwo],[Ballast.coordOne,-Ballast.coordTwo],[-Ballast.coordOne,Ballast.coordTwo],[Ballast.coordTwo,Ballast.coordOne],[Ballast.coordTwo,-Ballast.coordOne],[-Ballast.coordTwo,Ballast.coordOne]],
		2: [[Ballast.coordOne,Ballast.coordTwo],[Ballast.coordOne,-Ballast.coordTwo],[-Ballast.coordOne,-Ballast.coordTwo],[Ballast.coordTwo,Ballast.coordOne],[Ballast.coordTwo,-Ballast.coordOne],[-Ballast.coordTwo,-Ballast.coordOne]],
		3: [[-Ballast.coordOne,Ballast.coordTwo],[-Ballast.coordOne,-Ballast.coordTwo],[Ballast.coordOne,Ballast.coordTwo],[-Ballast.coordTwo,Ballast.coordOne],[-Ballast.coordTwo,-Ballast.coordOne],[Ballast.coordTwo,Ballast.coordOne]],
		4: [[-Ballast.coordOne,-Ballast.coordTwo],[-Ballast.coordOne,Ballast.coordTwo],[Ballast.coordOne,-Ballast.coordTwo],[-Ballast.coordTwo,-Ballast.coordOne],[-Ballast.coordTwo,Ballast.coordOne],[Ballast.coordTwo,-Ballast.coordOne]]
	}

	static description = "The Ballast is an advanced, bulky machine that can be used to block key channels while hitting a limited set of targets with significant force. It strikes for five consecutive seconds, delivering irreparable damage. The attacks rotate between 6 possible target locations that are a distance of either 6 or 3 tiles away horizontally and the opposite number vertically.";

	static createFromSerialized (props) {
		return new Ballast(props.player, props.health, props.firing, props.id, props.collidedWith, props.lifeSpan, props.damageDealt)
	}

	startAttack (orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.BalBullet(this.player, orientation, 0, this.id);
	}

	update (tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		this.collidedWith = [false, 4];
		this.firing=false;
		if(tick % 7 === 0){
			let rando = Math.random()*6;
			let multx = 1;
			let multy = 1;
			targOne = this.targOne;
			targTwo = this.targTwo;
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

export class Resonator extends Unit {

	constructor(player, health = 225, firing = false, id, collidedWith = [false, 4], lifeSpan = 0, damageDealt = 0)  {
		super(id);
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;
		this.identifier="Cir";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 3;
		this.fullName = "Resonator";
		this.damageDealt = damageDealt;
	}

	static maxHealth = 225;
	static cost = 3;

	//Methodology is player then x then y in each subArray
	static orientations = {
		1: [[1,0],[0,1],[1,1]],
		2: [[1,0],[0,-1],[1,-1]],
		3: [[-1,0],[0,1],[-1,1]],
		4: [[-1,0],[0,-1],[-1,-1]]
	}

	static description = "The Resonator is a resiliant, catapult-style machine that delivers damage in a cross shape encompassing a five-tile area. The center of its strike deals significant damage and fades to half the amount in the adjacent tiles. The sheer power of its attack causes erratic projectile fire that hits a random number of spaces away. It will either strike vertically, horizontally or diagonally and does not do damage prior to reaching its destination.";

	static createFromSerialized (props) {
		return new Resonator(props.player, props.health, props.firing, props.id, props.collidedWith, props.lifeSpan, props.damageDealt)
	}

	startAttack (orientation){
		this.firing = true;
		this.projArr[0]  = new Projectiles.CirBullet(this.player, orientation, 1, this.id);
	}

	update (tick) {
		super.update(tick);
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		this.collidedWith = [false, 4];
		this.firing=false;
		if(tick % 16 === 0){
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

export class Integrator extends Unit {

	constructor(player, health = 175, firing = false, id, collidedWith = [false, 4], lifeSpan = 0, damageDealt = 0)  {
		super(id);
		//add a lifespan category and also pass in the number of projectiles present at the time
		this.lifeSpan = lifeSpan;
		this.player = player;
		this.health = health;
		this.firing = firing;

		this.identifier="Int";
		this.projArr = [];
		this.collidedWith = collidedWith;
		this.value = 3;
		this.fullName = "Integrator";
		this.damageDealt = damageDealt;
	}

	static maxHealth = 175;
	static cost = 3;

	//Methodology is player then x then y in each subArray
	static orientations = {
		1: [[2,1],[1,2],[-1,2],[2,-1]],
		2: [[2,-1],[1,-2],[-1,-2],[2,1]],
		3: [[-2,-1],[1,2],[-1,2][-2,1]],
		4: [[-2,-1],[1,-2],[-1,-2],[-2,1]]
	}

	static description = "The Integrator is a high-potential machine that gains strength with each turn it remains aactive. It fires less frequently than other units, but covers four paths that are a ratio of 2:1 or 1:2 from its origin.";

	static createFromSerialized (props) {
		return new Integrator(props.player, props.health, props.firing, props.id, props.collidedWith, props.lifeSpan, props.damageDealt);
	}

	startAttack (pC){
		this.firing = true;
		let orient;
		for(let i = 0; i < 4; i = i + 1){
			if(this.player == 1){
				if(i == 0){
					orient = [2,1];
				}
				else if(i == 1){
					orient = [1,2];
				}
				else if(i == 2){
					orient = [-1,2];
				}
				else if(i == 3){
					orient = [2,-1];
				}
			}
			if(this.player == 2){
				if(i == 0){
					orient = [2,-1];
				}
				else if(i == 1){
					orient = [1,-2];
				}
				else if(i == 2){
					orient = [-1,-2];
				}
				else if(i == 3){
					orient = [2,1];
				}
			}
			if(this.player == 3){
				if(i == 0){
					orient = [-2,-1];
				}
				else if(i == 1){
					orient = [1,2];
				}
				else if(i == 2){
					orient = [-1,2];
				}
				else if(i == 3){
					orient = [-2,1];
				}
						}
				if(this.player == 4){
						if(i == 0){
							orient = [-2,-1];
						}
						else if(i == 1){
							orient = [1,-2];
						}
						else if(i == 2){
							orient = [-1,-2];
						}
						else if(i == 3){
							orient = [-2,1];
						}
					}
		this.projArr[i]  = new Projectiles.IntBullet(this.player, orient, 1, pC, this.lifeSpan, this.id);
	 }
	}

	update (tick, projCount) {
		if(tick == 1){
			this.lifeSpan = this.lifeSpan + 1;
		}
		super.update(tick);
		this.collidedWith = [false, 4];
		this.firing=false;
		if(tick % 15 === 0){
			this.startAttack(projCount);
			//let rando = Math.random()*3;
		  }
	}

	serialize () {
		return super.serialize.call(this);
	}
}
