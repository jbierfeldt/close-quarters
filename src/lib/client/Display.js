import p5 from 'p5';
import * as Units from '../shared/Unit.js';

const tempConfig = {
	canvasX: 1000,
	canvasY: 666,
	size: 33.33333
}

export default class Display {

 	constructor(app = undefined, engine = undefined, stage = new Object) {
    this.app = app;
 		this.engine = engine;
 		this.stage = stage;
 		this.phase = 0;
 		this.playerColors =[[255,0,128,255],[176,196,243,255],[152, 255, 152,255],[210,130,240,255]];
		this.unitList =[];
		this.delay=0;
		this.board=[[]];
		this.t=1;
	}

	init() {

		let sketch = (s) => {

			//Declarations prior to the draw loop & setup
			let titleFont;

			//Button Declarations
			let bBase;
			let bRayTracer;
			let bMaglev;
			let bJuggernode;
			let bBallast;

			let unitButtons=[]; //List of the Buttons for unit creation
			let randX;
			let randY;
			let buttonMaker=1; //Variable so buttons only get created once

			//Preload the fonts and other assets below
			s.preload = () =>{
  			titleFont = s.loadFont('static/volt.ttf');
			}

			//Create the canvas based on the size of the user window
			s.setup = () =>{
				s.createCanvas(tempConfig.canvasX, tempConfig.canvasY);
			}

			//The draw function loops continuously while the sketch is active
			//Different screens of the game are portioned off using trigger variables and user input to move between them
    	s.draw = () => {

				//The below variables to be filled in by the size of the players current window
				let wi=tempConfig.canvasX; //The width of the canvas
				let he=tempConfig.canvasY; //The height of the canvas
				let si=tempConfig.size; //the side length of each cell in canvas

				//Delay serves as a variable that has a constant increment for animation
    		this.delay=this.delay+.25;

				//Sets the background to black each time around the loop in order to prevent sketch objects from stacking on each other
				s.background(0);

				//Sets the default text font and its size
				s.textFont(titleFont);
				s.textSize(wi/9);

    		//Phase begins at 0 via the constructor of Display(see above)
				//Phase 0 is the Title Sccreen, Phase 1 is Unit Placement, and Phase 2 is the Battle Phase
    		if(this.phase==0){
					//The below function displays the title sequence
					titleSequence(wi,he,this.delay,si/2);

					//Display the game title on top of the title sequence
					s.fill(255,0,128);
					s.text("Close Quarters",tempConfig.canvasX/22,tempConfig.canvasY/2);

					//buttonScale sets the size of the buttons(dependent on their overall number)
					let buttonScale=2;

					//playerShifter shifts the Button Menu if the player is on the right side of the screen
					let playerShifter=0;
					if(this.app.playerNumber>2){
						playerShifter=wi/2;
					}

					//Only execute the following block once so the buttons are only created a single time
					if(buttonMaker===1){
						bBase=new Buttoned(wi/2+si-playerShifter,si*buttonScale*4,wi/2-si*2,si*buttonScale,"Base",this.app.sendCreateBase);
						unitButtons.push(bBase);
						bRayTracer=new Buttoned(wi/2+si-playerShifter,si*buttonScale,wi/2-si*2,si*buttonScale,"RayTracer",this.app.sendCreateUnit);
	          unitButtons.push(bRayTracer);
						bMaglev=new Buttoned(wi/2+si-playerShifter,si*buttonScale*2,wi/2-si*2,si*buttonScale,"Maglev",this.app.sendCreateUnit);
						unitButtons.push(bMaglev);
						bJuggernode=new Buttoned(wi/2+si-playerShifter,si*buttonScale*3,wi/2-si*2,si*buttonScale,"Juggernode",this.app.sendCreateUnit);
						unitButtons.push(bJuggernode);
						bBallast=new Buttoned(wi/2+si-playerShifter,si*buttonScale*5,wi/2-si*2,si*buttonScale,"Ballast",this.app.sendCreateUnit);
						unitButtons.push(bBallast);
					}
					buttonMaker=0;

					//Exit this phase and move to the Battle Phase if the mouse is pressed(button trigger to be added)
					if(s.mouseIsPressed){
						this.phase=1;
					}
    		}

    		else if(this.phase==1){

					//Run the functions for drawing the players quadrant and the unit menu
    			drawQuarterGrid(this.stage.grid,this.playerColors,this.app.playerNumber);


					//Calculate which cell the mouse is currently hovering over and highlight it
    			let hoverX=s.int(s.mouseX/si);
    			let hoverY=s.int(s.mouseY/si);

					s.fill(255,100);
				 	s.noStroke();
				 	s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);

						//CHECK IF THE COORDINATES ARE IN RANGE BASED ON THE PLAYER
						drawUnitMenu(this.playerColors,this.app.playerNumber,this.app)
						//unitButtons[0].drawButton();
						//add base logic

						for(let i=0;i<unitButtons.length;i=i+1){
							 unitButtons[i].drawButton();
						 }

						if(s.mouseIsPressed){
							let newButtonPressed=-1;
							for(let i=0;i<unitButtons.length;i=i+1){
								if(unitButtons[i].isInRange(s.mouseX,s.mouseY)){
									unitButtons[i].buttonHasBeenPressed();
									newButtonPressed=i;
								}
							}
							if(newButtonPressed >=0){
							for(let j=0;j<unitButtons.length;j=j+1){
								if(j!=newButtonPressed){
									unitButtons[j].isPressed=false;
								}
							}
						}
							for(let yy=0;yy<unitButtons.length;yy=yy+1){

								if(unitButtons[yy].isPressed===true){
									if(this.app.playerNumber==1 && hoverX<=14 && hoverY<=10){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
									}
								else if(this.app.playerNumber==2 && hoverX<=14 && hoverY>10){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
								}
								else if(this.app.playerNumber==3 && hoverX>14 && hoverY<=10){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
								}
								else if(this.app.playerNumber==4 && hoverX>14 && hoverY>10){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text,this.app.playerNumber,hoverX,hoverY);
								}
							}
						 }
				   	}
						//Buttons Section
    				if(s.keyIsPressed){
    					this.phase=2;
    					this.t=1;
							// this.app.appRunSimulation()
    				}
    			}
				// if phase where grid should be shown, draw grid
				else if(this.phase==2){

				/*	if(s.keyIsPressed){
						this.t=this.t+keyPressed();
					}*/
					this.t=this.t+1;
					if(this.t<41 && this.t>0){
						for(let animate = 0; animate <= 9; animate = animate + .5){
						drawGrid(this.stage.grid,this.playerColors);
						let b = this.simulationDisplayTurn.tick[this.t].board;
						for(var k=0; k<b.length; k=k+1){
							for(var l=0; l<b[k].length; l=l+1){
								if(b[k][l].length != 0){
									for(var m=0; m<b[k][l].length;m=m+1){
										let displayObject = this.simulationDisplayTurn.tick[this.t].gameObjects.get(b[k][l][m]);

											drawDisplayObject(displayObject,l,k,tempConfig.size,this.playerColors,animate);

									}
								}
							}
						}
					}
				}
				else{
					this.phase=1;
				}
			}
  	}



