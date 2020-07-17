import {DEBUG} from './lib/shared/utilities.js';
import Game from './lib/shared/Game.js';
import * as Units from './lib/shared/Unit.js';
import Base from './lib/shared/Base.js';

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

		this.playersOnline = [];

		// player spots
		this.playerControllers = {
			1: null,
			2: null,
			3: null,
			4: null
		};
	}

	init() {

		this.game.init();

		this.io.on('connection', (socket) => {
			debug.log(0, 'a new client connected');

			// get player spot if available
			let playerSpot = this.getOpenPlayerSpot();

			if (playerSpot === false) {
				// don't allow new player to enter game
				debug.log(1, "Game full.");
			}
			else {
				let newPlayerController = this.newPlayerController(socket, playerSpot);

				this.sendGameStateToClient(socket);
				this.sendGameHistoryToClient(socket);
			}

			this.sendServerStateToAll();

		});

	}

	resetGame () {
		let newGame = new Game();
		this.game = newGame;
		this.game.init();

		this.setGamePhaseForAll(0);
		this.sendGameStateToAll();
		this.sendGameHistoryToAll();
	}

	getOpenPlayerSpot () {
		// returns the id of next open player spot or false if all spots are filled
		for (let idx in this.playerControllers) {
			if (this.playerControllers[idx] === null) { return idx };
		}
		// if all filled
		return false;
	}

	newPlayerController (socket, playerSpot) {
		// create new PlayerController and assign to empty spot
		let pc = new PlayerController(this, socket, playerSpot);
		this.playerControllers[playerSpot] = pc;
		this.playersOnline.push(pc);

		// init new player
		pc.init();

		debug.log(1, this.playerControllers);
		// debug.log(1, this.playersOnline);

		return pc;
	}

	removePlayerController (playerController) {
		this.playerControllers[playerController.playerNumber] = null;
		const idx = this.playersOnline.indexOf(playerController);
		this.playersOnline.splice(idx, 1);

		debug.log(1, this.playerControllers);
	}

	setGamePhaseForAll (phase) {
		this.io.emit('updateClientGamePhase', {
			newPhase: phase
		});
	}

	sendGameHistoryToAll () {
		this.io.emit('updateGameHistory', {
			s_history: JSON.stringify(this.game.history)
		});
	}

	sendGameHistoryToClient (socket) {
		socket.emit('updateGameHistory', {
			s_history: JSON.stringify(this.game.history)
		});
	}

	sendGameStateToAll () {
		this.io.emit('updateGameState',  {
			turnNumber: this.game.turnNumber,
			currentTurnInitialState: JSON.stringify(this.game.currentTurnInitialState)
		});
	}

	sendGameStateToClient (socket) {
		socket.emit('updateGameState',  {
			turnNumber: this.game.turnNumber,
			currentTurnInitialState: JSON.stringify(this.game.currentTurnInitialState)
		});
	}

	sendServerStateToAll () {

		let playerControllers = {};

		for (let i = 1; i <= 4; i++) {
			if (this.playerControllers[i] !== null) {
				playerControllers[i] = {
					gamePhase: this.playerControllers[i].clientGamePhase,
					ordersSubmitted: this.playerControllers[i].ordersSubmitted
				}
			} else {
				playerControllers[i] = null;
			}
		}

		this.io.emit('updateServerState', {
			players: JSON.stringify(playerControllers)
		});
	}

	createBase(args) {
		this.game.createNewBaseAtCoord(args.baseType, args.player, args.x, args.y);
		console.log("Made", args.baseType, "at", args.x, args.y);
	}

	createUnit(args) {
		this.game.createNewUnitAtCoord(args.unitType, args.player, args.x, args.y);
		console.log("Made", args.unitType, "at", args.x, args.y);
	}

	checkAllOrdersSubmitted() {
		// update all clients on who has submitted orders
		this.sendServerStateToAll();

		// check if all the online players have submitted their orders
		// if not, return false and don't execute
		for (let i = 0; i < this.playersOnline.length; i++) {
			// console.log("orders submitted?", this.playersOnline[i], this.playersOnline[i].ordersSubmitted);
			if (!this.playersOnline[i].ordersSubmitted) {
				return false;
			}
		}

		//if all online players have submitted their orders, execute orders
		// execute orders
		for (let i = 0; i < this.playersOnline.length; i++) {
			if (this.playersOnline[i].ordersToExecute.length > 0) {
				for (let j = 0; j < this.playersOnline[i].ordersToExecute.length; j++) {
					this.executeOrder(this.playersOnline[i].ordersToExecute[j]);
				}
			}

			// after orders executed, reset PlayerController
			this.playersOnline[i].ordersSubmitted = false;
			this.playersOnline[i].ordersToExecute = [];
		}

		// once all orders have been executed, run simulation
		this.runSimulation();

	}

	forceOrders () {
		//if all online players have submitted their orders, execute orders
		// execute orders
		for (let i = 0; i < this.playersOnline.length; i++) {
			if (this.playersOnline[i].ordersToExecute.length > 0) {
				for (let j = 0; j < this.playersOnline[i].ordersToExecute.length; j++) {
					this.executeOrder(this.playersOnline[i].ordersToExecute[j]);
				}
			}

			// after orders executed, reset PlayerController
			this.playersOnline[i].ordersSubmitted = false;
			this.playersOnline[i].ordersToExecute = [];
		}

		// once all orders have been executed, run simulation
		this.runSimulation();
	}

	printServerData () {
		console.log("Players Online:")
		for (let i =  0; i < this.playersOnline.length; i++) {
			console.log(this.playersOnline[i].id, this.playersOnline[i].playerNumber, this.playersOnline[i].ordersSubmitted, this.playersOnline[i].ordersToExecute);
		}
	}

	executeOrder (order) {
		try {
			this[order.orderType](order.args);
		} catch (e) {
			console.log("Order didn't execute", order);
		}
	}

	runSimulation() {
		this.game.runSimulation();
		this.sendGameStateToAll();
		this.sendGameHistoryToAll();
		this.setGamePhaseForAll(2);
	}

}

