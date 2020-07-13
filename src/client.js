// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';
import * as Bases from './lib/shared/Base.js';
import {DEBUG} from './lib/shared/utilities.js';

window.debug = new DEBUG(true, 3);

const debugData = {
	'playerNumber': 1
};

class App {

	constructor(game = new Game(), display = new Display(this)) {
		this.game = game;
		this.display = display;
		this.gameState = undefined;
		this.socket = undefined;

		this.gamePhase = 0;

		// info from server
		this.turnNumber = 1;
		this.currentTurnInitialState = {};
		this.clientID = undefined;
		this.playerNumber = undefined;
	}

	init() {
		this.game.init();
		this.display.init();
		this.socket = io();

		this.debugInit();

		this.socket.on('debugInfoUpdate', (data) => {
			console.log('update debug');
			this.updateDebugInfo();
		});

		this.socket.on('updateGameHistory', (data) => {
			console.log('got game history from server');
			this.updateGameHistory(data);
		});

		this.socket.on('updateGameState', (data) => {
			console.log('got game state from server', data);
			this.updateGameState(data);
		});



		this.socket.on('updatePlayerState', (data) => {
			this.clientID = data.clientID;
			this.playerNumber = data.playerNumber;
			debug.log(3, 'updating PlayerState');
		});
	}

	debugInit () {
		document.getElementById("submit-turn").addEventListener("click", this.sendSubmitTurn.bind(this));
		document.getElementById("reset-game").addEventListener("click", this.sendResetGame.bind(this));
		document.getElementById("phase-1").addEventListener("click", this.setGamePhase.bind(this, 1));
		document.getElementById("phase-2").addEventListener("click", this.setGamePhase.bind(this, 2));
	}

	sendCreateBase (baseType, player, x, y) {
		debug.log(1, "making base");
		this.game.createNewBaseAtCoord(baseType, player, x, y);
		this.socket.emit('createBase', {
			baseType: baseType,
			player: player,
			x: x,
			y: y
		});
	}

	sendCreateUnit (unitType, player, x, y) {
		debug.log(1, "making unit");
		this.game.createNewUnitAtCoord(unitType, player, x, y);
		this.socket.emit('createUnit', {
			unitType: unitType,
			player: player,
			x: x,
			y: y
		});
	}

	sendSubmitTurn () {
		debug.log(1, "submit turn!");
		this.socket.emit('submitTurn');
	}

	sendResetGame () {
		debug.log(1, "Resetting game!");
		// this.gamePhase = 0;
		this.socket.emit('resetGame');
	}

	setGamePhase (phase) {
		this.gamePhase = phase;
	}

	loadSerializedGameState(serializedGameState) {
		let gameState = JSON.parse(serializedGameState);
		return this.game.rebuildGameSnapshot(gameState);
	}

	loadSerializedTurnHistory(serializedHistory)  {
		let historyObj = JSON.parse(serializedHistory);
		for (const [key, value] of Object.entries(historyObj.turn)) {
  			let tickContainer = historyObj.turn[key].tick;
				for (const [key2, value2] of Object.entries(tickContainer)) {
					tickContainer[key2] = this.game.rebuildGameSnapshot(tickContainer[key2]);
				}
		}
		return historyObj;
	}

	updateGameState (data) {
		console.log("updating Game State");
		this.turnNumber = data.turnNumber;
		this.game.turnNumber = data.turnNumber;
		this.game.currentTurnInitialState = this.loadSerializedGameState(data.currentTurnInitialState);
		this.game.loadGameSnapshot(this.game.currentTurnInitialState);

		console.log(this.game.gameObjects);

		this.updateDebugInfo();
	}

	updateGameHistory (data) {
		console.log("updateGameHistory", data);
		let history = this.loadSerializedTurnHistory(data.s_history);
		this.game.history = history;
		this.display.simulationDisplayTurn = this.game.history.turn[this.turnNumber-1];
		console.log("sent to Display", this.turnNumber-1, this.display.simulationDisplayTurn);
	}

	updateDebugInfo () {

		const debugData = {
			'clientID': this.clientID,
			'playerNumber': this.playerNumber,
			'turnNumber': this.turnNumber
		}

		const debugWindow = document.getElementById("debug-info");
		debugWindow.innerHTML = '';
		for (let el in debugData) {
			let newEl = document.createElement("div");
			newEl.innerHTML = String(el + ": " + debugData[el]);
			debugWindow.append(newEl);
		}
	}

}

const app = new App();
app.init();

app.display.stage.grid = app.game.board;
