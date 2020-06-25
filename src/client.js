// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';
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
		this.clientID = undefined;
		this.playerNumber = undefined;
	}

	init() {
		this.game.init();
		this.display.init();
		this.socket = io();

		this.socket.on('debugInfoUpdate', (data) => {
			this.updateDebugInfo();
		});

		this.socket.on('updatePlayerState', (data) => {
			this.clientID = data.clientID;
			this.playerNumber = data.playerNumber;
		})
	}

	makeRayTracer(player,x,y) {
		this.socket.emit('createRay');
		// let oneUnit = new Units.RayTracer(100,100,player);
		// this.game.addObjectAtCoord(oneUnit, x, y);
		// this.game.registerGameObject(oneUnit);
		//debug.log(3,player)
	}

	appRunSimulation() {
		this.game.runSimulation();
		this.display.board = this.loadSerializedGameState(app.game.s_history.turn[this.game.turnNumber-1]);
		debug.log(3,app.game.history);
	}

	loadSerializedGameState(serializedGameState) {
		let tickContainer = this.game.loadSerializedGameState(serializedGameState);
		for (const [key, value] of Object.entries(tickContainer.tick)) {
  			tickContainer.tick[key] = JSON.parse(value);
		}
		return tickContainer;
	}

	updateDebugInfo () {

		const debugData = {
			'clientID': this.clientID,
			'playerNumber': this.playerNumber
		}

		const debugWindow = document.getElementById("debug-info");
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
