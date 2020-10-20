import { DEBUG, createID } from '../shared/utilities.js';
const debug = new DEBUG(process.env.DEBUG, 0);

export default class ClientController {

	constructor({ id, token, connectionHandler }) {
		this.id = id; // UUID for client, using UUID from first socket
		this.token = token; // signed auth token
		this.connectionHandler = connectionHandler; // reference to connectionHandler

		this.socket = null;
		this.gameController = null;
		this.playerNumber = null;

		this.isAI = false;
		this.connectionState = 'ONLINE'; // ONLINE, OFFLINE, RECONNECTING

		this.ordersToExecute = [];
		this.ordersSubmitted = false;

		this.clientGamePhase = 'TITLE';
		this.clientState = null; // Prior to player assignment - fix for null, SPECTATOR, ACTIVE_PLAYER, DEFEATED_PLAYER
	}

	onConnect() {
		this.sendClientInfo();
		this.socket.emit("debugInfoUpdate");
	}

	onSuccessfulJoinGame() {
		this.sendClientInfo();
		this.gameController.sendLastTurnHistoryToClient(this.socket);
	}

	onLeaveGameRoom() {
		this.removeGameListeners();

		if (this.gameController !== null) {

			this.gameController.disconnectClientController(this);

			// leave socket.io room
			this.socket.leave(this.gameController.id)

			this.gameController = null;
			this.playerNumber = null;
			this.ordersToExecute = [];
			this.ordersSubmitted = false;
			this.clientGamePhase = null;
			this.clientState = null;
		}

		this.setGamePhase('MATCHMAKING');
		this.sendClientInfo();
	}

	disconnectFromGame() {
		this.connectionState = 'OFFLINE';
		this.removeGameListeners();

		if (this.gameController !== null) {

			this.gameController.disconnectClientController(this);

			// leave socket.io room
			this.socket.leave(this.gameController.id)

			this.gameController = null;
			this.playerNumber = null;
			this.ordersToExecute = [];
			this.ordersSubmitted = false;
			this.clientGamePhase = null;
			this.clientState = null;
		}
	}

	removeGameListeners() {
		// removes all listeners and adds just client ones again
		this.bindListeners();
	}

	removeListeners() {
		this.socket.removeAllListeners();
	}

	bindListeners() {

		// clear old listeners, to prevent doubling when a player connects
		// and then joins a game
		this.removeListeners();

		this.socket.on('connection', () => {
			console.log('client ' + this.id + 'connect');
		})

		this.socket.on('printServerData', () => {
			this.connectionHandler.printConnectionInformation();
			if (this.gameController) this.gameController.printGameRoomInformation();
		})

		this.socket.on('joinGame', async (data, callback) => {
			let joinedGameResult = await this.connectionHandler.attemptClientJoinGameRoom(this, data.gameID);
			callback(joinedGameResult);
		})

		this.socket.on('joinOpenGame', async (callback) => {
			let joinedGameResult = await this.connectionHandler.attemptClientJoinOpenGame(this);
			callback(joinedGameResult);
		});

		this.socket.on('createGameRoom', async (callback) => {
			let newGame = this.connectionHandler.createGameRoom();
			let joinGameResult = await this.connectionHandler.attemptClientJoinGameRoom(this, newGame);
			callback(joinGameResult, newGame);
		});

		this.socket.on('updateClientGamePhase', (data) => {
			this.clientGamePhase = data.newPhase;
		})
	}

	bindGameListeners () {

		this.socket.removeAllListeners('updateClientGamePhase');
		this.socket.on('updateClientGamePhase', (data) => {

			// if (data.newPhase === "REVIEW") {
			// 	this.setClientStateFromVictoryCondition(this.gameController.game.players[this.playerNumber - 1].victoryCondition);
			// }

			this.clientGamePhase = data.newPhase;

			this.gameController.sendRoomStateToAll();
		})

		this.socket.on('disconnect', (reason) => {
			if (reason === 'transport close') {
				this.connectionState = 'RECONNECTING';

				this._reconnectTimer = setTimeout( () => {

					debug.log(1, `ten seconds elapsed, removing client ${this.id} from game ${this.gameController.id}`);

					this.disconnectFromGame();

				}, 10000);
			}
		});

		this.socket.on('submitTurn', (data) => {
			debug.log(0, `Received submit turn with ${data}`);
			// will update game controller saying that this player has submitted their turn
			// for now, just forcing runSimulation
			this.ordersToExecute = JSON.parse(data);
			this.ordersSubmitted = true;

			// try to execute orders
			this.gameController.checkAllOrdersSubmitted();
		});

		this.socket.on('resetGame', (data) => {
			// reset Game
			this.gameController.resetGame();
			this.onLeaveGameRoom();
		});

		this.socket.on('loadSnapshot', (data) => {
			debug.log(0, `Got loadSnapshot`);

			try {
				let snapshot = JSON.parse(data);
				if (snapshot.turnNumber && snapshot.currentTurnInitialState) {
					this.gameController.loadSnapshot(snapshot);
				}
				return true;
			} catch (e) {
				debug.log(0, e);
				return false;
			}

		});

		this.socket.on('assignAIToSpot', (data) => {
			this.gameController.assignAIToSpot(data.playerSpot);
		});

		this.socket.on('clearSpot', (data) => {
			this.gameController.clearSpot(data.playerSpot);
		});

		this.socket.on('startGame', () => {
			this.gameController.startGame();
		});

	}

	setPlayerNumber (playerNumber) {
		debug.log(2, `setting ${this.id} player number to ${playerNumber}`);
		this.playerNumber = playerNumber;
		this.sendClientInfo();
	}

	setGamePhase (gamePhase) {
		this.socket.emit('updateClientGamePhase', {
			newPhase: gamePhase
		});
	}

	setClientState (state) {
		this.clientState = state;
		this.sendClientInfo();
	}

	setClientStateFromVictoryCondition(victoryCondition) {
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
		}

		debug.log(1, `setting client state ${this.id} to ${newState}`);

		if (this.clientState !== newState) {
			this.clientState = newState;
			this.sendClientState();
		}
	}

	sendLobbyInfo() {
		let gameRooms = {};
		this.connectionHandler.gameControllers.forEach( (value, key)  => {
			gameRooms[key] = {
				openSpots: value.getOpenSpotsCount()
			}
		});
		this.socket.emit("updateLobbyInfo", JSON.stringify({
			'gameRooms': gameRooms
		}));
	}

	sendClientState() {
		console.log("sending client state", this.id, this.clientState);
		this.socket.emit("updateClientState", {
			'clientState': this.clientState
		});
	}

	sendClientInfo() {
		this.socket.emit("updateClientInfo", {
			'clientID': this.id,
			'socketID': this.socket.id,
			'gameRoom': (this.gameController ? this.gameController.id : null),
			'token': this.token,
			'clientState': this.clientState,
			'clientGamePhase': this.clientGamePhase,
			'playerNumber': this.playerNumber
		});
	}

}
