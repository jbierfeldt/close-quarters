import {create2DArray} from './utilities.js';
import Player from './Player.js';

const tempConfig = {
	boardDimensions: [20, 30],
	numOfPlayers: 4
}

export default class Game {

 	constructor(id = 0, players = [], board = new Object, turnNumber = 0) {
 		this.id = id;
 		this.players = players;
 		this.board = board;
 		this.turnNumber =  turnNumber;
 		this.gamePhase =0;
	}

	init() {

		// create new players
		for (var i = 0; i < tempConfig.numOfPlayers; i++) {
			let newPlayer = new Player(i);
			this.players.push(newPlayer);
		}

		// create empty grid
		this.board = create2DArray(tempConfig.boardDimensions[0],tempConfig.boardDimensions[1]);
		this.gamePhase=2;
		console.log('Initialized Game ' + this.id);
	}

}