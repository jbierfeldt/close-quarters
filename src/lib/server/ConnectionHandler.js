import { DEBUG, createID } from '../shared/utilities.js';
const debug = new DEBUG(process.env.DEBUG, 0);
import ClientController from './ClientController.js';
import GameController from './GameController.js';

const jwt = require('jsonwebtoken');

class PubSub {

	constructor() {
		this.subscribers = {};
	}

	subscribe(event, callback) {
		let index;
		const that = this;

		if (!this.subscribers[event]) {
			this.subscribers[event] = [];
		}

		index = this.subscribers[event].push(callback) - 1;

		return {
			unsubscribe() {
				that.subscribers[event].splice(index, 1);
			}
		}
	}

	publish(event, data) {
		if (!this.subscribers[event]) return;

		this.subscribers[event].forEach(subscriberCallback => {
			subscriberCallback(data);
		});
	}

}

export default class ConnectionHandler {

	constructor(IO_INSTANCE, SECRET_KEY) {
		this.io = IO_INSTANCE;
		this.SECRET_KEY = SECRET_KEY;
		this.events = new PubSub();

		// current open game (temp)
		this.openGame = null;

		this.clientControllers = new Map();
		this.gameControllers = new Map();
	}

	init() {

		this.registerMiddleware();

		let newGame = new GameController(this.io);
		newGame.init();

		this.gameControllers.set(newGame.id, newGame);

		this.openGame = newGame;

		this.io.on('connection', (socket) => {

			// check for already existing token and if so, don't make new player controller
			if (socket.sessionID) {
				let clientController = this.clientControllers.get(socket.sessionID);

				if (clientController) {
					this.reconnectClientController(clientController, socket);
				} else {
					this.createClientController(socket);
				}
			} else {
				this.createClientController(socket);
			}

			socket.clientController.onConnect();

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

	bindGameControllerListeners(clientController, gameController) {
		this.events.subscribe('turnSubmitted', (data) => {
			console.log(`${clientController.id} has submitted turn with data ${data}`);
		});

		this.events.subscribe('printServerData', () => {
			console.log(`${clientController.id} wants to print server data`);
		});

		this.events.subscribe('resetGame', () => {
			console.log(`${clientController.id} wants to reset the game`);
		});

		this.events.subscribe('loadSnapshot', (data) => {
			console.log(`${clientController.id} wants to load the snapshot ${data}`);
		});

		this.events.subscribe('updateClientPhase', (data) => {
			console.log(`${clientController.id} has updated its clientPhase to be ${data}`);
		});

		this.events.subscribe('disconnected', (data) => {
			console.log(`${clientController.id} has disconnected for reason: ${data}`);
		});
	}

	// create new clientController with information from socket
	createClientController(socket) {

		let newClientController = new ClientController({
			id: socket.id,
			token: this.signClientToken(socket.id)
		})

		newClientController.eventHandler = this.events;

		newClientController.setSocket(socket);

		newClientController.setGameController(this.openGame);
		this.bindGameControllerListeners(newClientController, this.openGame);
		newClientController.playerNumber = 1;

		socket.clientController = newClientController;

		this.clientControllers.set(newClientController.id, newClientController);

		console.log(this.clientControllers);

	}

	reconnectClientController(clientController, socket) {

		clientController.setSocket(socket);

		socket.clientController = clientController;

	}
}
