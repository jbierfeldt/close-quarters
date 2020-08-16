// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';
import * as Bases from './lib/shared/Base.js';
import {DEBUG} from './lib/shared/utilities.js';

window.debug = new DEBUG(process.env.DEBUG, 0);

const debugData = {
	'playerNumber': 1
};

class App {

	constructor(game = new Game(), display = new Display(this)) {
		this.game = null;
		this.display = null;
		this.gameState = undefined;
		this.socket = undefined;
		this.turnIsIn = false; //Use this for the transition
		this.simulationRun = false;

		this.gamePhase = undefined;
		this.currentTurnOrders = [];

		// info from server
		this.turnNumber = 1;
		this.currentTurnInitialState = {};
		this.lastTurnHistory = {};
		this.clientID = undefined;
		this.token = undefined;
		this.playerNumber = undefined;
		this.playersOnServer = undefined;
		this.spectatorMode = false;
		this.clientState = null;
		this.loadedClientInfoFromServer = false;
	}

	init() {
		this.game = new Game();
		this.display = new Display(this);
		this.socket = io({
			query: {
				token: localStorage.getItem('authToken') || ''
			}
		});

		this.game.init();
		this.setGamePhase(0);
		if (debug.enabled) {this.debugInit();};
		this.bindListeners();
	}

	onFinishedLoading () {
		this.display.init();
	}

	bindListeners () {

		this.socket.on('message', (data) => {
			debug.log(0, data);
		})

		this.socket.on('disconnect', (reason) => {
			// if (reason === 'io server disconnect') {
			// 	// the disconnection was initiated by the server, you need to reconnect manually
			// 	socket.connect();
			// }
			debug.log(0, 'disconnect', reason);
			// else the socket will automatically try to reconnect
		});

		this.socket.on('connect', () => {
			debug.log(0, "connect");
		});

		this.socket.on('reconnect_attempt', () => {
			debug.log(0, 'reconnect attempt...', this.socket);
			this.socket.io.opts.query = {
				token: this.token || ''
			};
		});

		this.socket.on('reconnect', (attemptNumber) => {
			debug.log(0, 'reconnect');
		});

		this.socket.on('debugInfoUpdate', (data) => {
			debug.log(0, 'update debug');
			this.updateDebugInfo();
		});

		this.socket.on('turnsSubmitted', () => {
			debug.log(0, 'all turns submitted');
			this.turnIsIn = true;
		});

		this.socket.on('simulationSuccessful', (data) => {
			this.updateLastTurnHistory(data);
			this.simulationRun = true;
			this.setGamePhase(2); // show simulation phase
		})

		this.socket.on('updateServerState', (data) => {
			let players = JSON.parse(data.players);
			this.playersOnServer = players;
			this.updateDebugInfo();
		});

		this.socket.on('updateLastTurnHistory', (data) => {
			this.updateLastTurnHistory(data);
		});

		this.socket.on('updateGameState', (data) => {
			debug.log(0, 'got game state from server', data);
			this.updateGameState(data);
		});

		this.socket.on('updateClientGamePhase', (data) => {
			debug.log(0, 'got new phase from server', data.newPhase);
			this.setGamePhase(data.newPhase);
		})

		this.socket.on('updateClientState', (data) => {
			debug.log(0, "got new client state");
			this.clientState = data.clientState;
		})

		this.socket.on('updateClientInfo', (data) => {
			this.updateTokenInfo(data.token);

			this.clientID = data.clientID;
			this.playerNumber = data.playerNumber;
			this.clientState = data.clientState;

			// if first time getting clientInfo, start Display
			if (this.loadedClientInfoFromServer === false) {
				this.onFinishedLoading();
				this.loadedClientInfoFromServer = true;
			}

			debug.log(1, "Got Client Info");
		})

	}

