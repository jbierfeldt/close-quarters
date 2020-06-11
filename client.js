// import p5 from 'p5';
import Game from './lib/shared/Game.js';
import Display from './lib/client/Display.js';

let game = new Game();
game.init();
let dis = new Display();
dis.init();

dis.stage = {
		'rects': [
		{
			x: 10,
			y: 10,
			size: 100,
			color: [0, 255, 0]
		},
		{
			x: 50,
			y: 50,
			size: 125,
			color: [255, 255, 0]
		},
		{
			x: 100,
			y: 100,
			size: 300,
			color: [0, 255, 255]
		}
	]
};

// put board on grid

dis.stage.grid = game.board;
//dis.phase = game.gamePhase;
dis.unitList=game.gameUnitList;
dis.board=game.board;


// const P5 = new p5(sketch);

