// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';
import {DEBUG} from './lib/shared/utilities.js';

window.debug = new DEBUG(true, 1);

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
		this.turnNumber = undefined;
		this.clientID = undefined;
		this.playerNumber = undefined;
	}

	init() {
		this.game.init();
		this.display.init();
		this.socket = io();

		this.socket.on('debugInfoUpdate', (data) => {
			console.log('update debug');
			this.updateDebugInfo();
		});

		this.socket.on('updateGameState', (data) => {
			console.log('got game state from server');
			this.updateGameState(data);
		});

		this.socket.on('updatePlayerState', (data) => {
			this.clientID = data.clientID;
			this.playerNumber = data.playerNumber;
			debug.log(3, 'updating PlayerState');
		});
	}

	makeRayTracer(player,x,y) {
		this.socket.emit('createRay', {
			player: player,
			x: x,
			y: y
		});
	}

	loadSerializedGameState(serializedGameState) {
		let tickContainer = this.game.loadSerializedGameState(serializedGameState);
		for (const [key, value] of Object.entries(tickContainer.tick)) {
  			tickContainer.tick[key] = JSON.parse(value);
		}
		return tickContainer;
	}

	updateGameState (data) {
		this.turnNumber = data.turnNumber;
		console.log("updateGamestate", this.turnNumber, data.s_history);
		this.display.board = this.loadSerializedGameState(data.s_history.turn[this.turnNumber - 1]);
		debug.log(1, "updated Game State");

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

const app = new App();
app.init();

// const ray1 = new Units.RayTracer(100, 75, 1);
// const ray2 = new Units.RayTracer(0, 0, 1);
// const mag1 = new Units.Maglev(10, 10, 1);


// turn 1 begins

// app.game.addObjectAtCoord(ray1, 2, 2);
// app.game.registerGameObject(ray1);

// app.game.runSimulation();

// // turn 2 beings

// app.game.addObjectAtCoord(ray2, 3, 6);
// app.game.registerGameObject(ray2);

// app.game.addObjectAtCoord(mag1, 10, 10);
// app.game.registerGameObject(mag1);


// app.game.runSimulation();


// log history for turns 1 and 2



// DISPLAY STUFF

// put board on grid
app.display.stage.grid = app.game.board;
//dis.phase = game.gamePhase;
app.display.unitList = app.game.gameUnitList;
// app.display.board = app.game.loadSerializedGameState(app.game.s_history.turn[1]);


// const P5 = new p5(sketch);
