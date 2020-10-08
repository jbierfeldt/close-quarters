import { DEBUG, createID } from '../shared/utilities.js';
const debug = new DEBUG(process.env.DEBUG, 0);
import Game from '../shared/Game.js';
import BasicAI from '../shared/AI.js';
import ClientController from './ClientController.js';

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

		this.gameStatus = 'LOBBY'; // LOBBY, IN_PROGRESS, COMPLETED
	}

	init() {

		this.game.init();

	}

	sendMessage (data) {
		this.io.to(this.id).emit('message', data);
	}

	registerClientController (clientController) {
		this.clientControllers.push(clientController);
		this.sendGameStateToAll();
		this.sendRoomStateToAll();
	}

	// function to be run when a clientController disconnects
	disconnectClientController (clientController) {

		// if the client was a player, check if now all the orders have been submitted
		// ...

		// remove outgoing client from playerSpot
		if (this.playerSpots[clientController.playerNumber] === clientController) {
			this.playerSpots[clientController.playerNumber] = null;
		}

		// remove outgoing client from clientControllers list
		this.clientControllers = this.clientControllers.filter( (member) => {
			if (member === clientController) {
				return false;
			}
			return true
		});

		this.checkAllOrdersSubmitted();

		// remove clientController from this.clientControllers
		// check if any existing clientControllers, if not, destruct
		// (likely achieved through telling the connectionHandler to delete)
	}

	assignClientToSpot (clientController, playerSpot) {
		// if spot is empty, assign player
		if (!this.playerSpots[playerSpot]) {
			// remove client from previous spot, if it's already in one
			if (this.playerSpots[clientController.playerNumber] === clientController) {
				this.playerSpots[clientController.playerNumber] = null;
			}

			// add client to desired spot
			this.playerSpots[playerSpot] = clientController;
			// give client new playerNumber
			clientController.setPlayerNumber(playerSpot);
			this.sendMessage(`${clientController.id} joined the room as player ${playerSpot}`);

			this.sendRoomStateToAll();

			return true;
		} else {
			debug.log(1, `Spot ${playerSpot} is already taken.`);
			return false;
		}	}

	removeClientFromSpot (clientController, playerSpot) {
		// check if clientController is already in playerSpot
		if (this.playerSpots[playerSpot] === clientController) {

			// remove client from desired spot
			this.playerSpots[playerSpot] = null;

			// send client back to match making
			clientController.setGamePhase('MATCHMAKING');

			clientController.setPlayerNumber(null)

			this.sendRoomStateToAll();

			return true;
		} else {
			return false;
		}
	}

	clearSpot (playerSpot) {
		if (this.playerSpots[playerSpot] instanceof ClientController) {
			this.removeClientFromSpot(this.playerSpots[playerSpot], playerSpot);
		} else {
			this.playerSpots[playerSpot] = null;
			this.sendRoomStateToAll();
		}
	}

	assignAIToSpot (playerSpot) {
		// if spot is empty, insert AI
		if (!this.playerSpots[playerSpot]) {

			let basicAI = new BasicAI(this.game, playerSpot);
			this.playerSpots[playerSpot] = basicAI;

			//Major Hack for AI first turn placements ******
			basicAI.createAIBase();
			this.executeOrder(this.playerSpots[playerSpot].ordersToExecute[0]);
			basicAI.createAIBase();
			this.executeOrder(this.playerSpots[playerSpot].ordersToExecute[1]);
			this.playerSpots[playerSpot].ordersToExecute = [];
			basicAI.generateOrders(0);

			basicAI.ordersSubmitted = true;


			this.sendRoomStateToAll();

			return true;
		} else {
			return false;
		}
	}

	startGame() {
		// if all seats in the lobby are filled with humans or AI,
		// start the game

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] !== null) {
				// do nothing
			} else {
				return false;
			}
		}

		this.setGamePhaseForAll('PLACEMENT'); // should happen as the result of a client triggered event 'GAME START'

		this.gameStatus = 'IN_PROGRESS';

		return true;
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

		this.setGamePhaseForAll("TITLE");
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

	getOpenSpotsCount () {
		let count = 0;
		for (let idx in this.playerSpots) {
			if (this.playerSpots[idx] === null) { count++ };
		}
		return count;
	}

	setGamePhaseForAll(phase) {
		this.io.to(this.id).emit('updateClientGamePhase', {
			newPhase: phase
		});
	}

	sendTurnsSubmittedToAll() {
		// tells all clients that the turns have been subitted
		this.io.to(this.id).emit('turnsSubmitted');
	}

	sendSuccessfulSimulationToAll() {
		this.io.to(this.id).emit('simulationSuccessful', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
		});
	}

	sendLastTurnHistoryToAll() {
		this.io.to(this.id).emit('updateLastTurnHistory', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
		});
	}

	sendLastTurnHistoryToClient(socket) {
		socket.emit('updateLastTurnHistory', {
			s_lastTurnHistory: JSON.stringify(this.game.getLastTurnHistory())
		});
	}

	sendGameStateToAll() {
		this.io.to(this.id).emit('updateGameState', {
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

	sendRoomStateToAll() {

		let playerSpots = {};

		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] && !this.playerSpots[i].isAI) {
				playerSpots[i] = {
					playerType: 'Human',
					gamePhase: this.playerSpots[i].clientGamePhase,
					ordersSubmitted: this.playerSpots[i].ordersSubmitted
				}
			} else if (this.playerSpots[i] && this.playerSpots[i].isAI) {
				playerSpots[i] = {
					playerType: 'AI',
					gamePhase: null,
					ordersSubmitted: this.playerSpots[i].ordersSubmitted
				}
			} else {
				playerSpots[i] = {
					playerType: 'Open',
					gamePhase: null,
					ordersSubmitted: null
				};
			}
		}

		this.io.to(this.id).emit('updateRoomState', {
			playerSpots: JSON.stringify(playerSpots)
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
		this.sendRoomStateToAll();

		// check if all the seated players have submitted their orders
		// if not, return false and don't execute
		let onlinePlayers = 0;
		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] && this.playerSpots[i].connectionState === 'ONLINE') {

				onlinePlayers++;

				// if player isn't defeated and hasn't submitted orders, stop checking
				if (this.playerSpots[i].clientState === 'ACTIVE_PLAYER' && !this.playerSpots[i].ordersSubmitted) {
					return false;
				}
			}
		}

		if (onlinePlayers < 1) {
			return false;
		}

		// TEMP
		// all human players have submitted their turns, fill the rest of the spots
		// with AI
		if (this.game.turnNumber === 1) {
			for (let i = 1; i <= 4; i++) {
				if (this.playerSpots[i] == null) {
					this.assignAIToSpot(i);

					// //Major Hack for AI first turn placements ******
					// basicAI.createAIBase();
					// this.executeOrder(this.playerSpots[i].ordersToExecute[0]);
					// basicAI.createAIBase();
					// this.executeOrder(this.playerSpots[i].ordersToExecute[1]);
					// this.playerSpots[i].ordersToExecute = [];
					// basicAI.generateOrders(0);

					// basicAI.ordersSubmitted = true;
				}
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

			// after orders executed, reset ClientController state
			this.playerSpots[i].ordersSubmitted = false;
			this.playerSpots[i].ordersToExecute = [];
		}

		// once all orders have been executed, run simulation
		this.runSimulation();

		// AI generate orders for next turn
		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i] instanceof BasicAI && this.game.players[i-1].victoryCondition !== -1) {
				this.playerSpots[i].generateOrders(0);
				this.playerSpots[i].ordersSubmitted = true;
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

	printGameRoomInformation() {
		console.log("\n Client Controllers:")
		for (let i = 0; i < this.clientControllers.length; i++) {
			console.log(this.clientControllers[i].id, this.clientControllers[i].playerNumber, this.clientControllers[i].clientState);
			for (let j = 0; j < this.clientControllers[i].socket.eventNames().length; j++) {
				console.log('\u21B3', this.clientControllers[i].socket.eventNames()[j]);
			}
		}
		console.log("\nPlayerSpots")
		for (let i = 1; i <= 4; i++) {
			if (this.playerSpots[i]) {
				console.log(i, `${this.playerSpots[i].id} - ${this.playerSpots[i].connectionState}`);
			} else {
				console.log(i, this.playerSpots[i])
			};
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