	createOrder (orderType, args) {
		let order = {
			player: this.playerNumber,
			turnNumber: this.turnNumber,
			orderType: orderType,
			args: args
		}

		this.currentTurnOrders.push(order);
		this.updateDebugInfo();
	}

	sendCreateBase (baseType, player, x, y) {
		debug.log(1, "making base");

		// validate if unit placement is allowed
		let createNewBase = this.game.createNewBaseAtCoord(baseType, player, x, y);

		// if so, create new order
		if (createNewBase) {
			this.createOrder('createBase', {
				baseType: baseType,
				player: player,
				x: x,
				y: y
			});
		}
	}

	sendCreateUnit (unitType, player, x, y) {
		debug.log(1, "making unit");

		// validate if unit placement is allowed
		let createNewUnit = this.game.createNewUnitAtCoord(unitType, player, x, y);

		// if so, create new order
		if (createNewUnit) {
			this.createOrder('createUnit', {
				unitType: unitType,
				player: player,
				x: x,
				y: y
			});
		};
	}

	sendSubmitTurn () {
		//debug.log(1, "submit turn!");
		this.socket.emit('submitTurn', JSON.stringify(this.currentTurnOrders));
	}

	forcesendSubmitTurn () {
		//debug.log(1, "submit turn!");
		this.socket.emit('forcesubmitTurn', JSON.stringify(this.currentTurnOrders));
	}

	sendDisconnect () {
		debug.log(1, "disconnecting");
		this.socket.close();
	}

	sendConnect () {
		debug.log(1, "connecting");
		this.socket.open();
	}

	sendPrintServerData () {
		this.socket.emit('printServerData');
	}

	sendResetGame () {
		debug.log(1, "Resetting game!");
		this.setGamePhase(0);
		this.socket.emit('resetGame');
	}

	setGamePhase (phase) {
		this.gamePhase = phase;
		this.socket.emit('updateClientPhase', {
			newPhase: this.gamePhase
		});
	}

	setTurnNumber (turnNumber) {
		this.turnNumber = turnNumber;
		this.game.turnNumber = turnNumber;
		this.currentTurnOrders = [];
	}

	loadSerializedGameState(serializedGameState) {
		let gameState = JSON.parse(serializedGameState);
		debug.log(0, 'unpacked state', gameState);
		return this.game.rebuildGameSnapshot(gameState);
	}

	loadSerializedLastTurnHistory (serializedLastTurnHisotry) {
		let historyObj = JSON.parse(serializedLastTurnHisotry);
		let tickContainer = historyObj.tick;
		for (const [key, value] of Object.entries(tickContainer)) {
			tickContainer[key] = this.game.rebuildGameSnapshot(tickContainer[key]);
		}
		return historyObj;
	}

	updateGameState (data) {
		debug.log(0, "updating Game State");
		this.setTurnNumber(data.turnNumber);
		this.game.currentTurnInitialState = this.loadSerializedGameState(data.currentTurnInitialState);
		this.game.loadGameSnapshot(this.game.currentTurnInitialState);

		this.updateDebugInfo();
	}

	updateLastTurnHistory (data) {
		let lastTurnHistory = this.loadSerializedLastTurnHistory(data.s_lastTurnHistory);
		this.display.t = 1;
		this.display.simulationDisplayTurn = lastTurnHistory;
		debug.log(0, "sent to Display", this.display.simulationDisplayTurn);
	}

	updateTokenInfo (token) {
		this.token = token;
		localStorage.setItem('authToken', this.token);

		// save token with socket for reconnect
		this.socket.io.opts.query = {
			token: this.token || ''
		};
	}

 /* Debug ============================== Debug
 */

