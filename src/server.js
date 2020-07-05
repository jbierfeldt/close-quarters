import {DEBUG} from './lib/shared/utilities.js';
import Game from './lib/shared/Game.js';
import * as Units from './lib/shared/Unit.js';

const debug = new DEBUG(true, 0);

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const port = 3000;

const app = express();
const server = http.Server(app);
// const io = socketIO(server);

const CONFIG = {
	maxPlayers: 4
}

class GameController {

	constructor(game = new Game()) {
		this.game = game;
		this.io = socketIO(server);

		// player spots
    this.playerControllers = {
			1: undefined,
			2: undefined,
			3: undefined,
			4: undefined
		};
	}

  init() {

		this.game.init();
		this.game.runSimulation();

    this.io.on('connection', (socket) => {
      debug.log(0, 'a new client connected');

			// get player spot if available
			let playerSpot = this.getOpenPlayerSpot();

			if (playerSpot === false) {
				// don't allow new player to enter game
				debug.log(1, "Game full.");
			}
			else {
				this.newPlayerController(socket, playerSpot);
				this.sendGameHistory();
				// this.sendGameState();
			}

    });
  }

	removePlayerController (playerNumber) {
		this.playerControllers[playerNumber] = undefined;

		debug.log(1, this.playerControllers);
	}

	getOpenPlayerSpot () {
		// returns the id of next open player spot or false if all spots are filled
		for (let idx in this.playerControllers) {
			if (this.playerControllers[idx] === undefined) { return idx };
		}
		// if all filled
		return false;
	}

  newPlayerController (socket, playerSpot) {
		// create new PlayerController and assign to empty spot
		let pc = new PlayerController(this, socket, playerSpot);
		this.playerControllers[playerSpot] = pc;

		// init new player
	  pc.init();

		debug.log(1, this.playerControllers);
	}

	sendGameHistory () {
		console.log(this.game.turnNumber);
		this.io.emit('updateGameHistory', {
			s_history: JSON.stringify(this.game.history),
			turnNumber: this.game.turnNumber
		});
	}

	createUnit(unitType, player, x, y) {
		this.game.createNewUnitAtCoord(unitType, player, x, y);
		console.log("Made", unitType, "at", x, y);
		// this.sendGameState();
	}

	runSimulation() {
		console.log("Running simulation...");
		this.game.runSimulation();
		this.sendGameHistory();
	}

}

class PlayerController {

  constructor(gameController, socket, playerNumber) {
		this.id = socket.id;
		this.playerNumber = playerNumber;
    this.gameController = gameController;
    this.socket = socket;
  }

  init() {

		this.socket.emit("message", `You are player ${this.playerNumber}`);

    this.socket.on('createUnit', (data) => {
			this.gameController.createUnit(data.unitType, data.player, data.x, data.y);
    });

		this.socket.on('submitTurn', (data) =>  {
			// will update game controller saying that this player has submitted their turn
			// for now, just forcing runSimulation
			this.gameController.runSimulation();
		});

    this.socket.on('disconnect', () => {
       debug.log(0, 'a user disconnected');
			 this.gameController.removePlayerController(this.playerNumber);
    });

		this.sendPlayerState();
		this.socket.emit("debugInfoUpdate");

  }

	sendPlayerState () {
		this.socket.emit("updatePlayerState", {
			'clientID': this.id,
			'playerNumber': this.playerNumber
		});
	}
}

const game1 = new GameController();
game1.init();

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
