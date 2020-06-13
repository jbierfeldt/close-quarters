// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';
import * as Units from './lib/shared/Unit.js';

let game = new Game();
game.init();
let dis = new Display();
dis.init();

const ray1 = new Units.RayTracer(100, 75, game.players[1]);
const ray2 = new Units.RayTracer(0, null, game.players[1]);
console.log(ray1, ray2);

// put board on grid

dis.stage.grid = game.board;
//dis.phase = game.gamePhase;
dis.unitList=game.gameUnitList;
dis.board=game.board;


// const P5 = new p5(sketch);

