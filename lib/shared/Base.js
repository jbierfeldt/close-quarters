export default class Base {

	constructor(id = 0,player)  {
		this.id = id;
		this.maxHealth = 300;
		this.health = 300;
		this.player=player;
	}
	updateBase(player,damange){
		this.health=this.health-damage;
	}

}