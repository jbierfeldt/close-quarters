// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';
import {DEBUG} from './lib/shared/utilities.js';

window.debug = new DEBUG(true, 0);

let game = new Game();
game.init();
let dis = new Display();
dis.init();

const ray1 = new Units.RayTracer(100, 75, game.players[1]);
const ray2 = new Units.RayTracer(0, null, game.players[1]);

// turn 1 begins

game.addObjectAtCoord(ray1, 2, 2);
game.registerGameObject(ray1);

game.runSimulation();

// turn 2 beings

game.addObjectAtCoord(ray2, 3, 6);
game.registerGameObject(ray2);

game.runSimulation();

// log history for turns 1 and 2

debug.log(0, game.history);




// DISPLAY STUFF

// put board on grid

dis.stage.grid = game.board;
//dis.phase = game.gamePhase;
dis.unitList=game.gameUnitList;
dis.board=game.board;


// const P5 = new p5(sketch);

