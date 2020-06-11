export default class Unit {

	constructor(id = 0)  {
		this.id = id;
		this.health = 0;
		this.maxHealth=0;
	}
	unitDestroyed(){

		
	}

}

export class RayTracer extends Unit {

	constructor(id = 0, x, y, player)  {
		super(id);
		this.health = 50;
		this.maxHealth = 50;
		this.x = x;
		this.y = y;
		this.player = player;
		this.identifier="Ray";
	}

	startAttack(tick){

		//initialize a project object and pass in the direction based on the tick 

	}
}
export class JuggerNode extends Unit {

	constructor(id = 0, x, y, player)  {
		super(id);
		this.health = 50;
		this.maxHealth = 50;
		this.x = x;
		this.y = y;
		this.player = player;
		this.identifier="Jug";
	}

	startAttack(tick){

	}
}