	debugInit () {
		document.getElementById("debug-pane").style.visibility = 'visible';
		document.getElementById("submit-turn").addEventListener("click", this.sendSubmitTurn.bind(this));
		document.getElementById("force-submit-turn").addEventListener("click", this.forcesendSubmitTurn.bind(this));
		document.getElementById("server-data").addEventListener("click", this.sendPrintServerData.bind(this));
		document.getElementById("reset-game").addEventListener("click", this.sendResetGame.bind(this));
		document.getElementById("phase-1").addEventListener("click", this.setGamePhase.bind(this, 1));
		document.getElementById("phase-2").addEventListener("click", this.setGamePhase.bind(this, 2));
		document.getElementById("phase-3").addEventListener("click", this.setGamePhase.bind(this, 3));
		document.getElementById("disconnect").addEventListener("click", this.sendDisconnect.bind(this));
		document.getElementById("connect").addEventListener("click", this.sendConnect.bind(this));
		document.getElementById("authdump").addEventListener("click", function(){ localStorage.authToken = ''; window.open(window.location.href,'_blank'); });
		document.getElementById("save-snapshot").addEventListener("click", this.saveSnapshot.bind(this));
		document.getElementById("load-snapshot").addEventListener("click", this.loadSnapshot.bind(this));
	}

	saveSnapshot () {
		let name = document.getElementById("snapshot-name").value;
		let snapshot = {
			turnNumber: this.game.turnNumber,
			currentTurnInitialState: JSON.stringify(this.game.createGameSnapshot())
		}

		localStorage['snapshot_'+name] = JSON.stringify(snapshot);
	}

	loadSnapshot () {
		let name = document.getElementById("snapshot-name").value;
		let snapshot = localStorage['snapshot_'+name];
		if (snapshot) {
			this.socket.emit('loadSnapshot', snapshot);
		}
	}

	updateDebugInfo () {

		const debugData = {
			'clientID': this.clientID,
			'clientState': this.clientState,
			'playerNumber': this.playerNumber,
			'turnNumber': this.turnNumber,
		}

		const debugWindow = document.getElementById("debug-info");
		debugWindow.innerHTML = '';
		for (let el in debugData) {
			let newEl = document.createElement("div");
			newEl.innerHTML = String(el + ": " + debugData[el]);
			debugWindow.append(newEl);
		}

		document.getElementById("orders-info").innerHTML = '';
		if (this.currentTurnOrders.length > 0) {
			for (let i = 0; i < this.currentTurnOrders.length; i++) {
				let newOrderDiv = document.createElement("div");
				newOrderDiv.innerHTML = String("Order " + (i+1) + ": " + this.currentTurnOrders[i].orderType);
				if (this.currentTurnOrders[i].args.unitType) {
					newOrderDiv.innerHTML += String(" " + this.currentTurnOrders[i].args.unitType);
				}
				document.getElementById("orders-info").append(newOrderDiv);
			}
		}

		if (this.playersOnServer) {
			document.getElementById("players-info").innerHTML = '';
			for (let i = 1; i <= 4; i++) {
				let newPlayerDiv = document.createElement("div");
				let newPlayerSpan = document.createElement("span");
				if (this.playersOnServer[i] !== null) {
					switch (this.playersOnServer[i].gamePhase) {
						case 0:
						newPlayerSpan.innerHTML = "Loading...";
						break
						case 1:
						if (this.playersOnServer[i].ordersSubmitted) {
							newPlayerSpan.innerHTML = "Orders submitted.";
						} else {
							newPlayerSpan.innerHTML = "Making Turn...";
						}
						break
						case 2:
						newPlayerSpan.innerHTML = "Watching Simulation...";
						break
						case 3:
						newPlayerSpan.innerHTML = "Reviewing Board...";
						break
					}
				} else {
					newPlayerSpan.innerHTML = "Empty";
				}
				newPlayerDiv.innerHTML = String("Player " + i + ": ");
				newPlayerDiv.append(newPlayerSpan)
				document.getElementById("players-info").append(newPlayerDiv);
			}
		}

	}

}

const app = new App();
app.init();

// secret reset for production games
window.resetGame = app.sendResetGame.bind(app);

app.display.stage.grid = app.game.board;
