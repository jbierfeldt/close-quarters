import p5 from 'p5';

const tempConfig = {
	canvasX: 1000,
	canvasY: 666,
	size: 33.33333
}

export default class Display {

 	constructor(engine = undefined,  stage = new Object) {
 		this.engine = engine;
 		this.stage = stage;
 		this.phase = 0;
 		this.playerColors =[[255,0,128,255],[176,196,243,255],[152, 255, 152,255],[210,130,240,255]];
		this.unitList =[];
		this.delay=0;
		this.board=[[]];
	}

	init() {

		let sketch = (s) => {
			s.setup = () =>{
				s.createCanvas(tempConfig.canvasX, tempConfig.canvasY);
				//s.colors=[color(1,100,87,255),color(255,240,0,255),color(128,0,0,255),color(128,128,126,255)];
  			}
    		
    		s.draw = () => {
    			this.delay=this.delay+1;
				s.background(100);

				// if phase where grid should be shown, draw grid
				if(this.phase==2){
				drawGrid(this.stage.grid,this.playerColors);
			}
			for(var k=0; k<this.board.length; k=k+1){
				for(var l=0; l<this.board[k].length; l=l+1){
					
					if(this.board[k][l] != 0){
						//console.log(this.board[k][l]);
						if(this.board[k][l].identifier="Ray"){
					drawRayTracer(k,l,this.board[k][l].player,tempConfig.size,this.board[k][l].health,this.playerColors);
				}
			}
			}
			}
			
			for(var i=0; i<this.unitList.length;i=i+1){
				//background(255*cos(radians(this.delay))
				//console.log(this.delay);
				if(this.unitList[i].identifier="Ray"){
				//	drawRayTracer(this.unitList[i].x,this.unitList[i].y,this.unitList[i].player,tempConfig.size,this.unitList[i].health,this.playerColors);
				}
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
    					if(i<=grid.length/2-1 && j < grid[i].length/2-1){
    						s.fill(pColors[0][0],pColors[0][1],pColors[0][2],pColors[0][3])
    						//s.fill(255,255,0,255);
    					}
    					else if(i>=grid.length/2-1 && j < grid[i].length/2-1) {
    						s.fill(pColors[1][0],pColors[1][1],pColors[1][2],pColors[1][3])
    					}
    					else if(i<=grid.length/2-1 && j > grid[i].length/2-1) {
    						s.fill(pColors[2][0],pColors[2][1],pColors[2][2],pColors[2][3])
    					}
    					else if(i>=grid.length/2-1 && j > grid[i].length/2-1) {
    						s.fill(pColors[3][0],pColors[3][1],pColors[3][2],pColors[3][3])
    					}
    					let rectX = j* tempConfig.canvasY/ grid.length;
    					s.rect(rectX, rectY, rectSize, rectSize);
    				}
        		}
        	
        	

      	// 		for (var _i = 0; _i < this.r / 2 + 1; _i = _i + 1) {
       //  			line(_i * this.rowStep, 0, _i * this.rowStep, this.c / 2 * this.colStep);
      	// 		}
    		}
    		function highlightTile(x,y, player) {
    			s.noStroke();
    			s.fill(100,100,100,100);
    			s.rect(x*size-size/2,y*size-size/2,size,size);
        		//Figures out which tile to highlight base on mouse hover and then colors it
        	}
        	function drawRayTracer(x,y,player,size,health,pColors){
        		s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.stroke(0);
        		s.fill(0);
        		//console.log(y)
        		s.ellipse(x*size-size/2,y*size-size/2,size,size);

        	}

		}

		this.engine = new p5(sketch);

		console.log('Initialized Display');
	}

	

}