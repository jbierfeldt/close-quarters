import p5 from 'p5';
import * as Units from '../shared/Unit.js';
import * as Projectiles from '../shared/Projectile.js';

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
			let standardFont;
			let animate = 0; //use to decide when a new tick value occurs
			let buttonScale;
			let playerShifter;
			let gameStart;

			//Button Declarations
			let bBase;
			let bRayTracer;
			let bMaglev;
			let bJuggernode;
			let bBallast;
			let bCircuitBreaker;
			let bOscillator;
			let bIntegrator;

			let bSubmit;

			let counter;

			let unitButtons=[]; //List of the Buttons for unit creation
			let buttonMaker=1; //Variable so buttons only get created once
			let hoverX;
			let hoverY;

			let img;
			let imgTwo;
			let imgThree;
			let imgFour;

			let b;

			let hoverObject;

			p5.disableFriendlyErrors = true;
			//Preload the fonts and other assets below
			s.preload = () =>{
				titleFont = s.loadFont('static/volt.ttf');
				standardFont = s.loadFont('static/ISB.ttf');
				img = s.loadImage('static/CCBolt.png');
				imgTwo = s.loadImage('static/CBoard3.png');
				imgThree = s.loadImage('static/wallpaper1.png');
				imgFour = s.loadImage('static/glassCopy.jpg');
			}

			//Create the canvas based on the size of the user window
			s.setup = () =>{
				s.createCanvas(tempConfig.canvasX, tempConfig.canvasY);
				s.frameRate(60);
			}

			//The draw function loops continuously while the sketch is active
			//Different screens of the game are portioned off using trigger variables and user input to move between them
			s.draw = () => {
				s.cursor(s.CROSS);
				//The below variables to be filled in by the size of the players current window
				let wi=tempConfig.canvasX; //The width of the canvas
				let he=tempConfig.canvasY; //The height of the canvas
				let si=tempConfig.size; //the side length of each cell in canvas

				//Delay serves as a variable that has a constant increment for animation
				this.delay=this.delay+.19;

				//Sets the background to black each time around the loop in order to prevent sketch objects from stacking on each other
				s.background(0);

				//Sets the default text font and its size
				s.textFont(titleFont);
				s.textSize(wi/9);

				//Phase begins at 0 via the constructor of Display(see above)
				//Phase 0 is the Title Sccreen, Phase 1 is Unit Placement, and Phase 2 is the Battle Phase
				if(this.app.gamePhase==0){
					gameStart=0;

					//The below function displays the title sequence
					// Add bar magnet field lines

					titleSequence(wi,he,this.delay,si/2);

					//Display the game title on top of the title sequence

					if(this.delay>25){
						s.stroke(0,(this.delay-25)*2.9);
						s.fill(255,0,128,(this.delay-25)*2.9);
					}
					else{
						s.noFill();
						s.noStroke();
					}
					if((this.delay-25)*2.9>200){
						s.fill(255,0,128,201);
					}

					s.strokeWeight(4);
					s.text("Close",tempConfig.canvasX/3.05,tempConfig.canvasY/2.4);
					s.text("Quarters",tempConfig.canvasX/4.45,tempConfig.canvasY/1.6);

					//buttonScale sets the size of the buttons(dependent on their overall number)
					buttonScale=1.5;

					//playerShifter shifts the Button Menu if the player is on the right side of the screen
					playerShifter=0;
					if(this.app.playerNumber>2){
						playerShifter=wi/2;
					}

					//Only execute the following block once so the buttons are only created a single time
					if(buttonMaker===1){
						bSubmit = new Buttoned(wi/3.03, he/1.85,si*5,si*1.1,"Submit Turn",this.app.sendSubmitTurn);

						bBase=new Buttoned(wi/2+si-playerShifter,si*buttonScale*2,wi/2-si*2,si*buttonScale*3,"Base",this.app.sendCreateBase);
						//Unit Buttons Below
						bRayTracer=new Buttoned(wi/2+si-playerShifter,si*buttonScale*2,wi/2-si*2,si*buttonScale,"RayTracer",this.app.sendCreateUnit);
						unitButtons.push(bRayTracer);
						bBallast=new Buttoned(wi/2+si-playerShifter,si*buttonScale*4,wi/2-si*2,si*buttonScale,"Ballast",this.app.sendCreateUnit);
						unitButtons.push(bBallast);
						bJuggernode=new Buttoned(wi/2+si-playerShifter,si*buttonScale*5,wi/2-si*2,si*buttonScale,"Juggernode",this.app.sendCreateUnit);
						unitButtons.push(bJuggernode);
						bMaglev=new Buttoned(wi/2+si-playerShifter,si*buttonScale*6,wi/2-si*2,si*buttonScale,"Maglev",this.app.sendCreateUnit);
						unitButtons.push(bMaglev);
						bCircuitBreaker=new Buttoned(wi/2+si-playerShifter,si*buttonScale*7,wi/2-si*2,si*buttonScale,"CircuitBreaker",this.app.sendCreateUnit);
						unitButtons.push(bCircuitBreaker);
						bIntegrator=new Buttoned(wi/2+si-playerShifter,si*buttonScale*8,wi/2-si*2,si*buttonScale,"Integrator",this.app.sendCreateUnit);
						unitButtons.push(bIntegrator);
						bOscillator=new Buttoned(wi/2+si-playerShifter,si*buttonScale*3,wi/2-si*2,si*buttonScale,"Oscillator",this.app.sendCreateUnit);
						unitButtons.push(bOscillator);

					}
					buttonMaker=0;

					//Exit this phase and move to the Battle Phase if the mouse is pressed(button trigger to be added)

				}

				else if(this.app.gamePhase==1){

					s.image(imgTwo,0,0,he*1.6,he);
					s.background(0,190);
					this.t=1;
					animate=0;
					if(this.app.playerNumber == 2){
						s.translate(0,-he/2);
					}
					else if(this.app.playerNumber == 3){
						s.translate(wi/2,0);
					}
					else if(this.app.playerNumber == 4){
						s.translate(wi/2,-he/2);
					}
					s.textSize(wi/40);
					//Here is where we put the submit turn button and also do a yes/no Check
					if(gameStart === 1){
						bSubmit.drawButton();

						if(bSubmit.confirmed === false){
					 		s.fill(255);
					 		s.stroke(0);
							s.text("Submit Turn", wi/2.97, he/1.72);
							counter=0;
						}
						else{
							s.fill(this.playerColors[this.app.playerNumber-1][0], this.playerColors[this.app.playerNumber-1][1], this.playerColors[this.app.playerNumber-1][2], this.playerColors[this.app.playerNumber-1][3]);
							s.stroke(0);
							s.text("Confirm", wi/2.78, he/1.72);
							counter=counter+1;
						}
						if(s.mouseIsPressed){
							if(bSubmit.isInRange(s.mouseX,s.mouseY)){
								bSubmit.buttonHasBeenPressed();
								if(bSubmit.isPressed === true && bSubmit.confirmed === false){
									bSubmit.confirmation();
								}
								else if(bSubmit.isPressed === true && bSubmit.confirmed === true && counter > 40){
									bSubmit.isPressed = false;
									bSubmit.func.call(this.app);
								}
							}
						}
					}


					s.fill(255);
					s.stroke(0);
					s.strokeWeight(1);
					s.text("Credits: " + this.app.game.players[this.app.playerNumber-1].credits, wi/2.9, he/1.52);
					for(let a = 0; a < 4; a = a + 1){
						s.fill(this.playerColors[a][0], this.playerColors[a][1], this.playerColors[a][2], this.playerColors[a][3]);
						s.text("Player " + (a+1) + " Score: " + this.app.game.players[a].score, wi/25, he/1.75+a*si);
					}
					if(this.app.playerNumber == 2){
						s.translate(-0,he/2);
					}
					else if(this.app.playerNumber == 3){
						s.translate(-wi/2,0);
					}
					else if(this.app.playerNumber == 4){
						s.translate(-wi/2,he/2);
					}
					//Run the functions for drawing the players quadrant and the unit menu
					drawQuarterGrid(this.stage.grid,this.playerColors,this.app.playerNumber);
					//drawGrid(wi, he, si, this.playerColors);
					let board = this.app.game.board;
					for(var k=0; k<board.length; k=k+1){
						for(var l=0; l<board[k].length; l=l+1){
							//drawTile(l, k, si, this.playerColors, wi, he);
							if(board[k][l].length != 0){
								for(var m=0; m<board[k][l].length;m=m+1){
									let displayObject = this.app.game.gameObjects.get(board[k][l][m]);
									if(displayObject !== undefined){
										if(displayObject.player == this.app.playerNumber){
											drawDisplayObject(displayObject, l, k,tempConfig.size, this.playerColors, animate);
										}
									}
								}
							}
						}
					}


					//Calculate which cell the mouse is currently hovering over and highlight it
					hoverX=s.int(s.mouseX/si);
					hoverY=s.int(s.mouseY/si);

					s.fill(255,100);
					s.noStroke();
					if(this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20){
						s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
					}
					else if(this.app.playerNumber == 2 && hoverX<=14 && hoverY >= 10 && hoverX < 30 && hoverY < 20){
						s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
					}
					else if(this.app.playerNumber == 3 && hoverX>14 && hoverY < 10 && hoverX < 30 && hoverY < 20){
						s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
					}
					else if(this.app.playerNumber == 4 && hoverX>14 && hoverY >= 10 && hoverX < 30 && hoverY < 20){
						s.rect(hoverX*tempConfig.size,hoverY*tempConfig.size,tempConfig.size,tempConfig.size);
					}

					if(this.app.game.players[this.app.playerNumber-1].baseCount < 2 && gameStart == 0){
						bBase.drawButton();
						s.fill(255);
						s.stroke(0);
						s.textSize(wi/26.5);
						s.text("Place Second Base", wi/2+si*2-playerShifter,si*buttonScale*3.7);
						if(s.mouseIsPressed){
							if(bBase.isInRange(s.mouseX,s.mouseY)){
								bBase.buttonHasBeenPressed();
							}
							if(bBase.isPressed===true){
								if(this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20){
									bBase.func.call(this.app, bBase.text, this.app.playerNumber, hoverX, hoverY);
									bBase.isPressed=false;
								}
								else if(this.app.playerNumber == 2 && hoverX<=14 && hoverY >= 10 && hoverX < 30 && hoverY < 20){
									bBase.func.call(this.app, bBase.text, this.app.playerNumber,hoverX,hoverY);
									bBase.isPressed=false;
								}
								else if(this.app.playerNumber == 3 && hoverX>14 && hoverY < 10 && hoverX < 30 && hoverY < 20){
									bBase.func.call(this.app, bBase.text, this.app.playerNumber,hoverX,hoverY);
									bBase.isPressed=false;
								}
								else if(this.app.playerNumber == 4 && hoverX>14 && hoverY >= 10 && hoverX < 30 && hoverY < 20){
									bBase.func.call(this.app, bBase.text, this.app.playerNumber,hoverX,hoverY);
									bBase.isPressed=false;
								}
							}
						}
					}
					else{
						gameStart=1;
						for(let i=0;i<unitButtons.length;i=i+1){
							unitButtons[i].drawButton();
						}
						for(let i=0;i<unitButtons.length;i=i+1){
							if(unitButtons[i].isPressed == true){
								showUnitDescription(unitButtons[i].text,this.app.playerNumber, wi, he, si);
							}
						}

						//drawUnitMenu(this.playerColors,this.app.playerNumber, buttonScale);

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
									if(this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber, hoverX, hoverY);
										unitButtons[yy].isPressed=false;
									}
									else if(this.app.playerNumber == 2 && hoverX<=14 && hoverY >= 10 && hoverX < 30 && hoverY < 20){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
										unitButtons[yy].isPressed=false;
									}
									else if(this.app.playerNumber == 3 && hoverX>14 && hoverY < 10 && hoverX < 30 && hoverY < 20){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
										unitButtons[yy].isPressed=false;
									}
									else if(this.app.playerNumber == 4 && hoverX>14 && hoverY >= 10 && hoverX < 30 && hoverY < 20){
										//this.app.makeRayTracer(this.player,hoverX,hoverY);
										unitButtons[yy].func.call(this.app,unitButtons[yy].text, this.app.playerNumber,hoverX,hoverY);
										unitButtons[yy].isPressed=false;
									}
								}
							}

						}
						drawUnitMenu(this.playerColors,this.app.playerNumber, buttonScale);
					}

					//Buttons Section


					// this.app.appRunSimulation()

				}
				// if phase where grid should be shown, draw grid
				else if(this.app.gamePhase==2){

					bSubmit.confirmed = false;
					//s.background(255);
					//s.filter(GRAY);


					/*if(s.keyIsPressed){
					this.t=this.t+keyPressed();
				}*/

				if(animate === 10 && this.t < (Object.keys(this.simulationDisplayTurn.tick).length-1)){
					this.t=this.t+1;
					animate=0;
				}


				if(this.t<Object.keys(this.simulationDisplayTurn.tick).length && this.t>0){
					drawGrid(wi, he, si, this.playerColors);
					b = this.simulationDisplayTurn.tick[this.t].board;
					for(var k=0; k<b.length; k=k+1){
						for(var l=0; l<b[k].length; l=l+1){
							//drawTile(l, k, si, this.playerColors, wi, he);
							if(b[k][l].length != 0){
								for(var m=0; m<b[k][l].length;m=m+1){
									let displayObject = this.simulationDisplayTurn.tick[this.t].gameObjects.get(b[k][l][m]);
									if(displayObject !== undefined){

										drawDisplayObject(displayObject, l, k, tempConfig.size, this.playerColors, animate);
										if(displayObject.objCategory === "Units" || displayObject.objCategory === "Bases"){

											if(displayObject.collidedWith.length > 0){
											if(displayObject.collidedWith[0] == true){
												debug.log(3,displayObject);
												drawCollision(l,k, tempConfig.size, displayObject.collidedWith[1], animate, this.playerColors);
											}
										}
									}

									}
								}
							}
						}
					}
					hoverX=s.int(s.mouseX/si);
					hoverY=s.int(s.mouseY/si);
					if(hoverX >= 0 && hoverX < 30 && hoverY >= 0 && hoverY < 20) {
					if(b[hoverY][hoverX].length != 0){
						hoverObject = this.simulationDisplayTurn.tick[this.t].gameObjects.get(this.simulationDisplayTurn.tick[this.t].board[hoverY][hoverX][0]);
						if(hoverObject && hoverObject.objCategory != "Projectiles"){
							s.stroke(0);
							s.strokeWeight(3);
							s.fill(255,125);
							let transX = 0;
							let transY = 0;
							if(hoverX >= wi/(si*2) && hoverY < he/(si*2)){
									transX = 1;
							}
							else if(hoverX >= wi/(si*2) && hoverY >= he/(si*2)){
									transX = 1;
									transY = 1;
							}
							else if(hoverX < wi/(si*2) && hoverY >= he/(si*2)){
									transY = 1;
							}
							s.translate(-si*5*transX, -si*4*transY);
							s.rect(hoverX*si+si,hoverY*si+si,si*4,si*3);
							s.fill(this.playerColors[hoverObject.player-1][0], this.playerColors[hoverObject.player-1][1], this.playerColors[hoverObject.player-1][2], this.playerColors[hoverObject.player-1][3]);
							s.stroke(0);
							s.textFont(standardFont);
							s.textSize(si/2.3);
							s.text(hoverObject.fullName, hoverX*si+si*1.2,hoverY*si+si*1.7);
							s.text("Health: " + hoverObject.health, hoverX*si+si*1.2,hoverY*si+si*2.65);
							//s.text("Turns Active: " + hoverObject.turnsActive, hoverX*si+si*1.2,hoverY*si+si*2.8);
							s.translate(si*5*transX, si*4*transY);
						}
					}
				}

				}
				animate=animate+.5;

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
				this.confirmed = false;
			}
			drawButton(){
				s.stroke(255,255,255,255);
				s.noFill();
				s.strokeWeight(3);
				s.rect(this.xx,this.yy,this.xlen,this.ylen);
				if(this.isPressed==true){
					s.stroke(255,255,255,255);
					s.fill(255,255,255,100);
					s.rect(this.xx,this.yy,this.xlen,this.ylen);
				}
			}
			buttonHasBeenPressed(){
				this.isPressed = true;
			}
			confirmation(){
				this.isPressed = false;
				this.confirmed = true;
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

		function showUnitDescription(unitType, player, wid, hei, siz){
			let tranX = 0;
			let tranY = 0;
			if(player == 1){
				tranY = 1
			}
			else if(player == 3){
				tranX = 1;
				tranY = 1;
			}
			else if(player == 4){
				tranX = 1;
			}
			s.translate(wid*tranX/2, hei*tranY/2);
			s.textFont(standardFont);
			s.textSize(siz/2.8);
			s.fill(255);
			s.stroke(0);
			s.strokeWeight(0);
			s.text(Units[unitType].description, siz, siz*5, siz*12,siz*12);
			//s.text("RIGHT HERE", siz*2, siz*7);
			s.translate(-wid*tranX/2, -hei*tranY/2);
		}

		function drawDisplayObject(displayObject, x, y, size, colors, a) {

			if(displayObject.identifier == "Base"){
				drawBase(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
			}
			if(displayObject.identifier == "Ray"){
				drawRayTracer(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
			}
			if(displayObject.identifier == "Osc"){
				drawOscillator(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
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
			if(displayObject.identifier == "Cir"){
				drawCircuitBreaker(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
			}
			if(displayObject.identifier == "Int"){
				drawIntegrator(x,y,displayObject.player,size,displayObject.health,displayObject.maxHealth,colors);
			}
			if(displayObject.identifier == "JugProj"){
				drawJuggernodeProjectile(x,y,displayObject.player,size,colors,displayObject.orientation, displayObject.damage, a);
			}
			if(displayObject.identifier == "RayProj"){
				drawRayTracerProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, a);
			}
			if(displayObject.identifier == "OscProj"){
				drawOscillatorProjectile(x,y,displayObject.player,size,colors,displayObject.orientation, a);
			}
			if(displayObject.identifier == "MagProj"){
				drawMaglevProjectile(x,y,displayObject.player,size,colors,displayObject.orientation, displayObject.damage, a);
			}
			if(displayObject.identifier == "BalProj"){
				drawBallastProjectile(x,y,displayObject.player,size,colors,displayObject.damage, a);
			}
			if(displayObject.identifier == "CirProj"){
				drawCircuitBreakerProjectile(x,y,displayObject.player,size,colors,displayObject.damage, a);
			}
			if(displayObject.identifier == "IntProj"){
				drawIntegratorProjectile(x,y,displayObject.player,size,colors,displayObject.orientation,displayObject.damage, a);
			}
		}


		function drawRect(rect) {
			s.fill(rect.color[0], rect.color[1], rect.color[2]);
			s.rect(rect.x, rect.y, rect.size, rect.size);
		}

		function drawUnitMenu(pColors, player, scale){
			s.textFont(titleFont);
			let wid=tempConfig.canvasX;
			let hei=tempConfig.canvasY;
			let siz =tempConfig.size;
			s.strokeWeight(3);
			s.stroke(255);
			s.textSize(wid/23);
			if(player == 3 || player == 4){
				s.translate(-wid/2, 0);
			}
			s.fill(225,225,225,65);
			s.quad(wid/2+siz,siz,wid/2+siz,hei-siz,wid-siz,hei-siz,wid-siz,siz);
			s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			s.line(wid/2+siz*9.5,siz,wid/2+siz*9.5,hei-siz);
			s.line(wid/2+siz*11.5,siz,wid/2+siz*11.5,hei-siz);
			s.stroke(0);
			//s.text("Unit",wid/2+siz*1.5,siz*2.25);
			s.text("Machine",wid/2+siz*2.5,siz*2.45);
			s.noFill();
			s.strokeWeight(1);
			s.ellipse(wid/2+siz*10.5,siz*1.99,siz*1.45,siz*1.45);
			s.strokeWeight(2);
			s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			s.ellipse(wid/2+siz*10.5,siz*1.99,siz*1.35,siz*1.35);
			s.stroke(0);
			s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			let refXX = wid/2+siz*10.42;
			let refYY = siz*1.46;
			let propOne = .15;
			let propTwo = .45;
			s.strokeWeight(1);
			s.beginShape();
			s.vertex(refXX, refYY);
			s.vertex(refXX+siz*propOne,refYY);
			s.vertex(refXX+siz*propOne,refYY+siz*propTwo);
			s.vertex(refXX+siz*(propOne+propTwo),refYY+siz*propTwo);
			s.vertex(refXX+siz*(propOne+propTwo),refYY+siz*(propOne+propTwo));
			s.vertex(refXX+siz*propOne,refYY+siz*(propOne+propTwo));
			s.vertex(refXX+siz*propOne,refYY+siz*(propOne+propTwo+propTwo));
			s.vertex(refXX,refYY+siz*(propOne+propTwo+propTwo));
			s.vertex(refXX,refYY+siz*(propOne+propTwo));
			s.vertex(refXX-siz*propTwo,refYY+siz*(propOne+propTwo));
			s.vertex(refXX-siz*propTwo,refYY+siz*propTwo);
			s.vertex(refXX,refYY+siz*propTwo);
			s.vertex(refXX,refYY);
			s.endShape();

			//s.text("Cost",wid/2+siz*12.3,siz*2.45);
			s.textSize(wid/35);
			//s.textFont(standardFont);

			//Ray Tracer Button Decoration
			s.fill(255);
			s.stroke(0)
			s.strokeWeight(2);
			s.text("Ray Tracer",wid/2+siz*3.75,siz*4)
			s.text("100",wid/2+siz*9.9,siz*4)
			s.noFill();
			s.stroke(255);
			s.strokeWeight(2);
			s.beginShape();
			s.curveVertex(wid/2+siz*12,siz*4.25);
			for(let i = 0; i <= siz*1.5; i = i + 1){
				s.curveVertex(wid/2+siz*12+i,siz*4.25-25*s.abs(s.sin(.5*s.radians(i*360/(siz*1.5)))));
			}
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.endShape();
			//Oscillator Button Decoration
			s.translate(0,scale*siz*1);
			s.stroke(0);
			s.fill(255);
			s.text("Oscillator",wid/2+siz*3.75,siz*4)
			s.text("275",wid/2+siz*9.9,siz*4)
			s.noFill();
			s.stroke(255);
			s.strokeWeight(2);
			s.beginShape();
			s.curveVertex(wid/2+siz*12,siz*4.25);
			for(let i = 0; i <= siz*1.5; i = i + 1){
				s.curveVertex(wid/2+siz*12+i,siz*4.25-25*s.abs(s.sin(.5*s.radians(i*360/(siz*1.5)))));
			}
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.endShape();
			s.translate(0,-scale*siz*1);
			//Ballast Button Decoration
			s.translate(0,scale*siz*2);
			s.stroke(0);
			s.fill(255);
			s.text("Ballast",wid/2+siz*3.75,siz*4)
			s.text("300",wid/2+siz*9.9,siz*4)
			s.noFill();
			s.stroke(255);
			s.strokeWeight(2);
			s.beginShape();
			s.curveVertex(wid/2+siz*12,siz*4.25);
			for(let i = 0; i <= siz*1.5; i = i + 1){
				s.curveVertex(wid/2+siz*12+i,siz*4.25-25*s.abs(s.sin(1*s.radians(i*360/(siz*1.5)))));
			}
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.endShape();
			s.translate(0,-scale*siz*2);
			//Juggernode Button Decoration
			s.translate(0,scale*siz*3);
			s.stroke(0);
			s.fill(255);
			s.text("Juggernode",wid/2+siz*3.75,siz*4)
			s.text("500",wid/2+siz*9.9,siz*4)
			s.noFill();
			s.stroke(255);
			s.strokeWeight(2);
			s.beginShape();
			s.curveVertex(wid/2+siz*12,siz*4.25);
			for(let i = 0; i <= siz*1.5; i = i + 1){
				s.curveVertex(wid/2+siz*12+i,siz*4.25-25*s.abs(s.sin(1*s.radians(i*360/(siz*1.5)))));
			}
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.endShape();
			s.translate(0,-scale*siz*3);
			//Maglev Button Decoration
			s.translate(0,scale*siz*4);
			s.stroke(0);
			s.fill(255);
			s.text("Maglev",wid/2+siz*3.75,siz*4)
			s.text("250",wid/2+siz*9.9,siz*4)
			s.noFill();
			s.stroke(255);
			s.strokeWeight(2);
			s.beginShape();
			s.curveVertex(wid/2+siz*12,siz*4.25);
			for(let i = 0; i <= siz*1.5; i = i + 1){
				s.curveVertex(wid/2+siz*12+i,siz*4.25-25*s.abs(s.sin(1.5*s.radians(i*360/(siz*1.5)))));
			}
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.endShape();
			s.translate(0,-scale*siz*4);
			//Circuit Breaker Button Decoration
			s.translate(0,scale*siz*5);
			s.stroke(0);
			s.fill(255);
			s.text("Resonator",wid/2+siz*3.75,siz*4)
			s.text("400",wid/2+siz*9.9,siz*4)
			s.noFill();
			s.stroke(255);
			s.strokeWeight(2);
			s.beginShape();
			s.curveVertex(wid/2+siz*12,siz*4.25);
			for(let i = 0; i <= siz*1.5; i = i + 1){
				s.curveVertex(wid/2+siz*12+i,siz*4.25-25*s.abs(s.sin(1.5*s.radians(i*360/(siz*1.5)))));
			}
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.endShape();
			s.translate(0,-scale*siz*5);

			s.translate(0,scale*siz*6);
			s.stroke(0);
			s.fill(255);
			s.text("Integrator",wid/2+siz*3.75,siz*4)
			s.text("175",wid/2+siz*9.9,siz*4)
			s.noFill();
			s.stroke(255);
			s.strokeWeight(2);
			s.beginShape();
			s.curveVertex(wid/2+siz*12,siz*4.25);
			for(let i = 0; i <= siz*1.5; i = i + 1){
				s.curveVertex(wid/2+siz*12+i,siz*4.25-25*s.abs(s.sin(1.5*s.radians(i*360/(siz*1.5)))));
			}
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.curveVertex(wid/2+siz*12+siz*1.5,siz*4.25);
			s.endShape();
			s.translate(0,-scale*siz*6);

			if(player == 3 || player == 4){
				s.translate(wid/2, 0);
			}

			//text("Report",28*this.wid/40,3*this.hei/40);
			//text("H",36*this.wid/40,3*this.hei/40);
			//text("C",38.5*this.wid/40,3*this.hei/40);
		}

		function drawQuarterGrid(grid, pColors, player) {
			s.stroke(0,opacity);
			s.strokeWeight(2);
			let opacity = 255;
			for (var i = 0; i < grid.length; i++) {
				let rectSize = tempConfig.canvasX / grid[i].length;
				let rectY = i * (tempConfig.canvasY / grid.length);
				for (var j = 0; j < grid[i].length; j++) {
					let rectX = j* tempConfig.canvasY/ grid.length;
					if(i<=grid.length/2-1 && j <= grid[i].length/2-1){
						s.fill(pColors[0][0],pColors[0][1],pColors[0][2],opacity)
						if(player == 1){
							s.rect(rectX, rectY, rectSize, rectSize);
						}
					}
					else if(i >= grid.length/2-1 && j <= grid[i].length/2-1) {
						s.fill(pColors[1][0],pColors[1][1],pColors[1][2],opacity)
						if(player == 2){
							s.rect(rectX, rectY, rectSize, rectSize);
						}
					}
					else if(i <= grid.length/2-1 && j >= grid[i].length/2-1) {
						s.fill(pColors[2][0],pColors[2][1],pColors[2][2],opacity)
						if(player == 3){
							s.rect(rectX, rectY, rectSize, rectSize);
						}
					}
					else if(i >= grid.length/2-1 && j >= grid[i].length/2-1) {
						s.fill(pColors[3][0],pColors[3][1],pColors[3][2],opacity)
						if(player == 4){
							s.rect(rectX, rectY, rectSize, rectSize);
						}
					}
				}
			}
		}

		function drawTile(x, y, size, pColors, width, height){
			s.strokeWeight(2);
			s.stroke(0);
			if(x < width/2 && y < height/2){
				s.fill(pColors[0]);
			}
			else if(x < width/2 && y >= height/2){
				s.fill(pColors[1]);
			}
			else if(x >= width/2 && y < height/2){
				s.fill(pColors[2]);
			}
			else{
				s.fill(pColors[3]);
			}
			s.rect(x*size, y*size, size, size);
		}

		function drawGrid(wi, he, si, pColors) {

			s.image(imgTwo,0,0,he*1.6,he);

			s.noStroke();
			let opacity = 230;
			//s.fill(pColors[0][0],pColors[0][1],pColors[0][2],pColors[0][3]);
			s.fill(pColors[0][0],pColors[0][1],pColors[0][2],opacity);
			s.rect(0,0,wi/2,he/2);
			//s.fill(pColors[1][0],pColors[1][1],pColors[1][2],pColors[1][3]);
			s.fill(pColors[1][0],pColors[1][1],pColors[1][2],opacity);
			s.rect(0,he/2,wi/2,he/2);
			//s.fill(pColors[2][0],pColors[2][1],pColors[2][2],pColors[2][3]);
			s.fill(pColors[2][0],pColors[2][1],pColors[2][2],opacity);
			s.rect(wi/2,0,wi/2,he/2);
			//s.fill(pColors[3][0],pColors[3][1],pColors[3][2],pColors[3][3]);
			s.fill(pColors[3][0],pColors[3][1],pColors[3][2],opacity);
			s.rect(wi/2,he/2,wi/2,he/2);
			s.stroke(0,opacity);
			s.strokeWeight(2);
			for(let i = 0; i < (wi/si); i = i + 1){
				s.line(si*i, 0, si*i, he);
			}
			for(let j = 0; j < (he/si); j = j + 1){
				s.line(0, j*si, wi, j*si);
			}
		}


		function drawBase(x,y,player,size,health,max,pColors){
			//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
			//x,y,radius,npoints
			s.fill(0);
			s.stroke((max-health)*255/max);
			s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			s.strokeWeight(2);
			let offset=size/10;
			let alpha = 0;
			for(let row = x*size+offset; row < (x*size+size); row = row + offset*2){
				let bravo = 0;
				for(let col = y*size+offset; col < (y*size+size); col = col + offset*2){

					if(alpha < 2){
					s.line(row,col,row+offset*2,col);
				}
				else if(bravo < 2){
					s.line(row,col,row,col+offset*2);
				}
				else{
					s.line(row,col,row-offset*2,col-offset*2);
				}
				s.ellipse(row,col,offset*1.5,offset*1.5);
					bravo = bravo + 1;
				}

				alpha = alpha + 1;
			}
		}

		function drawRayTracer(x,y,player,size,health,max,pColors){
			//s.fill(pColors[player][0],pColors[player][1],pColors[player][2],pColors[player][3])
			s.stroke(0);
			s.strokeWeight(2);
			s.translate(x*size+size/2, y*size+size/2);
			for(let angle = 0; angle < 360; angle = angle + 90){
				s.rotate(s.radians(angle));
				s.line(size/2.5,size/2.5,size/6,size/8);
				s.line(size/2.5,size/2.5,size/8,size/6);
				s.rotate(-s.radians(angle));
			}
			s.translate(-x*size-size/2, -y*size-size/2);
			s.fill(0+(max-health)*2);
			s.ellipse(x*size+size/2,y*size+size/2,size/5,size/5);

		}

		function drawOscillator(x,y,player,size,health,max,pColors){
			s.stroke(0);
			s.strokeWeight(2);
			s.fill((max-health)*255/max);
			s.translate(x*size+size/2, y*size+size/2);
			for(let angle = 0; angle < 360; angle = angle + 120){
				s.rotate(s.radians(angle));
				s.triangle(0,size/10,size/8,size/6,-size/8,size/6);
				s.rotate(-s.radians(angle));
			}
			s.translate(-x*size-size/2, -y*size-size/2);
		}

		function drawMaglev(x,y,player,size,health,max,pColors){
			s.stroke(0);
			//s.fill((max-health)*255/max);
			s.fill(0);
			s.strokeWeight(1);
			for(let i = -6;i < 6;i=i+.5){
				s.ellipse(x*size+size/2,y*size+size/2+i*size/20,s.abs(i)*size/10,s.abs(i))*size/10;
			}
		}
		function drawCircuitBreaker(x,y,player,size,health,max,pColors){
			s.fill((max-health)*255/max);
			s.stroke(0);
			s.strokeWeight(2);
			s.translate(size*x+size/2,size*y+size/2);
			for(let i = 0; i < 360; i = i + 15){
				s.rotate(s.radians(i));
				s.line(0,0,size/2.5,0);
				s.rotate(-s.radians(i));
			}
			s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			s.strokeWeight(.5);
			s.ellipse(0,0,size/3,size/3);
			s.translate(-(size*x+size/2),-(size*y+size/2));

		}
		function drawIntegrator(x,y,player,size,health,max,pColors){
			s.fill((max-health)*255/max);
			s.stroke(0);
			s.strokeWeight(1);
			s.translate(size*x+size/2,size*y+size/2);
			s.beginShape();
			s.vertex(-size/6,size/2.4);
			s.vertex(-size/6,size/2.45);
			s.vertex(-size/7,size/2.6);
			s.vertex(size/7,size/2.6);
			s.vertex(size/6,size/2.45);
			s.vertex(size/6,size/2.4);
			s.vertex(-size/6,size/2.4);
			s.endShape();
			//s.rect(-size/50,-size/8,size/25,size/2);
			s.strokeWeight(2);
			for(let l = 2*size/12.5; l < size/1.6; l = l + size/12.5){
				s.line(-size/12,-size/6+l,size/12,-size/5+l);
			}
			//s.ellipse(0,size/4.5,size/2,size/500);
			//s.ellipse(0,size/9,size/3,size/500);
			//s.ellipse(0,size/10-s.abs(size/9-size/4.5),size/4,size/500);
			s.fill(255);

			s.ellipse(0,-size/4,size/2.9,size/2.9);
			s.translate(-(size*x+size/2),-(size*y+size/2));

		}

		function drawJuggernode(x,y,player,size,health,max,pColors){
			s.fill(0);
			s.stroke(0);
			s.strokeWeight(2);
			s.translate(x*size+size/2, y*size+size/2);

			for(let angle = 0; angle < 360; angle = angle + 60){
				s.rotate(s.radians(angle));
				s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
				s.triangle(0,0,size/2.5,0,size*.5/2.5,size*.5/2.5*s.sqrt(3));
				s.fill(0);
				s.ellipse(size/2.5,0,size/10,size/10);
				s.ellipse(size*.5/2.5,size*.5/2.5*s.sqrt(3),size/10,size/10);
				s.rotate(-s.radians(angle));
			}
			s.fill(0,255*(health/max))
			s.ellipse(0,0,size/6,size/6);
			s.translate(-x*size-size/2, -y*size-size/2);

		}

		function drawBallast(x,y,player,size,health,max,pColors){
			s.fill(0);
			s.stroke(0);
			s.strokeWeight(0);
			s.fill((max-health)*255/max);
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
			//s.background(0);
			//s.image(imgTwo,0,0,height*1.77,height);
      //s.background(0);
			if(delay>25){
			//	s.background(0,255-25*2);
			}
			else{
			//	s.background(0,255-delay*2);
			}
			s.translate(width/2,height/2);
			s.noStroke();
			s.noFill();
			s.stroke(176,196,243,255);
			s.strokeWeight(2);
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
			s.noStroke();
			for(var angle=delay*3;angle<delay*3+360;angle=angle+30){
				let titleX=(height/3+90*s.cos(3.14*s.radians(delay)))*s.cos(s.radians(angle))-0;
				let titleY=(height/3+2*s.tan(3.14*s.radians(delay/20)))*s.sin(s.radians(angle))+0;
				for(let o = 255; o > 0; o = o - 5){
					s.fill(152, 255, 152, o);
					s.ellipse(titleX,titleY,height/12-o*height/(255*12),height/12-o*height/(255*12));
				}
			}
			s.translate(-width/2,-height/2);
		}
		function drawRayTracerProjectile(x, y, player, size, pColors, orient, a){
			let refx=x*size;
			let refy=y*size;
			s.stroke(0)
			s.strokeWeight(2);
			let projSize = size/5;
			s.fill(pColors[player-1][0], pColors[player-1][1], pColors[player-1][2], 255);
			if(orient[0] == 0 && orient[1] == 1){
				s.ellipse(refx+size/2,refy+(a+1)*size/10,projSize,projSize);
			}
			else if(orient[0] == 0 && orient[1] == -1){
				s.ellipse(refx+size/2,refy+size-(a+1)*size/10,projSize,projSize);
			}
			else if(orient[0] == 1 && orient[1] == 0){
				s.ellipse(refx+(a+1)*size/10,refy+size/2,projSize,projSize);
			}
			else if(orient[0] == -1 && orient[1] == 0){
				s.ellipse(refx+size-(a+1)*size/10,refy+size/2,projSize,projSize);
			}
		}

		function drawOscillatorProjectile(x,y,player,size,pColors,orient, a){
			let refx=x*size+size/2;
			let refy=y*size+size/2;
			s.stroke(0);
			s.strokeWeight(.35*s.abs(a-4.5));
			for(let i = -size/3; i <= size/3; i = i + size/9){
				s.line(refx+i,refy-.75*(s.abs(i)-size/3),refx+i,refy+.75*(s.abs(i)-size/3));
			}
			s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2], 255);
			s.strokeWeight(.2*s.abs(a-4.5));
			for(let i = -size/3; i <= size/3; i = i + size/9){
				s.line(refx+i,refy-.75*(s.abs(i)-size/3),refx+i,refy+.75*(s.abs(i)-size/3));
			}
		}

		function drawMaglevProjectile(x, y, player, size, pColors, orient, damage, a){
			let refx=x*size;
			let refy=y*size;
			let scalar = size/4;
			s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2], damage*5);
			s.stroke(0,255);
			s.strokeWeight(2);
			//s.noStroke();
			s.beginShape();
			for(let angle = 0; angle <= 360; angle = angle + 20){
				//s.rect(refx,refy,size,size);
				s.curveVertex(refx+size/2+orient[0]*a*size/10+scalar*s.cos(s.radians(angle))*s.cos(s.radians(angle))*s.cos(s.radians(angle)),refy+size/2+orient[1]*a*size/10+scalar*s.sin(s.radians(angle))*s.sin(s.radians(angle))*s.sin(s.radians(angle)));
			}
			s.endShape();
		}
		function drawJuggernodeProjectile(x,y,player,size,pColors, orient, damage, a){
			let refx=x*size;
			let refy=y*size;

			s.noFill();
			s.stroke(0);
			s.strokeWeight(3);
			s.beginShape();
			let xAdd = 0;
			let yAdd = 0;
			if(orient[1] == -1){
				yAdd = size;
			}
			if(orient[0] == -1){
				xAdd = size;
			}
			for(let i = a; i <= (a+8); i = i + .05){
				s.curveVertex(refx+xAdd+orient[0]*i*(size/10)-orient[0]*(size/10)*s.cos(s.radians(i*180)),refy+yAdd+orient[1]*i*size/10+orient[1]*(size/10)*s.cos(s.radians(i*180)));
			}
			s.endShape();
			s.strokeWeight(2);
			s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			s.beginShape();
			for(let i = a; i <= (a+8); i = i + .05){
				s.curveVertex(refx+xAdd+orient[0]*i*(size/10)-orient[0]*(size/10)*s.cos(s.radians(i*180)),refy+yAdd+orient[1]*i*size/10+orient[1]*(size/10)*s.cos(s.radians(i*180)));
			}
			s.endShape();
			//s.ellipse(refx,refy,size,size);
		}
		function drawBallastProjectile(x,y,player,size,pColors,damage, a){

			let refx=x*size;
			let refy=y*size;
			s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],115);
			s.strokeWeight(1);
			//s.stroke(0);
			//a=a/100;
			//	Lissajous
			let amp=size/(20+2*s.abs(5-a));
			let n = 20+s.abs(5-a)/50;


			s.noFill();

			s.strokeWeight(2);
			s.stroke(0,255);
			s.translate(refx+size/2,refy+size/2);
			s.beginShape();
			s.curveVertex((size/3+(amp)*s.sin(n*s.radians(0)))*s.cos(s.radians(0)),(size/3+(amp)*s.sin(n*s.radians(0)))*s.sin(s.radians(0)));

			for(let angle = 0; angle <= 360; angle = angle + 5){
				s.curveVertex((size/3+(amp)*s.sin(n*s.radians(angle)))*s.cos(s.radians(angle)),(size/3+(amp)*s.sin(n*s.radians(angle)))*s.sin(s.radians(angle)));
			}
			s.curveVertex((size/3+(amp)*s.sin(n*s.radians(0)))*s.cos(s.radians(0)),(size/3+(amp)*s.sin(n*s.radians(0)))*s.sin(s.radians(0)));

			s.endShape();
			s.translate(-(refx+size/2),-(refy+size/2));
			s.strokeWeight(1);
			s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			s.translate(refx+size/2,refy+size/2);
			s.beginShape();
			s.curveVertex((size/3+(amp)*s.sin(n*s.radians(0)))*s.cos(s.radians(0)),(size/3+(amp)*s.sin(n*s.radians(0)))*s.sin(s.radians(0)));

			for(let angle = 0; angle <= 360; angle = angle + 5){
				s.curveVertex((size/3+(amp)*s.sin(n*s.radians(angle)))*s.cos(s.radians(angle)),(size/3+(amp)*s.sin(n*s.radians(angle)))*s.sin(s.radians(angle)));
			}
			s.curveVertex((size/3+(amp)*s.sin(n*s.radians(0)))*s.cos(s.radians(0)),(size/3+(amp)*s.sin(n*s.radians(0)))*s.sin(s.radians(0)));

			s.endShape();
			s.translate(-(refx+size/2),-(refy+size/2));

		}

		function drawCircuitBreakerProjectile(x, y, player, size, pColors, damage, a){
			s.strokeWeight(1);
			s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],105);
			let crossHairOffset = size/5;
			if(damage == 0){
				s.strokeWeight(2)
				s.stroke(255,185);
				s.ellipse(x*size+size/2, y*size+size/2,size/20,size/20);
				s.line(x*size+size/2, y*size+size/2-size/20,x*size+size/2, y*size+size/2-crossHairOffset);
				s.line(x*size+size/2-size/20, y*size+size/2,x*size+size/2-crossHairOffset, y*size+size/2);
				s.line(x*size+size/2, y*size+size/2+size/20,x*size+size/2, y*size+size/2+crossHairOffset);
				s.line(x*size+size/2+size/20, y*size+size/2,x*size+size/2+crossHairOffset, y*size+size/2);
				s.strokeWeight(1)
				s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],185);
				s.ellipse(x*size+size/2, y*size+size/2,size/20,size/20);
				s.line(x*size+size/2, y*size+size/2-size/20,x*size+size/2, y*size+size/2-crossHairOffset);
				s.line(x*size+size/2-size/20, y*size+size/2,x*size+size/2-crossHairOffset, y*size+size/2);
				s.line(x*size+size/2, y*size+size/2+size/20,x*size+size/2, y*size+size/2+crossHairOffset);
				s.line(x*size+size/2+size/20, y*size+size/2,x*size+size/2+crossHairOffset, y*size+size/2);
			}
			else{
				s.noStroke();
				if(a%2 == 0){
					s.noFill();
				}
				else{
					s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],105);
				}
				s.rect(x*size,y*size,size,size);
			}
		}

		function drawIntegratorProjectile(x, y, player, size, pColors, orient, damage, a){
			s.strokeWeight(1);
			let refx=x*size+size/2;
			let refy=y*size+size/2;
			let projSize=size/6;
			let length = 4;
			a=a*2-9
			s.fill(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],255);
			if(s.abs(orient[0]) == 2){
				if(a > 4 && a <10){
					s.strokeWeight(2);
					s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],155);
					s.line(refx+(orient[0]/2)*(a)*size/10-size/2,refy-orient[1]*size/4+orient[1]*(a)*size/20,refx+(orient[0]/2)*(a+length)*size/10-size/2,refy-orient[1]*size/4+orient[1]*(a+length)*size/20);
				}
				s.strokeWeight(1);
				s.stroke(0);
				s.line(refx+(orient[0]/2)*(a)*size/10-size/2,refy-orient[1]*size/4+orient[1]*(a)*size/20,refx+(orient[0]/2)*(a+length)*size/10-size/2,refy-orient[1]*size/4+orient[1]*(a+length)*size/20);
				//s.ellipse(refx+(orient[0]/2)*(a)*size/10-size/2,refy-orient[1]*size/4+orient[1]*(a)*size/20,projSize,projSize);
			}
			else{
				if(a > 4 && a <10){
					s.strokeWeight(2);
					s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2],155);
					s.line(refx-(orient[0])*size/4+orient[0]*(a)*size/20,refy+(orient[1]/2)*(a)*size/10-size/2,refx-(orient[0])*size/4+orient[0]*(a+length)*size/20,refy+(orient[1]/2)*(a+length)*size/10-size/2);
				}
				s.strokeWeight(1);
				s.stroke(0);
				s.line(refx-(orient[0])*size/4+orient[0]*(a)*size/20,refy+(orient[1]/2)*(a)*size/10-size/2,refx-(orient[0])*size/4+orient[0]*(a+length)*size/20,refy+(orient[1]/2)*(a+length)*size/10-size/2);
				//s.ellipse(refx-(orient[0])*size/4+orient[0]*(a)*size/20,refy+(orient[1]/2)*(a)*size/10-size/2,projSize,projSize);
			}

		}




		function drawCollision(x, y, size, player, a, pColors){
			let refx=x*size+size/2;
			let refy=y*size+size/2;
			let scalar = size/4;

			s.noFill();
			let theta=0;
			let phase=0;
			let meh=0;
			let osx=0;
			let osy=0;
			let wave = 4+(x*y)%14;
			let rad = 360;
			let radius=size/25;
			s.translate(refx,refy);
			for (let i = 0; i < rad; i = i + 20){
				s.stroke(pColors[player-1][0],pColors[player-1][1],pColors[player-1][2], 30-a);
				theta = i*(360/rad);
				phase=((Math.PI)/rad);
				meh = (radius*1.5+11.5)*s.sin(wave*theta+phase)*s.cos(phase);
				osx=(size/25+meh)*s.cos(theta);
				osy=(size/25+meh)*s.sin(theta);
				s.strokeWeight(9);
				s.point(osx,osy);
				s.strokeWeight(6);
				s.point(osx,osy);
				s.strokeWeight(3);
				s.point(osx,osy);
				s.stroke(255,25-a*2);
				s.strokeWeight(1.5);
				s.point(osx,osy);
			}
			s.translate(-refx,-refy);
			//s.ellipse(refx+size/2, refy+size/2, size-a, size-a);
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

	//console.log('Initialized Display');
}

}
