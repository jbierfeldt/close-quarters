import e from 'express';
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
		this.openGames = [];

		this.clientControllers = new Map();
		this.gameControllers = new Map();
	}

	init() {

		this.registerMiddleware();

		let firstGame = this.createGameRoom();
		this.openGames.push(firstGame);

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

			//set connect timer to 20 seconds

			const disconnectCallback = () => {
				if (socket.clientController) {
					socket.clientController.connectionState = 'OFFLINE';
				}

				socket.disconnect(true);

				// console.log(`disconnecting ${socket.id} because of timeout`);
			}
			socket._connectTimer = setTimeout(disconnectCallback, 20000);

			// should receive a ping packet every 15 seconds, reset _connectTimer
			socket.conn.on('packet', function (packet) {
				if (packet.type === 'ping') {
					// clear timer
					clearTimeout(socket._connectTimer);

					// set again
					socket._connectTimer = setTimeout(disconnectCallback, 20000);
				}
			});

			socket.on('disconnect', (reason) => {
				debug.log(0, `socket ${socket.id} disconnected because: ${reason}`);
			})

			debug.log(0, `new socket ${socket.id} connected as ${socket.clientController.id}`);
		});

	}

	getOpenGame () {

		for (let i = 0; i < this.openGames.length; i++) {
			let openGame = this.gameControllers.get(this.openGames[i]);
			let openSpots = openGame.getOpenSpotsCount();
			if (openSpots >= 1) {
				return openGame;
			}
		}

		// if no open games, make a new one
		let newOpenGame = this.createGameRoom();
		this.openGames.push(newOpenGame);
		let openGame = this.gameControllers.get(newOpenGame);
		return openGame;
	}

	getOnlinePlayerCount () {
		let count = 0;
		for (const [key, value] of this.clientControllers.entries()) {
			if (value.connectionState === 'ONLINE') {
				count++;
			}
		  }
		return count;
	}

	createGameRoom() {
		for (let i = 0; i < 1; i++) {
				let newGameID = createID(5);

				let newGame = new GameController({
					id: newGameID,
					IO_INSTANCE: this.io,
					connectionHandler: this
				});
				newGame.init();

				this.gameControllers.set(newGame.id, newGame);

				return newGameID;
			}
	}

	destroyGameRoom(gameID) {
		this.gameControllers.delete(gameID);

		// also remove from openGames
		this.openGames = this.openGames.filter( (member) => {
			if (member === gameID) {
				return false;
			}
			return true
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

			if (clientController._reconnectTimer) {
				debug.log(1, `clearing reconnectTimer for ${clientController.id}`);
				clearTimeout(clientController._reconnectTimer);
			}

			clientController.socket.join(clientController.gameController.id, () => {
				clientController.gameController.sendRoomStateToAll();
				clientController.gameController.sendGameStateToClient(clientController.socket);
				clientController.gameController.sendLastTurnHistoryToClient(clientController.socket);

				// might be deprecated...
				clientController.bindGameListeners();
			});
		}

	}

	connectSocketToClient(socket, clientController) {
		// if the clientController already has a socket,
		// remove its listeners and disconnect it
		if (clientController.socket !== null) {

			// remove clientController reference from old socket
			clientController.socket.clientController = null;
			clientController.removeListeners();
			clientController.socket.disconnect();
		};

		// store reference to the new socket
		clientController.socket = socket;

		// set client connectionState
		clientController.connectionState = 'ONLINE';

		// send lobby info on new connect
		clientController.sendLobbyInfo();

		// bind new listeners to socket
		clientController.bindListeners();
	}

	async connectClientToGameRoom(clientController, gameController) {
		// if the client already is in a GameRoom, leave that one
		if (clientController.gameController !== null) {

			this.io.to(clientController.gameController.id).emit('message', `${clientController.id} has left ${clientController.gameController.id}.`);

			clientController.onLeaveGameRoom();
		}

		// join socket.io room for new GameRoom
		// join is async, so await promise before continuing
		const joinedSocket = await new Promise(
				(resolve, reject) => {
					clientController.socket.join(gameController.id, () => {
			
						this.io.to(gameController.id).emit('message', `Successfully connected Client ${clientController.id} to GameRoom ${gameController.id}`);
			
						resolve(true);
					});
				}
			)

		// set new GameRoom for the clientController
		clientController.gameController = gameController;
		
		// add player to open player spot
		let openSpot = gameController.getOpenPlayerSpot();
		if (openSpot) {

			gameController.assignClientToSpot(clientController, openSpot);
			clientController.setClientState('ACTIVE_PLAYER');

		} else {

			clientController.setPlayerNumber(null);
			clientController.setClientState('SPECTATOR');

		}

		gameController.registerClientController(clientController);

		clientController.bindListeners();
		clientController.bindGameListeners();

		clientController.onSuccessfulJoinGame(); // also sends clientinfo
		clientController.sendLobbyInfo();

		debug.log(0, `Successfully connected Client ${clientController.id} to GameRoom ${gameController.id}`);

		return joinedSocket;
	}

	async attemptClientJoinGameRoom(clientController, gameID) {
		let gameController = this.gameControllers.get(gameID);

		if (gameController) {
			let joinStatus = await this.connectClientToGameRoom(clientController, gameController);

			if (joinStatus === true) {
				return true;
			} else {
				debug.log(0, "Error joining client to Game Room.");
				return false;
			}
		} else {
			debug.log(0, `No GameRoom with id ${gameID} found.`)
			return false;
		}
	}

	attemptClientJoinOpenGame(clientController) {
		let openGame = this.getOpenGame();
		this.connectClientToGameRoom(clientController, openGame);
		return true;
	}

	// DEBUG

	printConnectionInformation () {
		console.log("\n\n Socket.io Sockets:")
			for (let socketID in this.io.sockets.sockets) {
				console.log(socketID);
			}
		console.log(`\n\n Client Controllers (${this.clientControllers.size}): `)
		this.clientControllers.forEach( (value, key)  => {
			console.log(`${key} (${value.connectionState}) -> ${(value.gameController ? value.gameController.id : '')}`);
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
