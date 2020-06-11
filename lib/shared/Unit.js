export default class Unit {

	constructor(id = 0)  {
		this.id = id;
		this.health = 0;
		this.maxHealth=0;
	}

}

export class RayTracer extends Unit {

	constructor(id = 0)  {
		super(id);
		this.health = 50;
		this.maxHealth = 50;
	}

}