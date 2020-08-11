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
		// if no token or unauthorized token, treat new connection as a new player

		// generate new secret for each game session, that way old tokens won't authorize

		// on success, lookup matching token in clientController and assign new socket to it

		// possibly implement a isConnected bool inside of the clientController that gets set to false
		// when the socket disconnects, but can be reinstatiated upon successful authentication and
		// reconnection. If the game gets a new request and one of the positions is filled by an offline
		// clientController, then it can be removed

		// need to implement timeout on disconnect
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
				let playerSpot = this.getOpenPlayerSpot();

				if (playerSpot === false) {
					// don't allow new player to enter game, create spectator
					debug.log(1, "Game full.");
				}
				else {
					// create clientController and then connect it
					let newClientController = this.newClientController(playerSpot);
					this.clientControllerConnect(newClientController, socket);
					console.log('connected', newClientController.playerNumber, newClientController.id, newClientController.socket.id);
				}
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
		this.playerSpots[playerSpot] = pc;
		this.clientControllers.push(pc);

		return pc;
	}

	clientControllerConnect (clientController, newSocket) {

		clientController.setSocket(newSocket);
		clientController.isConnected = true;
		clientController.onConnect();

		this.playersOnline.push(clientController);

		this.sendGameStateToClient(clientController.socket);
		this.sendLastTurnHistoryToClient(clientController.socket);

		// console.log('connected', clientController.playerNumber, clientController.id, clientController.socket.id);

	}

	clientControllerDisconnect (clientController) {
		clientController.isConnected = false;

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
		// for (let i =  0; i < this.clientControllers.length; i++) {
		// 	console.log(this.clientControllers[i].id, this.clientControllers[i].playerNumber);
		// }
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

	sendClientInfo () {
		this.socket.emit("updateClientInfo", {
			'clientID': this.id,
			'token': this.token,
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
