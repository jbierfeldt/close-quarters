import { DEBUG, createID } from '../shared/utilities.js';
const debug = new DEBUG(process.env.DEBUG, 0);
import Game from '../shared/Game.js';
import BasicAI from '../shared/AI.js';

export default class GameController {

	constructor({ id, IO_INSTANCE }) {
		this.id = id;
		this.game = new Game();
		this.io = IO_INSTANCE;

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

	}

	sendMessage () {
		this.io.to(this.id).emit('message', this.id);
	}

	// function to be run when a clientController disconnects
	disconnectClientController (clientController) {

		this.clientControllers = this.clientControllers.filter( (member) => {
			if (member === clientController) {
				return false;
			}
			return true
		});
		
		// remove clientController from this.clientControllers
		// check if any existing clientControllers, if not, destruct
		// (likely achieved through telling the connectionHandler to delete)
	}

	resetGame() {
		let newGame = new Game();
		this.game = newGame;
		this.game.init();

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] instanceof BasicAI) {
				this.playerSpots[i] = null;
			}
		}

		this.setGamePhaseForAll(0);
		this.sendGameStateToAll();
		this.sendLastTurnHistoryToAll();
	}

	loadSnapshot(snapshot) {

		console.log('loading snapshot');

		this.game.turnNumber = snapshot.turnNumber;
		let gameState = JSON.parse(snapshot.currentTurnInitialState);
		gameState = this.game.rebuildGameSnapshot(gameState);
		this.game.loadGameSnapshot(gameState);

		this.sendGameStateToAll();
	}

	getOpenPlayerSpot() {
		// returns the id of next open player spot or false if all spots are filled
		for (let idx in this.playerSpots) {
			if (this.playerSpots[idx] === null) { return idx };
		}
		// if all filled
		return false;
	}

	// clientControllerConnect(clientController, newSocket) {

	// 	clientController.setSocket(newSocket);
	// 	clientController.isConnected = true;

	// 	if (clientController.playerNumber) {
	// 		clientController.setClientStateFromVictoryCondition(this.game.players[clientController.playerNumber - 1].victoryCondition);
	// 	} else {
	// 		clientController.clientState = 'SPECTATOR';
	// 		clientController.sendClientState();
	// 	}

	// 	clientController.onConnect();

	// 	this.playersOnline.push(clientController);

	// 	this.sendGameStateToClient(clientController.socket);
	// 	this.sendLastTurnHistoryToClient(clientController.socket);

	// 	// console.log('connected', clientController.playerNumber, clientController.id, clientController.socket.id);

	// }

	// clientControllerDisconnect(clientController) {
	// 	clientController.isConnected = false;
	// 	clientController.clientState = "DISCONNECTED";

	// 	if (clientController.playerNumber) {
	// 		this.playerSpots[clientController.playerNumber] = null;
	// 	}

	// 	const idx = this.playersOnline.indexOf(clientController);
	// 	this.playersOnline.splice(idx, 1);

	// 	// console.log('disconnect', clientController.playerNumber, clientController.id);
	// }

	// clientControllerReconnect(clientController, newSocket) {

	// 	// if client already has a playerNumber and that playerSpot is free, reclaim it
	// 	if (clientController.playerNumber
	// 		&& this.playerSpots[clientController.playerNumber] === null) {
	// 		this.playerSpots[clientController.playerNumber] = clientController;
	// 	}

	// 	this.clientControllerConnect(clientController, newSocket);

	// 	console.log('reconnected', clientController.playerNumber, clientController.id, clientController.socket.id);

	// }

	setGamePhaseForAll(phase) {
		this.io.emit('updateClientGamePhase', {
			newPhase: phase
		});
	}

	sendTurnsSubmittedToAll() {
		// tells all clients that the turns have been subitted
		this.io.emit('turnsSubmitted');
	}

	sendSuccessfulSimulationToAll() {
		this.io.emit('simulationSuccessful', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
		});
	}

	sendLastTurnHistoryToAll() {
		this.io.emit('updateLastTurnHistory', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
		});
	}

	sendLastTurnHistoryToClient(socket) {
		socket.emit('updateLastTurnHistory', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
		});
	}

	sendGameStateToAll() {
		this.io.emit('updateGameState', {
			turnNumber: this.game.turnNumber,
			currentTurnInitialState: JSON.stringify(this.game.createGameSnapshot())
		});
	}

	sendGameStateToClient(socket) {
		socket.emit('updateGameState', {
			turnNumber: this.game.turnNumber,
			currentTurnInitialState: JSON.stringify(this.game.currentTurnInitialState)
		});
	}

	sendServerStateToAll() {

		let playerSpots = {};

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] && this.playerSpots[i].isConnected) {
				playerSpots[i] = {
					gamePhase: this.playerSpots[i].clientGamePhase,
					ordersSubmitted: this.playerSpots[i].ordersSubmitted
				}
			} else if (this.playerSpots[i] && this.playerSpots[i].isAI) {
				playerSpots[i] = {
					gamePhase: 'AI',
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

	checkPlayerStateChanges() {
		// checks if players have been defeated/victorious

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i].isConnected) {
				this.playerSpots[i].setClientStateFromVictoryCondition(this.game.players[i - 1].victoryCondition);
			}
		}

	}

	checkAllOrdersSubmitted() {
		// update all clients on who has submitted orders
		this.sendServerStateToAll();

		//  check if players Online
		if (this.playersOnline.length == 0) {
			return false;
		}

		// check if all the seated players have submitted their orders
		// if not, return false and don't execute
		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] && this.playerSpots[i].isConnected) {
				if (this.playerSpots[i].clientState === 'ACTIVE_PLAYER' && !this.playerSpots[i].ordersSubmitted) {
					return false;
				}
			}
		}

		// all human players have submitted their turns, fill the rest of the spots
		// with AI

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] == null) {
				let basicAI = new BasicAI(this.game, i);

				basicAI.createSecondBase(); // run createSecondBase for now
				// because this only happens after the first turn
				basicAI.createRandomUnit();

				this.playerSpots[i] = basicAI;
			}
		}

		// send turnsSubmitted event to clients
		this.sendTurnsSubmittedToAll();

		// if all human players have submitted their orders, execute orders
		// execute orders

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i].ordersToExecute.length > 0) {
				for (let j = 0; j < this.playerSpots[i].ordersToExecute.length; j++) {
					this.executeOrder(this.playerSpots[i].ordersToExecute[j]);
				}
			}

			// after orders executed, reset ClientController
			this.playerSpots[i].ordersSubmitted = false;
			this.playerSpots[i].ordersToExecute = [];
		}

		// once all orders have been executed, run simulation
		this.runSimulation();

		// AI generate orders for next turn
		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] instanceof BasicAI) {
				this.playerSpots[i].createRandomUnit();
			}
		}
	}

	forceOrders() {
		//if all online players have submitted their orders, execute orders
		// execute orders
		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i].ordersToExecute.length > 0) {
				for (let j = 0; j < this.playerSpots[i].ordersToExecute.length; j++) {
					this.executeOrder(this.playerSpots[i].ordersToExecute[j]);
				}
			}

			// after orders executed, reset ClientController
			this.playerSpots[i].ordersSubmitted = false;
			this.playerSpots[i].ordersToExecute = [];
		}

		// once all orders have been executed, run simulation
		this.runSimulation();

		// AI generate orders for next turn
		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] instanceof BasicAI) {
				this.playerSpots[i].createRandomUnit();
			}
		}
	}

	printServerData() {
		console.log("Players Online:")
		for (let i = 0; i < this.playersOnline.length; i++) {
			console.log(this.playersOnline[i].id, this.playersOnline[i].playerNumber, this.playersOnline[i].ordersSubmitted, this.playersOnline[i].ordersToExecute);
			// console.log(this.game.players[this.playersOnline[i].playerNumber - 1]);
		}
		console.log("Client Controllers:")
		for (let i = 0; i < this.clientControllers.length; i++) {
			console.log(this.clientControllers[i].id, this.clientControllers[i].playerNumber, this.clientControllers[i].clientState);
		}
		console.log("PlayerSpots")
		for (let i = 1; i <= 4; i++) {
			console.log(i, this.playerSpots[i]);
		}
	}

	executeOrder(order) {
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
		this.sendSuccessfulSimulationToAll();
	}

}