// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';
import {DEBUG} from './lib/shared/utilities.js';



window.debug = new DEBUG(true, 2);


class App {

	constructor(game = new Game(), display = new Display(this)) {
		this.game = game;
		this.display = display;
	}

	init() {
		this.game.init();
		this.display.init();
	}

	makeRayTracer() {

	}

}

const app = new App();
app.init();

const ray1 = new Units.RayTracer(100, 75, 1);
const ray2 = new Units.RayTracer(0, 0, 1);
const ray3 = new Units.RayTracer(0, 0, 2);


// turn 1 begins

app.game.addObjectAtCoord(ray1, 2, 2);
app.game.registerGameObject(ray1);

app.game.runSimulation();

// turn 2 beings

app.game.addObjectAtCoord(ray2, 3, 6);
app.game.registerGameObject(ray2);


app.game.runSimulation();

// debug.log(2, ray1.serialize());


// log history for turns 1 and 2

// debug.log(2, app.game.history);
// debug.log(2, app.game.s_history);
// debug.log(2, app.game.s_history.turn[1]);
// debug.log(2, app.game.loadSerializedGameState(app.game.s_history.turn[2]));



// DISPLAY STUFF

// put board on grid
app.display.stage.grid = app.game.board;
//dis.phase = game.gamePhase;
app.display.unitList = app.game.gameUnitList;
app.display.board = app.game.loadSerializedGameState(app.game.s_history.turn[1]);


// const P5 = new p5(sketch);

