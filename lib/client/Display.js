import p5 from 'p5';

const tempConfig = {
	canvasX: 1000,
	canvasY: 666
}

export default class Display {

 	constructor(engine = undefined,  stage = new Object) {
 		this.engine = engine;
 		this.stage = stage;
 		this.phase = 0;
	}

	init() {

		let sketch = (s) => {
			s.setup = () =>{
				s.createCanvas(tempConfig.canvasX, tempConfig.canvasY);
    		}
    		s.draw = () => {
				s.background(100);

				// if phase where grid should be shown, draw grid
				drawGrid(this.stage.grid);

				if(s.mouseIsPressed){
					this.phase=1;
					s.fill(0,255);
					s.ellipse(0,0,50,50);
				}
    		}

    		function drawRect(rect) {
    			s.fill(rect.color[0], rect.color[1], rect.color[2]);
    			s.rect(rect.x, rect.y, rect.size, rect.size);
    		}

    		function drawGrid(grid) {
    			for (var i = 0; i < grid.length; i++) {
    				let rectSize = tempConfig.canvasX / grid[i].length;
    				let rectY = i * (tempConfig.canvasY / grid.length);
    				for (var j = 0; j < grid[i].length; j++) {
    					let rectX = j* tempConfig.canvasY/ grid.length;
    					s.rect(rectX, rectY, rectSize, rectSize);
    				}
        		}

      	// 		for (var _i = 0; _i < this.r / 2 + 1; _i = _i + 1) {
       //  			line(_i * this.rowStep, 0, _i * this.rowStep, this.c / 2 * this.colStep);
      	// 		}
    		}

		}

		this.engine = new p5(sketch);

		console.log('Initialized Display');
	}

	

}