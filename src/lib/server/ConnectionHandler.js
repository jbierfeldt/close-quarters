import { DEBUG, createID } from '../shared/utilities.js';
const debug = new DEBUG(process.env.DEBUG, 0);
import ClientController from './ClientController.js';
import GameController from './GameController.js';

const jwt = require('jsonwebtoken');


export default class ConnectionHandler {

	constructor(IO_INSTANCE, SECRET_KEY) {
		this.io = IO_INSTANCE;
		this.SECRET_KEY = SECRET_KEY;

		// current open game (temp)
		this.openGame = null;

		this.clientControllers = new Map();
		this.gameControllers = new Map();
	}

	init() {

		this.registerMiddleware();

		for (let i = 0; i < 5; i++) {
			let newGameID = createID(5);
			// let IO_ROOM = this.io.to(newGameID);

			let newGame = new GameController({
				id: newGameID,
				IO_INSTANCE: this.io
			});
			newGame.init();
	
			this.gameControllers.set(newGame.id, newGame);
	
			this.openGame = newGame;
		}

		this.io.on('connection', (socket) => {

			// check for already existing token and if so, don't make new player controller
			if (socket.sessionID) {

				// fetch clientController from map
				let clientController = this.clientControllers.get(socket.sessionID);

				// if clientController already exists, reconnect the new socket to it
				if (clientController) {
					this.reconnectClientController(socket, clientController);
				// if no clientController with this id already exists, make a new one
				} else {
					this.createClientController(socket);
				}

			// make a new clientController
			} else {
				this.createClientController(socket);
			}

			// once the socket has a client Controller, run its onConnect setup method
			if (socket.clientController) socket.clientController.onConnect();

			debug.log(0, `new socket connected as ${socket.clientController.id}`);
		});

	}

	registerMiddleware() {

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

	}

	signClientToken(clientUUID) {
		const token = jwt.sign(clientUUID, this.SECRET_KEY);
		return token;
	}

	// create new clientController with information from socket
	createClientController(socket) {

		let newClientController = new ClientController({
			id: socket.id,
			token: this.signClientToken(socket.id),
			connectionHandler: this
		});

		this.connectSocketToClient(socket, newClientController);

		// TEMP — This will actually be handled elsewhere
		this.connectClientToGameRoom(newClientController, this.openGame);
		newClientController.playerNumber = 1;

		// make socket aware of its clientController
		socket.clientController = newClientController;
		this.clientControllers.set(newClientController.id, newClientController);

	}

	reconnectClientController(socket, clientController) {

		this.connectSocketToClient(socket, clientController);

		// make socket aware of its clientController
		socket.clientController = clientController;

		// if clientController is already connected to a Game,
		// re-bind its events and join its socket.io room
		if (clientController.gameController !== null) {
			clientController.socket.join(clientController.gameController.id);
			clientController.bindGameListeners();
		}

	}

	connectSocketToClient(socket, clientController) {
		// if the clientController already has a socket,
		// remove its listeners and disconnect it
		if (clientController.socket !== null) {
			clientController.removeListeners();
			clientController.socket.disconnect();
		};

		// store reference to the new socket
		clientController.socket = socket;

		// bind new listeners to socket
		clientController.bindListeners();
	}

	connectClientToGameRoom(clientController, gameController) {
		if (clientController.gameController !== null) {
			clientController.removeListeners();

			// remove clientController from Game Room clientController list
			clientController.gameController.disconnectClientController(clientController);

			// leave socket.io room
			clientController.socket.leave(clientController.gameController.id)

			this.io.to(clientController.gameController.id).emit('message', `${clientController.id} has left ${clientController.gameController.id}.`);
		}

		// set new GameRoom for the clientController
		clientController.gameController = gameController;

		// join socket.io room for new GameRoom
		clientController.socket.join(gameController.id);

		clientController.bindGameListeners();

		gameController.clientControllers.push(clientController);

		debug.log(0, `Successfully connected Client ${clientController.id} to GameRoom ${gameController.id}`);
		this.io.to(gameController.id).emit('message', `Successfully connected Client ${clientController.id} to GameRoom ${gameController.id}`);
	}

	attemptClientJoinGameRoom(clientController, gameID) {
		let gameController = this.gameControllers.get(gameID);

		if (gameController) {
			this.connectClientToGameRoom(clientController, gameController);
		} else {
			debug.log(0, `No GameRoom with id ${gameID} found.`)
		}
	}

	// DEBUG

	printConnectionInformation () {
		console.log(`Client Controllers (${this.clientControllers.size}): `)
		this.clientControllers.forEach( (value, key)  => {
			console.log(`${key} -> ${value.gameController.id}`);
		})
		console.log(`Game Controllers (${this.gameControllers.size}): `)
		this.gameControllers.forEach( (value, key)  => {
			console.log(`${key} (${value.clientControllers.length})`);
			value.clientControllers.forEach( (member) => {
				console.log(`\u21B3 ${member.id}`);
			});
		})
	}
}
