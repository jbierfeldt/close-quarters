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
}

const app = new App();
app.init();

debug.log(2, app);

const ray1 = new Units.RayTracer(100, 75, app.game.players[1]);
const ray2 = new Units.RayTracer(0, null, app.game.players[1]);

// turn 1 begins

app.game.addObjectAtCoord(ray1, 2, 2);
app.game.registerGameObject(ray1);

app.game.runSimulation();

// turn 2 beings

app.game.addObjectAtCoord(ray2, 3, 6);
app.game.registerGameObject(ray2);

app.game.runSimulation();

// log history for turns 1 and 2

debug.log(0, app.game.history);




// DISPLAY STUFF

// put board on grid

dis.stage.grid = game.board;
//dis.phase = game.gamePhase;
dis.unitList=game.gameUnitList;
dis.board=game.board;


// const P5 = new p5(sketch);