class PlayerController {

	constructor(gameController, socket, playerNumber) {
		this.id = socket.id;
		this.playerNumber = playerNumber;
		this.gameController = gameController;
		this.socket = socket;

		this.ordersToExecute = [];
		this.ordersSubmitted = false;

		this.clientGamePhase = null;
	}

	init() {

		this.bindListeners();
		this.socket.emit("message", `You are player ${this.playerNumber}`);

		this.sendPlayerState();
		this.socket.emit("debugInfoUpdate");

	}

	bindListeners () {

		this.socket.on('createUnit', (data) => {
			this.gameController.createUnit(data.unitType, data.player, data.x, data.y);
		});

		this.socket.on('createBase', (data) => {
			this.gameController.createBase(data.baseType, data.player, data.x, data.y);
		});

		this.socket.on('submitTurn', (data) =>  {
			// will update game controller saying that this player has submitted their turn
			// for now, just forcing runSimulation
			this.ordersToExecute = JSON.parse(data);
			this.ordersSubmitted = true;

			// try to execute orders
			this.gameController.checkAllOrdersSubmitted();
		});

		this.socket.on('forcesubmitTurn', (data) =>  {
			// will update game controller saying that this player has submitted their turn
			// for now, just forcing runSimulation
			this.ordersToExecute = JSON.parse(data);
			this.ordersSubmitted = true;

			// try to execute orders
			this.gameController.forceOrders();
		});

		this.socket.on('printServerData', () => {
			this.gameController.printServerData();
		});

		this.socket.on('resetGame', (data) =>  {
			// reset Game
			this.gameController.resetGame();
		});

		this.socket.on('updateClientPhase', (data) => {
			this.clientGamePhase = data.newPhase;
			this.gameController.sendServerStateToAll();
		})

		this.socket.on('disconnect', () => {
			this.gameController.removePlayerController(this);
			this.gameController.sendServerStateToAll();
		});

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
