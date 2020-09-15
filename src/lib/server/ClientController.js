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

		this.isConnected = false;

		this.ordersToExecute = [];
		this.ordersSubmitted = false;

		this.clientGamePhase = null;
		this.clientState = 'SPECTATOR'; // null, SPECTATOR, ACTIVE_PLAYER, DEFEATED_PLAYER
	}

	onConnect() {
		this.sendClientInfo();
		this.socket.emit("debugInfoUpdate");
	}

	removeListeners() {
		this.socket.removeAllListeners();
	}

	bindListeners() {
		this.socket.on('connection', () => {
			console.log('client ' + this.id + 'connect');
		})

		this.socket.on('printServerData', () => {
			this.connectionHandler.printConnectionInformation();
			this.gameController.printGameRoomInformation();
		})

		this.socket.on('joinGame', (data) => {
			this.connectionHandler.attemptClientJoinGameRoom(this, data.gameID);
		})
	}

	bindGameListeners () {

		// (re-)bind regular listeners as well
		this.removeListeners();
		this.bindListeners();

		this.socket.on('getOpenPlayerSpot', () => {
			console.log(this.gameController.id, this.gameController.playerSpots);
			this.gameController.getOpenPlayerSpot();
		})


	}

	oldbindGameListeners() {

		// bind regular listeners as well
		this.bindListeners();

		this.socket.on('connection', () => {
			console.log('client ' + this.id + 'connect');
		})

		this.socket.on('createUnit', (data) => {
			debug.log(0, `Received createUnit from ${this.socket.id}`);
			this.gameController.createUnit(data.unitType, data.player, data.x, data.y);
		});

		this.socket.on('createBase', (data) => {
			this.gameController.createBase(data.baseType, data.player, data.x, data.y);
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

		this.socket.on('forcesubmitTurn', (data) => {
			// will update game controller saying that this player has submitted their turn
			// for now, just forcing runSimulation
			this.ordersToExecute = JSON.parse(data);
			this.ordersSubmitted = true;

			// try to execute orders
			this.gameController.forceOrders();
		});

		// this.socket.on('printServerData', () => {
		// 	this.gameController.printServerData();
		// });

		this.socket.on('resetGame', (data) => {
			// reset Game
			this.gameController.resetGame();
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

		})

		this.socket.on('updateClientPhase', (data) => {
			this.clientGamePhase = data.newPhase;
			this.gameController.sendServerStateToAll();
		})

		this.socket.on('disconnect', (reason) => {
			console.log("disconnected", this.id, this.socket.id, reason);
			this.gameController.clientControllerDisconnect(this);
			this.gameController.sendServerStateToAll();

			// check if all orders have now been submitted
			this.gameController.checkAllOrdersSubmitted();
		});

	}

	setPlayerNumber (playerNumber) {
		this.playerNumber = playerNumber;
		// send client info
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

		if (this.clientState !== newState) {
			this.clientState = newState;
			this.sendClientState();
		}
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
			'gameRoom': this.gameController.id,
			'token': this.token
			// 'clientState': this.clientState,
			// 'playerNumber': this.playerNumber
		});
	}

}