    		//FUNCTIONS BELOW THIS LINE
				class Buttoned {
					constructor(x, y, xlen, ylen, text, func) {
					 this.isPressed=false;
					 this.xx=x;
					 this.yy=y;
					 this.text=text;
					 this.xlen=xlen;
					 this.ylen=ylen;
					 this.func=func;
					}
					drawButton(){
						 s.noStroke();
						 //s.fill(255,0,128,255);
						 //console.log(3,this.isPressed);
						 s.fill(255,0,0+this.yy/2,255);
						 s.rect(this.xx,this.yy,this.xlen,this.ylen);
						 if(this.isPressed==true){
							 s.fill(255,255,255,100);
							 s.rect(this.xx,this.yy,this.xlen,this.ylen);
						 }
						 s.fill(0);
						 s.textSize(this.xlen/8);
						 s.text(this.text,this.xx+this.xlen/10,this.yy+this.ylen/1.25);
					}
					buttonHasBeenPressed(){
						this.isPressed=true;
					}
					isInRange(x, y){
						if(x < (this.xx+this.xlen) && x > this.xx && y > this.yy && y < (this.yy+this.ylen)){
							return true;
						}
						else{
							return false;
						}
					}
				}

				function drawDisplayObject(displayObject, x, y, size, colors, a) {
				  //	s.fill(255,0,128,255);
					//s.stroke(0);
					//s.rect(x*size,y*size,size,size);

					if(displayObject.identifier == "Base"){
							drawBase(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
					}
					if(displayObject.identifier == "Ray"){
							drawRayTracer(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
					}
					if(displayObject.identifier == "Mag"){
							drawMaglev(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
					}
					if(displayObject.identifier == "Jug"){
							drawJuggernode(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
					}
					if(displayObject.identifier == "Bal"){
							drawBallast(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
					}
					if(displayObject.identifier == "JugProj"){
							drawJuggernodeProjectile(x,y,displayObject.player,size,displayObject.health,colors, a);
					}
					if(displayObject.identifier == "RayProj"){
						drawRayTracerProjectile(x,y,displayObject.player,size,colors,displayObject.orientation, a);
					}
					if(displayObject.identifier == "MagProj"){
						drawMaglevProjectile(x,y,displayObject.player,size,colors,displayObject.damage, a);
					}
					if(displayObject.identifier == "BalProj"){
						drawBallastProjectile(x,y,displayObject.player,size,colors,displayObject.damage, a);
					}
				}


    		function drawRect(rect) {
    			s.fill(rect.color[0], rect.color[1], rect.color[2]);
    			s.rect(rect.x, rect.y, rect.size, rect.size);
    		}

    		function drawUnitMenu(pColors, player, apple){
    			let wid=tempConfig.canvasX;
    			let hei=tempConfig.canvasY;
					let siz =tempConfig.size;
    			s.strokeWeight(2);
    			s.stroke(255);
    			if(player < 3){
      			s.fill(225,225,225,45);
						s.quad(wid/2+siz,siz,wid/2+siz,hei-siz,wid-siz,hei-siz,wid-siz,siz);
      		}
      		else{
      			s.translate(-wid/2, 0);
						s.fill(225, 225, 225, 45);
						s.quad(wid/2+siz,siz,wid/2+siz,hei-siz,wid-siz,hei-siz,wid-siz,siz);
      			s.translate(wid/2, 0);
      		}
      // text("Unit",22*this.wid/40,3*this.hei/40);
      //text("Report",28*this.wid/40,3*this.hei/40);
      //text("H",36*this.wid/40,3*this.hei/40);
      //text("C",38.5*this.wid/40,3*this.hei/40);
    		}
    		function drawQuarterGrid(grid, pColors, player) {
    			s.stroke(0);
    			s.strokeWeight(2);

    			for (var i = 0; i < grid.length; i++) {
    				let rectSize = tempConfig.canvasX / grid[i].length;
    				let rectY = i * (tempConfig.canvasY / grid.length);
    				for (var j = 0; j < grid[i].length; j++) {
    					let rectX = j* tempConfig.canvasY/ grid.length;
    					if(i<=grid.length/2-1 && j <= grid[i].length/2-1){
    						s.fill(pColors[0][0],pColors[0][1],pColors[0][2],pColors[0][3])
    						if(player == 1){
    							s.rect(rectX, rectY, rectSize, rectSize);
    						}
    					}
    					else if(i >= grid.length/2-1 && j <= grid[i].length/2-1) {
    						s.fill(pColors[1][0],pColors[1][1],pColors[1][2],pColors[1][3])
    						if(player == 2){
    							s.rect(rectX, rectY, rectSize, rectSize);
    						}
    					}
    					else if(i <= grid.length/2-1 && j >= grid[i].length/2-1) {
    						s.fill(pColors[2][0],pColors[2][1],pColors[2][2],pColors[2][3])
    						if(player == 3){
    							s.rect(rectX, rectY, rectSize, rectSize);
    						}
    					}
    					else if(i >= grid.length/2-1 && j >= grid[i].length/2-1) {
    						s.fill(pColors[3][0],pColors[3][1],pColors[3][2],pColors[3][3])
    						if(player == 4){
    							s.rect(rectX, rectY, rectSize, rectSize);
    						}
    					}
    				}
        		}

    		}
    		function drawGrid(grid, pColors) {
    			//let team=1;
    			s.stroke(0);
    			s.strokeWeight(2);
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
    		}
    		function highlightTile(x,y, player) {
    			s.noStroke();
    			s.fill(100,100,100,100);
    			s.rect(x*size-size/2,y*size-size/2,size,size);
        		//Figures out which tile to highlight base on mouse hover and then colors it
        	}

					function drawBase(x,y,player,size,health,max,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
						//x,y,radius,npoints
        		s.fill(0);
        		s.stroke(0);
        		s.fill(255*(max-health));
						let offset=size/8;
        		//console.log(y)
						for(let row = x*size+offset; row < (x*size+size); row = row + offset*2){
							for(let col = y*size+offset; col < (y*size+size); col = col + offset*2){
							 polygon(row,col,offset,8);
							}
						}
					}

        	function drawRayTracer(x,y,player,size,health,max,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.fill(0);
        		s.stroke(0);
        		s.fill(255*(max-health));
        		//console.log(y)
        		s.ellipse(x*size+size/2,y*size+size/2,size,size);

        	}
        	function drawMaglev(x,y,player,size,health,max,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.fill(0);
        		s.stroke(0);
        		s.fill(255*(max-health));
        		//console.log(y)
        		for(let i = -6;i < 6;i=i+.2){
        		s.ellipse(x*size+size/2,y*size+size/2+i*size/20,s.abs(i)*size/10,s.abs(i))*size/10;
        	    }
        	}
					function drawJuggernode(x,y,player,size,health,max,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.fill(0);
        		s.stroke(0);
        		s.fill(255*(max-health));
        		//console.log(y)
        		s.ellipse(x*size+size/4,y*size+size/4,size/4,size/4);
						s.ellipse(x*size+size/2,y*size+size/4,size/4,size/4);
						s.ellipse(x*size+size/2,y*size+size/2,size/4,size/4);
						s.ellipse(x*size+size/4,y*size+size/2,size/4,size/4);

        	}

					function drawBallast(x,y,player,size,health,max,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.fill(0);
        		s.stroke(0);
        		s.fill(255*(max-health));
        		//console.log(y)
						s.ellipse(x*size+size/2,y*size+3*size/4,size*.9,size*.2);
						s.beginShape();
						s.vertex(x*size+2*size/3,y*size+3*size/4);
						s.vertex(x*size+3*size/4,y*size+size/2);
						s.vertex(x*size+size/2,y*size+size/8);
						s.vertex(x*size+size/4,y*size+size/2);
						s.vertex(x*size+size/3,y*size+3*size/4);
						s.endShape();

        	}

        	function titleSequence(width,height,delay,scale){
        		s.background(0);
        		s.translate(width/2,height/2);
   				  s.noStroke();
   					s.noFill();
   					s.stroke(176,196,243,255);
   					if(delay<200){
   						for(var i=0; i<delay; i=i+1){
   							s.quad(-width/2+i*scale,-height/2+i*scale,-width/2+i*scale,height/2-i*scale,width/2-i*scale,height/2-i*scale,width/2-i*scale,-height/2+i*scale);
   						}
   					}
   					else{
   						for(var i=0; i<200; i=i+1){
   							s.quad(-width/2+i*scale,-height/2+i*scale,-width/2+i*scale,height/2-i*scale,width/2-i*scale,height/2-i*scale,width/2-i*scale,-height/2+i*scale);
   						}
   					}

   					for(var angle=delay*3;angle<delay*3+360;angle=angle+30){
    				let titleX=(height/3+90*s.cos(3.14*s.radians(delay)))*s.cos(s.radians(angle))-0;
    				let titleY=(height/3+2*s.tan(3.14*s.radians(delay/20)))*s.sin(s.radians(angle))+0;
						s.fill(152, 255, 152,255);
    				s.ellipse(titleX,titleY,height/15,height/15);
						s.fill(152, 255, 152,25);
    				s.ellipse(titleX,titleY,height/14,height/14);
						s.fill(152, 255, 152,20);
    				s.ellipse(titleX,titleY,height/13,height/13);
   					}
						s.translate(-width/2,-height/2);
        	}
        	function drawRayTracerProjectile(x,y,player,size,pColors,orient, a){
        		let refx=x*size;
        		let refy=y*size;
        		s.stroke(0)
        		s.strokeWeight(3);
        		if(orient[0]==0){
            	//s.line(refx+size/2,refy+a*size/10,refx+size/2,refy+(a+1)*size/10);
							s.fill(255, 0, 128, 255);
							s.strokeWeight(1);
							s.ellipse(refx+size/2,refy+(a+1)*size/10,size/4,size/4);
        		}
        		else if(orient[1]==0){
        			//s.line(refx+a*size/10,refy+size/2,refx+(a+1)*size/10,refy+size/2);
							s.fill(255, 0, 128, 255);
							s.strokeWeight(1);
							s.ellipse(refx+(a+1)*size/10,refy+size/2,size/4,size/4);
        		}
        	}
        	function drawMaglevProjectile(x,y,player,size,pColors,damage, a){
        		let refx=x*size;
        		let refy=y*size;
        		s.fill(255,255,255,255-(50-damage)*2);
        		s.stroke(0);
                s.rect(refx,refy,size,size);
        	}
					function drawJuggernodeProjectile(x,y,player,size,pColors,damage, a){
        		let refx=x*size;
        		let refy=y*size;
        		s.fill(255,240,0,105);
        		s.noStroke();
                s.ellipse(refx,refy,size,size);
        	}
					function drawBallastProjectile(x,y,player,size,pColors,damage, a){
        		let refx=x*size;
        		let refy=y*size;
        		s.fill(255,0,128,185);
        		s.noStroke();
            s.rect(refx,refy,size,size);
        	}
        	function keyPressed() {
	  				if (s.keyCode === s.LEFT_ARROW) {
	    				return -1;
	  				} else if (s.keyCode === s.RIGHT_ARROW) {
	    				return 1;
	  				}
	  				else{
	  					return 0;
	  				}
	  				return false;
					}
					function polygon(x, y, radius, npoints) {
					  let angle = Math.PI*2 / npoints;
					  s.beginShape();
					  for (let a = 0; a < Math.PI*2; a += angle) {
					    let sx = x + s.cos(a) * radius;
					    let sy = y + s.sin(a) * radius;
					    s.vertex(sx, sy);
					  }
					  s.endShape();
					}
		}

		this.engine = new p5(sketch);

		console.log('Initialized Display');
	}



}
