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
 		this.playerColors =[[255,0,128,255],[176,196,243,255],[152, 255, 152,255],[210,130,240,255]]
	}

	init() {

		let sketch = (s) => {
			s.setup = () =>{
				s.createCanvas(tempConfig.canvasX, tempConfig.canvasY);
				//s.colors=[color(1,100,87,255),color(255,240,0,255),color(128,0,0,255),color(128,128,126,255)];
  			}
    		
    		s.draw = () => {
				s.background(100);

				// if phase where grid should be shown, draw grid
				if(this.phase==2){
				drawGrid(this.stage.grid,this.playerColors);
			}

				if(s.mouseIsPressed){
					//this.phase=1;
					s.fill(0,255);
					s.ellipse(0,0,50,50);
				}
    		}

    		function drawRect(rect) {
    			s.fill(rect.color[0], rect.color[1], rect.color[2]);
    			s.rect(rect.x, rect.y, rect.size, rect.size);
    		}

    		function drawGrid(grid, pColors) {
    			//let team=1;
    			for (var i = 0; i < grid.length; i++) {
    				let rectSize = tempConfig.canvasX / grid[i].length;
    				let rectY = i * (tempConfig.canvasY / grid.length);
    				for (var j = 0; j < grid[i].length; j++) {
    					if(i<grid.length/2-1){
    						s.fill(pColors[0][0],pColors[0][1],pColors[0][2],pColors[0][3])
    						//s.fill(255,255,0,255);
    					}
    					else if(i>grid.length/2-1) {
							s.fill(255,0,0,255);
    					}
    					let rectX = j* tempConfig.canvasY/ grid.length;
    					s.rect(rectX, rectY, rectSize, rectSize);
    				}
        		}
        	function highlightTile(x,y, player) {

        		//Figures out which tile to highlight base on mouse hover and then colors it
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