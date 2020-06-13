import {createID} from './utilities.js';

export default class Projectile {
	constructor(initialOrientation = [0, 0], initialSpeed = 0) {
		this.id = 'proj'+createID();
		this.orientation = initialOrientation;
		this.speed = initialSpeed;
	}

	update(tick) {
		console.log("Updating Projectile" + this.id);
	}
}