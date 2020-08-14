import {DEBUG, createID} from './lib/shared/utilities.js';
import Game from './lib/shared/Game.js';
import * as Units from './lib/shared/Unit.js';
import Base from './lib/shared/Base.js';

const debug = new DEBUG(true, 0);

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
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

		// generates a random secret key for use in this session
		// in order to prevent authTokens from previous sessions from working
		this.SECRET_KEY = createID();

		this.playersOnline = [];

		this.clientControllers = [];

		// player spots
		this.playerSpots = {
			1: null,
			2: null,
			3: null,
			4: null
		};
	}

	init() {

		this.game.init();

		// if authToken matches that of extant clientController, reconnect player to clientController

		// decode authToken using session specific secret, if set
		// put decoded authToken in socket.sessionID
		this.io.use((socket, next) => {
			if (socket.handshake.query && socket.handshake.query.token && socket.handshake.query.token !== '') {
				jwt.verify(socket.handshake.query.token, this.SECRET_KEY, (err, decoded) => {
					if (err) return next();
					socket.sessionID = decoded;
					next();
				});
			}
			else {
				next();
			}
		});

		this.io.on('connection', (socket) => {
			// debug.log(0, 'a new client connected');

			// check for already existing token and if so, don't make new player controller
			if (socket.sessionID) {
				for (let i = 0; i < this.clientControllers.length; i++) {
					if (socket.sessionID === this.clientControllers[i].id) {
						this.clientControllerReconnect(this.clientControllers[i], socket);
					}
				}
			} else {
				// get player spot if available
				let playerSpot = this.getOpenPlayerSpot(); // returns playerSpot or false

				if (playerSpot === false) {
					// don't allow new player to enter game, create spectator
					debug.log(1, "Game full.");
				}
				
				let newClientController = this.newClientController(playerSpot);
				this.clientControllerConnect(newClientController, socket);
				console.log('connected', newClientController.playerNumber, newClientController.id, newClientController.socket.id);
			}

			this.sendServerStateToAll();

		});

	}

	generatePlayerToken (token_seed) {
		const token = jwt.sign(token_seed, this.SECRET_KEY);
		return token;
	}

	resetGame () {
		let newGame = new Game();
		this.game = newGame;
		this.game.init();

		this.setGamePhaseForAll(0);
		this.sendGameStateToAll();
		this.sendLastTurnHistoryToAll();
	}

	getOpenPlayerSpot () {
		// returns the id of next open player spot or false if all spots are filled
		for (let idx in this.playerSpots) {
			if (this.playerSpots[idx] === null) { return idx };
		}
		// if all filled
		return false;
	}

	newClientController (playerSpot) {
		// create new token with unique id
		let id = createID();
		let token = this.generatePlayerToken(id);

		let pc = new ClientController(this, id, token, playerSpot);

		if (playerSpot !== false) {
			this.playerSpots[playerSpot] = pc;
			pc.clientState = 'ACTIVE_PLAYER';
		} else {
			pc.clientState = 'SPECTATOR';
		}

		this.clientControllers.push(pc);

		return pc;
	}

	clientControllerConnect (clientController, newSocket) {

		clientController.setSocket(newSocket);
		clientController.isConnected = true;
		clientController.setClientStateFromVictoryCondition(this.game.players[clientController.playerNumber].victoryCondition);
		clientController.onConnect();

		this.playersOnline.push(clientController);

		this.sendGameStateToClient(clientController.socket);
		this.sendLastTurnHistoryToClient(clientController.socket);

		// console.log('connected', clientController.playerNumber, clientController.id, clientController.socket.id);

	}

	clientControllerDisconnect (clientController) {
		clientController.isConnected = false;
		clientController.clientState = "DISCONNECTED";

		if (clientController.playerNumber) {
			this.playerSpots[clientController.playerNumber] = null;
		}

		const idx = this.playersOnline.indexOf(clientController);
		this.playersOnline.splice(idx, 1);

		// console.log('disconnect', clientController.playerNumber, clientController.id);
	}

	clientControllerReconnect (clientController, newSocket) {

		// if client already has a playerNumber and that playerSpot is free, reclaim it
		if (clientController.playerNumber
		&& this.playerSpots[clientController.playerNumber] === null) {
			this.playerSpots[clientController.playerNumber] = clientController;
		}

		this.clientControllerConnect(clientController, newSocket);

		// clientController.setSocket(newSocket);
		// clientController.isConnected = true;
		// clientController.onConnect();
		//
		// this.playersOnline.push(clientController);
		//
		// this.sendGameStateToClient(clientController.socket);
		// this.sendLastTurnHistoryToClient(clientController.socket);

		console.log('reconnected', clientController.playerNumber, clientController.id, clientController.socket.id);

	}

	setGamePhaseForAll (phase) {
		this.io.emit('updateClientGamePhase', {
			newPhase: phase
		});
	}

	sendTurnsSubmittedToAll () {
		// tells all clients that the turns have been subitted
		this.io.emit('turnsSubmitted');
	}

	sendLastTurnHistoryToAll () {
		this.io.emit('updateLastTurnHistory', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
		});
	}

	sendLastTurnHistoryToClient (socket) {
		socket.emit('updateLastTurnHistory', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
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

		let playerSpots = {};

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] !== null) {
				playerSpots[i] = {
					gamePhase: this.playerSpots[i].clientGamePhase,
					ordersSubmitted: this.playerSpots[i].ordersSubmitted
				}
			} else {
				playerSpots[i] = null;
			}
		}

		this.io.emit('updateServerState', {
			players: JSON.stringify(playerSpots)
		});
	}

	createBase(args) {
		this.game.createNewBaseAtCoord(args.baseType, args.player, args.x, args.y);
		// console.log("Made", args.baseType, "at", args.x, args.y);
	}

	createUnit(args) {
		this.game.createNewUnitAtCoord(args.unitType, args.player, args.x, args.y);
		// console.log("Made", args.unitType, "at", args.x, args.y);
	}

	checkPlayerStateChanges () {
		// checks if players have been defeated/victorious

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] !== null) {
				this.playerSpots[i].setClientStateFromVictoryCondition(this.game.players[i-1].victoryCondition);
			}
		}

	}

	checkAllOrdersSubmitted () {
		// update all clients on who has submitted orders
		this.sendServerStateToAll();

		//  check if players Online
		if (this.playersOnline.length == 0) {
			return false;
		}

		// check if all the online players have submitted their orders
		// if not, return false and don't execute
		for (let i = 0; i < this.playersOnline.length; i++) {
			// console.log("orders submitted?", this.playersOnline[i], this.playersOnline[i].ordersSubmitted);
			if (!this.playersOnline[i].ordersSubmitted) {
				return false;
			}
		}

		// send turnsSubmitted event to clients
		this.sendTurnsSubmittedToAll();

		//if all online players have submitted their orders, execute orders
		// execute orders
		for (let i = 0; i < this.playersOnline.length; i++) {
			if (this.playersOnline[i].ordersToExecute.length > 0) {
				for (let j = 0; j < this.playersOnline[i].ordersToExecute.length; j++) {
					this.executeOrder(this.playersOnline[i].ordersToExecute[j]);
				}
			}

			// after orders executed, reset ClientController
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

			// after orders executed, reset ClientController
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
		console.log("Client Controllers:")
		for (let i =  0; i < this.clientControllers.length; i++) {
			console.log(this.clientControllers[i].id, this.clientControllers[i].playerNumber, this.clientControllers[i].clientState);
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
		this.checkPlayerStateChanges();
		this.sendGameStateToAll();
		this.sendLastTurnHistoryToAll();
		this.setGamePhaseForAll(2);
	}

}

class ClientController {

	constructor(gameController, id, token, playerNumber) {
		this.id = id; // initial socket id
		this.gameController = gameController;
		this.socket = null;
		this.token = token;
		this.playerNumber = playerNumber;

		this.isConnected = false;

		this.ordersToExecute = [];
		this.ordersSubmitted = false;

		this.clientGamePhase = null;
		this.clientState = null; // null, SPECTATOR, ACTIVE_PLAYER, DEFEATED_PLAYER
	}

	init() {
	}

	onConnect () {
		this.sendClientInfo();
		this.socket.emit("debugInfoUpdate");
	}

	setSocket (socket) {
		if (this.socket !== null) {
			this.removeListeners();
			this.socket.disconnect();
		};

		this.socket = socket;

		this.bindListeners();
	}

	removeListeners () {
		this.socket.removeAllListeners();
	}

	bindListeners () {

		this.socket.on('connection', () => {
			console.log('client ' + this.id + 'connect');
		})

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

		this.socket.on('disconnect', (reason) => {
			console.log("disconnected", this.id, this.socket.id, reason);
			this.gameController.clientControllerDisconnect(this);
			this.gameController.sendServerStateToAll();
		});

	}

	setClientStateFromVictoryCondition (victoryCondition) {
		let newState;
		switch (victoryCondition) {
			case -1:
				newState = "DEFEATED_PLAYER";
				break;
			case 0:
				newState = "ACTIVE_PLAYER";
				break;
			case 1:
				newState = "VICTORIOUS_PLAYER";
				break;

			if (this.clientState !== newState) {
				this.clientState = newState;
				this.sendClientState();
			}
		}
	}

	sendClientState () {
		console.log("sending client state");
		this.socket.emit("updateClientState", {
			'clientState': this.clientState
		});
	}

	sendClientInfo () {
		this.socket.emit("updateClientInfo", {
			'clientID': this.id,
			'token': this.token,
			'clientState': this.clientState,
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
