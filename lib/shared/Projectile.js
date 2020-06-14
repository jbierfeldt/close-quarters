import {createID} from './utilities.js';

export default class Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0) {
		this.id = 'proj'+createID();
		this.orientation = initialOrientation;
		this.speed = initialSpeed;
		this.updatedThisTick = true;
	}

	update(tick) {
		debug.log(0, "    Updating Projectile " + this.id + "  for tick #" + tick);
	}
}

export class RayBullet extends Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0)  {
		super(initialOrientation, initialSpeed);
		this.identifier = "RayProj";
	}

	update(tick) {
		super.update(tick);
	}
}

export class MagBullet extends Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0)  {
		super(initialOrientation, initialSpeed);
		this.identifier = "MagProj";
	}

	update(tick) {
		super.update(tick);
	}
}