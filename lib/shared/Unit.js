export default class Unit {

	constructor(id = 0)  {
		this.id = id;
		this.maxHealth = 0;
		this.health = 0;
	}

}

export class RayTracer extends Unit {

	constructor(id = 0)  {
		super(id);
	}

}