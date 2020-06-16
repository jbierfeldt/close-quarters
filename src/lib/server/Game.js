// Server Game
export default class Game {

 	constructor(id = 0, players = [], board = undefined, turnNumber = 0) {
 		this.id = id;
 		this.players = players;
 		this.board = board;
 		this.turnNumber =  turnNumber;
	}

	init() {
		console.log('Initialized Game ' + this.id);
	}

}