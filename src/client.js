// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';
import * as Bases from './lib/shared/Base.js';
import {DEBUG} from './lib/shared/utilities.js';

window.debug = new DEBUG(true, 0);

const debugData = {
	'playerNumber': 1
};

class App {

	constructor(game = new Game(), display = new Display(this)) {
		this.game = game;
		this.display = display;
		this.gameState = undefined;
		this.socket = undefined;

		// info from server
		this.turnNumber = 1;
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

		this.socket.on('updatePlayerState', (data) => {
			this.clientID = data.clientID;
			this.playerNumber = data.playerNumber;
			debug.log(3, 'updating PlayerState');
		});
	}

	debugInit () {
		document.getElementById("submit-turn").addEventListener("click", this.sendSubmitTurn.bind(this));
	}

	sendCreateBase (baseType, player, x, y) {
		debug.log(1, "making base");
		this.socket.emit('createBase', {
			baseType: baseType,
			player: player,
			x: x,
			y: y
		});
	}

	sendCreateUnit (unitType, player, x, y) {
		debug.log(1, "making unit");
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

	loadSerializedGameState(serializedGameState) {
		let tickContainer = this.game.loadSerializedGameState(serializedGameState);
		for (const [key, value] of Object.entries(tickContainer.tick)) {
  			tickContainer.tick[key] = JSON.parse(value);
		}
		return tickContainer;
	}

	loadSerializedTurnHistory(serializedHistory)  {
		let historyObj = JSON.parse(serializedHistory);
		console.log("hisobj", historyObj);
		for (const [key, value] of Object.entries(historyObj.turn)) {
  			let tickContainer = historyObj.turn[key].tick;
				for (const [key2, value2] of Object.entries(tickContainer)) {
					tickContainer[key2] = this.game.rebuildGameSnapshot(tickContainer[key2]);
				}
		}
		return historyObj;
	}

	updateGameHistory (data) {
		this.turnNumber = data.turnNumber;
		let history = this.loadSerializedTurnHistory(data.s_history);
		this.game.history = history;
		this.display.simulationDisplayTurn = this.game.history.turn[this.turnNumber - 1];
		console.log("sent to Display", this.display.simulationDisplayTurn);
		// this.display.board = this.loadSerializedGameState(data.s_history.turn[this.turnNumber - 1]);
		// debug.log(1, "updated Game State");

		this.updateDebugInfo();
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

// const game = new Game();
// game.init();
// debug.log(0, game);
//
// let oneUnit = new Units["RayTracer"](100,100,1);
// game.addObjectAtCoord(oneUnit, 2, 2);
// game.registerGameObject(oneUnit);
//
// game.runSimulation();
//
// debug.log(0, game);

const app = new App();
app.init();

// DISPLAY STUFF

// put board on grid
app.display.stage.grid = app.game.board;
