import p5 from 'p5';
import * as Units from '../shared/Unit.js';

const tempConfig = {
	canvasX: 1000,
	canvasY: 666,
	size: 33.33333
}

export default class Display {

 	constructor(app = undefined, engine = undefined,  stage = new Object) {
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

			let titleFont;
			let bRayTracer;
			let bMaglev;
			let bJuggernode;
			let unitButtons=[];
			let unitsAllowed=1;
			let randX;
			let randY;
			let buttonMaker=1; //So buttons only get created once
			s.preload = () =>{
  			titleFont = s.loadFont('static/volt.ttf');
			}
			s.setup = () =>{
				s.createCanvas(tempConfig.canvasX, tempConfig.canvasY);
				//s.colors=[color(1,100,87,255),color(255,240,0,255),color(128,0,0,255),color(128,128,126,255)];

  			}
    	s.draw = () => {
					let wi=tempConfig.canvasX;
					let he=tempConfig.canvasY;
					let si=tempConfig.size;
					//Randomize the first base placement
    			this.delay=this.delay+.25;
    			s.background(0);
					s.textFont(titleFont);
					s.textSize(tempConfig.canvasX/9);
					s.fill(255,0,128);
    			///Phase 0 is the title screen, phase 1 the unit placement, and phase 2 the game loop
    			if(this.phase==0){

						if(this.app.playerNumber==1 || this.app.playerNumber==2){
							//Randomize the first base placement
							let randX=s.int(s.random(2,12));
						}
						else{
							let randX=s.int(s.random(17,27));
						}
    				titleSequence(tempConfig.canvasX,tempConfig.canvasY,this.delay,tempConfig.size/2);
    				if(s.mouseIsPressed){
    					this.phase=1;
    				}
						s.fill(255,0,128);
						s.text("Close Quarters",tempConfig.canvasX/22,tempConfig.canvasY/2);
						let buttonScale=2;
						let playerShifter=0;
						if(this.app.playerNumber>2){
							playerShifter=wi/2;
						}
						if(buttonMaker===1){
						bRayTracer=new Buttoned(wi/2+si-playerShifter,si*buttonScale,wi/2-si*2,si*buttonScale,"RayTracer",this.app.sendCreateUnit);
            unitButtons.push(bRayTracer);
						bMaglev=new Buttoned(wi/2+si-playerShifter,si*buttonScale*2,wi/2-si*2,si*buttonScale,"Maglev",this.app.sendCreateUnit);
						unitButtons.push(bMaglev);
						bJuggernode=new Buttoned(wi/2+si-playerShifter,si*buttonScale*3,wi/2-si*2,si*buttonScale,"Juggernode",this.app.sendCreateUnit);
						unitButtons.push(bJuggernode);
					}
					buttonMaker=0;
    			}
    			else if(this.phase==1){
    				drawQuarterGrid(this.stage.grid,this.playerColors,this.app.playerNumber);
    				drawUnitMenu(this.playerColors,this.app.playerNumber,this.app)
    				let hoverX=s.int(s.mouseX/tempConfig.size);
    				let hoverY=s.int(s.mouseY/tempConfig.size);

						//CHECK IF THE COORDINATES ARE IN RANGE BASED ON THE PLAYER
						for(let i=0;i<unitButtons.length;i=i+1){
							 unitButtons[i].drawButton();
						 }

						if(s.mouseIsPressed){
						for(let yy=0;yy<unitButtons.length;yy=yy+1){
							debug.log(3,unitButtons[1]);
							if(unitButtons[yy].isPressed==true){
								if(this.app.playerNumber==1 && hoverX<=14 && hoverY<=10){
									if(unitsAllowed>0)	{
										s.fill(255,100);
										s.noStroke();
				    				s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
										unitsAllowed=unitsAllowed-1;
										}
									}
								else if(this.app.playerNumber==2 && hoverX<=14 && hoverY>10){
									if(unitsAllowed>0)	{
										s.fill(255,100);
										s.noStroke();
				    				s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
										unitsAllowed=unitsAllowed-1;
										}
								}
								else if(this.app.playerNumber==3 && hoverX>14 && hoverY<=10){
									if(unitsAllowed>0)	{
										s.fill(255,100);
										s.noStroke();
				    				s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
										unitsAllowed=unitsAllowed-1;
										}
								}
								else if(this.app.playerNumber==4 && hoverX>14 && hoverY>10){
									if(unitsAllowed>0)	{
										s.fill(255,100);
										s.noStroke();
				    				s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text,this.app.playerNumber,hoverX,hoverY);
										unitsAllowed=unitsAllowed-1;
									}
								}
							}

							else{
									for(let zz=0;zz<unitButtons.length;zz=zz+1){
										if(unitButtons[zz].isInRange(s.mouseX,s.mouseY)){
											 //Got to fix this so it retains in the update
											unitButtons[zz].buttonHasBeenPressed();
											debug.log(3,unitButtons[zz]);
										}
										else{
											unitButtons[zz].isPressed=false;
										}
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

				//for(let t=1;t<41;t=t+1){
					if(s.keyIsPressed){
						this.t=this.t+keyPressed();
						}
					if(this.t<41 && this.t>0){
					drawGrid(this.stage.grid,this.playerColors);
					let b = this.board.tick[this.t].board;
					for(var k=0; k<b.length; k=k+1){
						for(var l=0; l<b[k].length; l=l+1){
							if(b[k][l].length != 0){
								for(var m=0; m<b[k][l].length;m=m+1){
									let displayObject=b[k][l][m];
									//console.log(this.board[k][l]);
											if(displayObject.identifier == "Ray"){
												drawRayTracer(l,k,displayObject.player,tempConfig.size,displayObject.health,this.playerColors);
										}
											if(displayObject.identifier == "RayProj"){
												drawRayTracerProjectile(l,k,displayObject.player,tempConfig.size,this.playerColors,displayObject.orientation);
										}
										if(displayObject.identifier == "MagProj"){
												drawMaglevProjectile(l,k,displayObject.player,tempConfig.size,this.playerColors,displayObject.damage);
										}
										if(displayObject.identifier == "Mag"){
												drawMaglev(l,k,displayObject.player,tempConfig.size,displayObject.health,this.playerColors);
										}
										if(displayObject.identifier == "Jug"){
												drawJuggernode(l,k,displayObject.player,tempConfig.size,displayObject.health,this.playerColors);
										}
										if(displayObject.identifier == "JugProj"){
												drawJuggernodeProjectile(l,k,displayObject.player,tempConfig.size,displayObject.health,this.playerColors);
										}
							}
						}
					}
				}
			}
		}
  }


    		//FUNCTIONS BELOW THIS LINE
				class Buttoned {
					constructor(x,y,xlen,ylen,text,func) {
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
					isInRange(x,y){
						if(x<(this.xx+this.xlen) && x>this.xx && y>this.yy && y<(this.yy+this.ylen)){
							return true;
						}
						else{
							return false;
						}
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
    			if(player<3){
      			s.fill(225,225,225,45);
						s.quad(wid/2+siz,siz,wid/2+siz,hei-siz,wid-siz,hei-siz,wid-siz,siz);
      		}
      		else{
      			s.translate(-wid/2,0);
						s.fill(225,225,225,45);
						s.quad(wid/2+siz,siz,wid/2+siz,hei-siz,wid-siz,hei-siz,wid-siz,siz);
      			s.translate(wid/2,0);
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
    						if(player==1){
    							s.rect(rectX, rectY, rectSize, rectSize);
    						}
    					}
    					else if(i>=grid.length/2-1 && j <= grid[i].length/2-1) {
    						s.fill(pColors[1][0],pColors[1][1],pColors[1][2],pColors[1][3])
    						if(player==2){
    							s.rect(rectX, rectY, rectSize, rectSize);
    						}
    					}
    					else if(i<=grid.length/2-1 && j >= grid[i].length/2-1) {
    						s.fill(pColors[2][0],pColors[2][1],pColors[2][2],pColors[2][3])
    						if(player==3){
    							s.rect(rectX, rectY, rectSize, rectSize);
    						}
    					}
    					else if(i>=grid.length/2-1 && j >= grid[i].length/2-1) {
    						s.fill(pColors[3][0],pColors[3][1],pColors[3][2],pColors[3][3])
    						if(player==4){
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
        	function drawRayTracer(x,y,player,size,health,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.fill(0);
        		s.stroke(0);
        		s.fill(0);
        		//console.log(y)
        		s.ellipse(x*size+size/2,y*size+size/2,size,size);

        	}
        	function drawMaglev(x,y,player,size,health,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.fill(0);
        		s.stroke(0);
        		s.fill(0);
        		//console.log(y)
        		for(let i = -6;i < 6;i=i+.2){
        		s.ellipse(x*size+size/2,y*size+size/2+i*size/20,s.abs(i)*size/10,s.abs(i))*size/10;
        	    }
        	}
					function drawJuggernode(x,y,player,size,health,pColors){
        		//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
        		s.fill(0);
        		s.stroke(0);
        		s.fill(0);
        		//console.log(y)

        		s.ellipse(x*size+size/4,y*size+size/4,size/4,size/4);
						s.ellipse(x*size+size/2,y*size+size/4,size/4,size/4);
						s.ellipse(x*size+size/2,y*size+size/2,size/4,size/4);
						s.ellipse(x*size+size/4,y*size+size/2,size/4,size/4);

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
        	function drawRayTracerProjectile(x,y,player,size,pColors,orient){
        		let refx=x*size;
        		let refy=y*size;
        		s.stroke(0)
        		s.strokeWeight(3);
        		if(orient[0]==0){
                	s.line(refx+size/2,refy,refx+size/2,refy+size);
        		}
        		else if(orient[1]==0){
        			s.line(refx,refy+size/2,refx+size,refy+size/2);
        		}
        	}
        	function drawMaglevProjectile(x,y,player,size,pColors,damage){
        		let refx=x*size;
        		let refy=y*size;
        		s.fill(255,255,255,255-(50-damage)*2);
        		s.stroke(0);
                s.rect(refx,refy,size,size);
        	}
					function drawJuggernodeProjectile(x,y,player,size,pColors,damage){
        		let refx=x*size;
        		let refy=y*size;
        		s.fill(255,240,0,105);
        		s.noStroke();
                s.ellipse(refx,refy,size,size);
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
		}

		this.engine = new p5(sketch);

		console.log('Initialized Display');
	}



}
