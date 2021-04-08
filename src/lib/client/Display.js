import p5 from 'p5';

import * as Units from '../shared/Unit.js';
import * as Projectiles from '../shared/Projectile.js';

//GENERAL CLEANUP - IN PROGRESS
// tempConfig sizes the frame, updated upon user action in the menu.
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
		this.playerColors = [[255, 0, 128, 255], [176, 196, 243, 255], [152, 255, 152, 255], [210, 130, 240, 255]];
		this.unitList = [];
		this.delay = 0;
		this.board = [[]];
		this.t = 1;
		this.successfulJoinedGame = null;
		this.startButtonEnabled = false;
	}



	init() {

		let sketch = (s) => {

			//Variable declarations prior to the draw loop & setup
			let newGame = 0;
			let dragging = 0;
			let scroller = 0;
			let titleFont;
			let standardFont;
			let animate = 0; //use to decide when a new tick value occurs
			let buttonScale = 1.599;
			let playerShifter;
			let submitShifterX;
			let submitShifterY;
			let sideBarGrowth = 1;
			let sideBarMenu = false;

			let value = false;

			//Button Declarations
			let scrubber;
			let bPhaseOne;
			let bStartMatch;
			let bPhaseThree;
			let bBase;
			let bRayTracer;
			let bRedShifter;
			let bMaglev;
			let bBeamSplitter;
			let bJuggernode;
			let bBallast;
			let bTripwire;
			let bResonator;
			let bOscillator;
			let bIntegrator;
			let newButtonPressed = 0;
			let currentButtonPressed = 0;
			let bSubmit;
			let bLeaveMatch;
			let bFullScreen;
			let bCloseMenu;
			let bStatsPage;
			let unitButtons = []; //List of the Buttons for unit creation
			let buttonMaker = 1; //Variable so buttons only get created once
			let buttonMakerTwo = 1;

			let counter = 0;
			let hoverX;
			let hoverY;

			let img;
			let imgTwo;
			let imgThree;
			let imgFour;
			let imgFive;
			let imgSix;
			let imgSeven;
			let imgEight;  //Background texture for matchmaking


			let col_high;
			let col_med;
			let col_low;
			let b;
			let possibleTargets = [];
			let hoverObject;
			let fullBoardTrigger = 0;
			let gameOver = 0;
			let postGameMenuTimer = 0;
			let alpha = 0;
			let input;
			let alias;
			let allowNewID = 1;
			let loading = false; //Whether The Loading Screen Should Be Displayed.
			let showMenu = false;
			let simulationCountdown = 0;

			//Variables for the width, height, and side length of game tiles - changes with screen resizing
			let he;
			let wi;
			let si;
			p5.disableFriendlyErrors = true;
			//Preload the fonts and other assets below
			s.preload = () => {
				titleFont = s.loadFont('static/volt.ttf');
				standardFont = s.loadFont('static/ISB.ttf');
				//img = s.loadImage('static/CCBolt.png');
				imgTwo = s.loadImage('static/CBoard3.png');
				imgThree = s.loadImage('static/P1_Core.png');
				imgFour = s.loadImage('static/P2_Core.png');
				imgFive = s.loadImage('static/P3_Core.png');
				imgSix = s.loadImage('static/P4_Core.png');
				imgSeven = s.loadImage('static/RedShifter.png');
				imgEight = s.loadImage('static/Tex6.jpg');
				col_high = s.loadImage('static/Col_High.png');
				col_med = s.loadImage('static/Col_Med.png');
				col_low = s.loadImage('static/Col_Low.png');
			}

			//Create the canvas based on the size of the user window
			s.setup = () => {
				let cnv = s.createCanvas(tempConfig.canvasX, tempConfig.canvasY);
				let cnvX = (s.windowWidth-tempConfig.canvasX)/2;
				let cnvY = (s.windowHeight-tempConfig.canvasY)/2;
				cnv.position(cnvX,cnvY);
				s.frameRate(60);

				input = s.createInput();
				alias = s.createInput();

				s.cursor(s.CROSS); //Make a more appealing cursor for users


			}

			//The draw function loops continuously while the sketch is active
			//Different screens of the game are portioned off using trigger variables and user input affects game-level variables move between them

			s.draw = () => {

				//Ensure that the input boxes do not display by default
				input.style('display', 'none');
				alias.style('display', 'none');

				//The below variables to be filled in by the size of the players current browser window
				wi = s.width; //The width of the canvas
				he = s.height; //The height of the canvas
				si = s.width / 30; //the side length of each cell in canvas

				//The below variables track the x and y of the mouse in order to respond to user movement
				hoverX = s.int(s.mouseX / si);
				hoverY = s.int(s.mouseY / si);

				//Delay serves as a variable that has a constant increment for animation purposes, deltaTime is a p5js variable that tracks the time it takes for the prior frame to render
				//deltaTime is used to adjust the animation rate according to the current framerate of each local machine.
				this.delay = this.delay + .19 + s.deltaTime / 425;

				if (this.app.playerNumber > 2) {
					//playerShifter shifts the Button Menu depending on player number
					playerShifter = s.width / 2;
				}

				if (buttonMakerTwo === 1) {
					//The start match button is created one time initially and then recreated upon a screen resizing
					bStartMatch = new Buttoned(wi - si * 5.55, si * 11.5, si * 5.1, si * 1.1, "Start Match", this.app.sendStartGame);
				}

				buttonMakerTwo = 0;

				//if(this.app.playerNumber && buttonMaker == 1){
				if(buttonMaker == 1){
					//The remaining buttons are created one time initially and then recreated upon a screen resizing
					playerShifter = 0;
					submitShifterX = 0;
					submitShifterY = 0;
					if(this.app.playerNumber){
						if (this.app.playerNumber == 2) {
							submitShifterX = 0;
							submitShifterY = he / 2;
						}
						else if (this.app.playerNumber == 3) {
							playerShifter = s.width / 2;
							submitShifterX = wi / 2;
							submitShifterY = 0;
						}
						else if (this.app.playerNumber == 4) {
							playerShifter = s.width / 2;
							submitShifterX = wi / 2;
							submitShifterY = he / 2;
						}
					}

					unitButtons = [];
					scrubber = new Scrubber(wi * 7.15 / 10, he * 8.05 / 10, si * 2.5, si/2.2);

					bLeaveMatch = new Buttoned(wi*2/7, he/4-si, wi*3/7, si * 2, "Leave Match", this.app.setGamePhase);
					bFullScreen = new Buttoned(wi*2/7, he/4-si+he/8, wi*3/7, si * 2, "Toggle Full Screen", this.app.setGamePhase);
					bCloseMenu = new Buttoned(wi*2/7, he/4-si+2*he/8, wi*3/7, si * 2, "Toggle Full Screen", this.app.setGamePhase);

					bStatsPage = new Buttoned(wi*2/7, he/4-si+he/8, wi*3/7, si * 2, "Statistics", this.app.setGamePhase);
					bPhaseOne = new Buttoned(wi - si * 5.55, si * 2.9, si * 5.1, si * 1.1, "Deploy Machines", this.app.setGamePhase);
					bPhaseThree = new Buttoned(wi / 3.4 + submitShifterX, he / 1.65 - submitShifterY, si * 6.1, si * 1.1, "Review Board", this.app.setGamePhase);
					debug.log(3, submitShifterY);
					bSubmit = new Buttoned(wi / 3.4 + submitShifterX, he / 1.815 - submitShifterY, si * 6.1, si * 1.1, "Submit Orders", this.app.sendSubmitTurn);
					bBase = new Buttoned(wi / 2 + si - playerShifter, si * buttonScale * 2, wi / 2 - si * 2, si * buttonScale * 3, "Base", this.app.sendCreateBase);
					//Unit Buttons Below
					bRayTracer = new Buttoned(wi / 2 + si - playerShifter, si * 3, wi / 2 - si * 2, si * buttonScale, "RayTracer", this.app.sendCreateUnit);
					unitButtons.push(bRayTracer);
					bRedShifter = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 1, wi / 2 - si * 2, si * buttonScale, "RedShifter", this.app.sendCreateUnit);
					unitButtons.push(bRedShifter);
					bOscillator = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 2, wi / 2 - si * 2, si * buttonScale, "Oscillator", this.app.sendCreateUnit);
					unitButtons.push(bOscillator);
					bBeamSplitter = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 3, wi / 2 - si * 2, si * buttonScale, "BeamSplitter", this.app.sendCreateUnit);
					unitButtons.push(bBeamSplitter);
					bBallast = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 4, wi / 2 - si * 2, si * buttonScale, "Ballast", this.app.sendCreateUnit);
					unitButtons.push(bBallast);
					bJuggernode = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 5, wi / 2 - si * 2, si * buttonScale, "Juggernode", this.app.sendCreateUnit);
					unitButtons.push(bJuggernode);
					bTripwire = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 6, wi / 2 - si * 2, si * buttonScale, "Tripwire", this.app.sendCreateUnit);
					unitButtons.push(bTripwire);
					bMaglev = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 7, wi / 2 - si * 2, si * buttonScale, "Maglev", this.app.sendCreateUnit);
					unitButtons.push(bMaglev);
					bResonator = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 8, wi / 2 - si * 2, si * buttonScale, "Resonator", this.app.sendCreateUnit);
					unitButtons.push(bResonator);
					bIntegrator = new Buttoned(wi / 2 + si - playerShifter, si * 3 + buttonScale * si * 9, wi / 2 - si * 2, si * buttonScale, "Integrator", this.app.sendCreateUnit);
					unitButtons.push(bIntegrator);

					buttonMaker = 0;
			}



				//The Game Begins in the Title phase
				if (this.app.gamePhase == "TITLE") {
					//Sets the default text font and its size
					s.textFont(titleFont);
					s.textSize(wi / 9);

					titleSequence(wi, he, this.delay, si / 2);

					//Display the game title on top of the title sequence visuals
					if (this.delay > 25) {
						s.stroke(0, (this.delay - 25) * 2.9);
						s.fill(255, 0, 128, (this.delay - 25) * 2.9);
					}
					else {
						s.noFill();
						s.noStroke();
					}
					if ((this.delay - 25) * 2.9 > 200) {
						s.fill(255, 0, 128, 201);
					}

					s.strokeWeight(4);
					s.textAlign(s.CENTER);
					s.text("Close", s.width / 2, s.height / 2.4);
					s.text("Quarters", s.width / 2, s.height / 1.6);

					let id = alias.value();

					if (this.delay > 15) {
						//Trigger the input box and instructions for player username
						s.textSize(wi / 20);
						s.fill(210, 130, 240, 201);

						if(id.length === 0){
							s.text("Enter An Alias:", s.width / 2.5, s.height / 1.15);
						}
						else{
							s.text("Confirm", s.width / 2.2, s.height / 1.15);
						}
							alias.style('display', 'block');
							alias.position(3.5 * s.width / 5 , 5.95*s.height/7);
							alias.size(si * 5, s.height / 15);
							alias.style('font-size', '28px');
							alias.style('background-color', 'black');
							alias.style('border-color', '#d382f0');
							alias.style('color', '#d382f0');
							alias.style('text-transform', 'uppercase');
							alias.style('font-family', "Monaco");
					}
					s.textAlign(s.LEFT);
					s.textSize(wi / 9);
					if(id.length > 0 && s.keyIsPressed){
						if(s.keyCode === 13){
							this.app.sendSetAlias(id);

						/*	if (!debug.enabled) {
								s.fullscreen(true);
								s.resizeCanvas(window.screen.height * 1.5, window.screen.height);
							}*/

							buttonMaker = 1;
							buttonMakerTwo = 1;
							this.app.setGamePhase("MATCHMAKING");
							s.mouseIsPressed = false;
							unitButtons = [];
							s.keyIsPressed = false;
					}
				}
					if(id.length > 0 && s.mouseX > (-si * 3.5 + s.width / 2.2) && s.mouseX < (si * 3.5 + s.width / 2.2) && s.mouseY > s.height / 1.25 && s.mouseY < s.height / 1.15){
						s.stroke(0);
						s.fill(255,100);
						s.rect(s.width / 2.2-si*3.5,s.height / 1.25, si*7, si*1.7);

						if (s.mouseIsPressed) {
							//Trigger when the player presses confirm and save their username, move to the matchmaking phase
							this.app.sendSetAlias(id);

							/*if (!debug.enabled) {
								s.fullscreen(true);
								s.resizeCanvas(window.screen.height * 1.5, window.screen.height);
							}*/

							buttonMaker = 1;
							buttonMakerTwo = 1;
							this.app.setGamePhase("MATCHMAKING");
							s.mouseIsPressed = false;
							unitButtons = [];
						}
					}
				}
				else if (this.app.gamePhase === "MATCHMAKING") {
					displayMatchmaking(this.app.matchmakingData, wi, he, si, this.delay, this.playerColors);
					//Matchmaking Phase where users can learn more about the game or enter into a lobby
					input.style('display', 'block');
					input.position(3.35 * wi / 5 + si * 1.6, he / 5.7);
					input.size(si * 2.6, he / 20);
					input.style('font-size', '28px');
					input.style('background-color', 'transparent');
					input.style('border-color', 'white');
					input.style('color', 'white');
					input.style('text-transform', 'uppercase');
					input.style('font-family', "Monaco");

					s.textAlign(s.CENTER);
					s.noStroke();
					s.fill(255, 55);
				  //he = he * 1.25;

					if(s.mouseX < (3 * wi / 4) && s.mouseX > (wi / 4) && s.mouseY > (he / 10 + (1) * 8 * he / 60) && s.mouseY < (he / 10 + (2) * 8 * he / 60)){
						s.rect(wi / 4, (he / 10 + (1) * 8 * he / 60), wi / 2, (1) * 8 * he / 60);
						if(s.mouseIsPressed){
							this.app.sendCreateRoom();
						}
					}
					else if(s.mouseX < (3 * wi / 4) && s.mouseX > (wi / 4) && s.mouseY > (he / 10 + (2) * 8 * he / 60) && s.mouseY < (he / 10 + (3) * 8 * he / 60)){
						s.rect(wi / 4, (he / 10 + (2) * 8 * he / 60), wi / 2, (1) * 8 * he / 60);
						if(s.mouseIsPressed){
							this.app.sendJoinOpenGame();
						}
					}
					else if(s.mouseX < (3 * wi / 4) && s.mouseX > (wi / 4) && s.mouseY > (he / 10 + (3) * 8 * he / 60) && s.mouseY < (he / 10 + (4) * 8 * he / 60)){
						s.rect(wi / 4, (he / 10 + (3) * 8 * he / 60), wi / 2, (1) * 8 * he / 60);
						if(s.mouseIsPressed){
							window.open('http://www.closequarters.xyz/#how-to', '_blank');
						}
					}
					else if(s.mouseX < (3 * wi / 4) && s.mouseX > (wi / 4) && s.mouseY > (he / 10 + (4) * 8 * he / 60) && s.mouseY < (he / 10 + (5) * 8 * he / 60)){
						s.rect(wi / 4, (he / 10 + (4) * 8 * he / 60), wi / 2, (1) * 8 * he / 60);
						if(s.mouseIsPressed){
							window.open('http://www.elixarcade.com', '_blank');
						}
					}
					let gameID = input.value();

					if (gameID.length == 5) {
						if (allowNewID == 1) {
							this.app.sendJoinGame(gameID);
							allowNewID = 0;
						}
						if (this.successfulJoinedGame === false) {
							s.fill(255, 255);
							s.textSize(si * .5);
							s.stroke(0);
							s.textFont(standardFont);
							s.text("Room Not Found", wi / 2 + si * 11, he / 6);
						}
					}
					else {
						allowNewID = 1;
					}
					//he = 20 * he / 21;
				}
				else if (this.app.gamePhase === "LOBBY" && this.app.clientState !== 'SPECTATOR') {

					newGame = 0;

					if(bSubmit.submitted === true){
						bSubmit.submitted = false;
					}
					if(bSubmit.confirmed === true){
						bSubmit.confirmed = false;
					}

					//Lobby Phase where users add computer players and wait for others to join their game
					sideBarGrowth = 0.8;
					sideBarMenu = true;
					wi = s.width * sideBarGrowth;
					si = wi / 30;
					he = si * 20;
					let offsetX = 0;
					let offsetY = 0;

					drawGrid(wi, he, si, this.playerColors, 150);

					for (let p = 0; p < 4; p = p + 1) {
						if (p === 1) {
							s.translate(0, he / 2);
							offsetX = 0;
							offsetY = he / 2;
						}
						else if (p === 2) {
							s.translate(wi / 2, 0);
							offsetX = wi / 2;
							offsetY = 0;
						}
						else if (p === 3) {
							s.translate(wi / 2, he / 2);
							offsetX = wi / 2;
							offsetY = he / 2;
						}

						s.stroke(255, 255);
						s.strokeWeight(1);
						s.noFill()

						if (this.app.playerSpotsInGameRoom[p + 1].playerType === 'Human') {



							if((this.app.playerNumber - 1) !== p){
								s.stroke(255);
								s.fill(0);
								s.rect(wi / 4 - si * 2, he / 4 - si / 2, si * 4, si);
								s.textFont(titleFont);
								s.fill(255);
								s.stroke(0);
								s.textSize(si / 1.4);
								s.text("REMOVE", wi / 4 - si * 1.45, he / 4 + si / 5);
								if (s.mouseIsPressed && s.mouseX < wi / 4 - si * 2 + si * 4 + offsetX && s.mouseX > wi / 4 - si * 2 + offsetX && s.mouseY < he / 4 - si / 2 + si + offsetY && s.mouseY > he / 4 - si / 2 + offsetY) {
									this.app.sendClearSpot(p + 1);
								}
							}
						}
						else if (this.app.playerSpotsInGameRoom[p + 1].playerType !== 'AI') {
							s.noStroke();
							s.fill(0, 150);
							s.rect(0, 0, si * 15, si * 10);
						}
						if (this.app.playerSpotsInGameRoom[p + 1].playerType === 'Open') {
							s.stroke(255);
							s.fill(0);
							s.rect(wi / 4 - si * 2, he / 4 - si / 2, si * 4, si);
							s.textFont(titleFont);
							s.fill(255);
							s.stroke(0);
							s.textSize(si / 1.4);
							s.text("MAKE AI", wi / 4 - si * 1.45, he / 4 + si / 5);
							if (s.mouseIsPressed && s.mouseX < wi / 4 - si * 2 + si * 4 + offsetX && s.mouseX > wi / 4 - si * 2 + offsetX && s.mouseY < he / 4 - si / 2 + si + offsetY && s.mouseY > he / 4 - si / 2 + offsetY) {
								this.app.sendAssignAIToSpot(p + 1);
							}
						}
						if (this.app.playerSpotsInGameRoom[p + 1].playerType === 'AI') {
							s.stroke(255);
							s.fill(0);
							s.rect(wi / 4 - si * 2, he / 4 - si / 2, si * 4, si);
							s.textFont(titleFont);
							s.fill(255);
							s.stroke(0);
							s.textSize(si / 1.4);
							s.text("RE-OPEN", wi / 4 - si * 1.45, he / 4 + si / 5);
							if (s.mouseIsPressed && s.mouseX < wi / 4 - si * 2 + si * 4 + offsetX && s.mouseX > wi / 4 - si * 2 + offsetX && s.mouseY < he / 4 - si / 2 + si + offsetY && s.mouseY > he / 4 - si / 2 + offsetY) {
								this.app.sendClearSpot(p + 1);
							}
						}

						s.textFont(titleFont);
						s.textSize(si);
						s.fill(255);
						s.stroke(0);
						s.textAlign(s.CENTER);
						if ((this.app.playerNumber - 1) === p) {
							s.text(this.app.playerSpotsInGameRoom[p + 1].alias, wi / 4, he / 4.15);
							//s.text("YOU", wi / 4, he / 4.3);
						}
						else if (this.app.playerSpotsInGameRoom[p + 1].playerType == 'Human') {
							s.text(this.app.playerSpotsInGameRoom[p + 1].alias, wi / 4, he / 4.7);
						}
						if (this.app.playerSpotsInGameRoom[p + 1].playerType == 'AI') {
							s.text("COMPUTER", wi / 4, he / 4.7);
						}
						if (this.app.playerSpotsInGameRoom[p + 1].playerType == 'Open') {
							s.text("OPEN", wi / 4, he / 4.7);
						}
						if (p == 1) {
							s.translate(0, -he / 2);
						}
						else if (p == 2) {
							s.translate(-wi / 2, 0);
						}
						else if (p == 3) {
							s.translate(-wi / 2, -he / 2);
						}
						s.textAlign(s.LEFT);
					}

					///SIDE BAR FOR REVIEW MODE
					s.textFont(titleFont);
					s.fill(0, 150);
					s.noStroke();
					s.rect(wi, 0, s.width - wi, he);
					s.rect(0, he, s.width, s.width - he);
					if (sideBarMenu == true) {
						s.textSize(si * 1.2);
						s.fill(this.playerColors[this.app.playerNumber - 1][0], this.playerColors[this.app.playerNumber - 1][1], this.playerColors[this.app.playerNumber - 1][2], 255);
						s.stroke(0);
						s.text("Lobby", wi + si * 2, si * 1.5);
						s.stroke(255);
						s.line(wi + si / 4, si * 2, s.width - si / 4, si * 2);
						s.noFill();
						s.strokeWeight(3);
						s.rect(wi + si * 1.2, si * 3.5, si * 5, si * 1.5);
						s.strokeWeight(1);
						s.fill(255);
						s.stroke(0);
						s.textSize(si * .7);
						s.text("Leave Room", wi + si * 1.5, si * 4.5);
						if (s.mouseIsPressed && s.mouseX < wi + si * 1.2 + si * 5 && s.mouseX > wi + si * 1.2 && s.mouseY < si * 3.5 + si * 1.5 && s.mouseY > si * 3.5) {
							this.app.sendLeaveGame();
						}
						bStartMatch.drawButton();
						if (this.startButtonEnabled === true) {
							if (s.mouseIsPressed && bStartMatch.isInRange(s.mouseX, s.mouseY)) {
								bStartMatch.func.call(this.app);
							}
						}
						if (this.startButtonEnabled === true) {
							s.fill(255, 255);
						}
						else {
							s.fill(110, 255);
						}
						s.stroke(0);
						s.textSize(si * 0.9);
						s.text("Start Match", wi + si * .71, si * 15.35);
						s.fill(255, 255);
						s.textSize(si * 0.475);
						s.text("All Spots Must Be Filled", wi + si * .71, si * 16.5);
						s.text("By Humans Or AI To Begin", wi + si * .71, si * 17.25);
						s.fill(255);
						s.stroke(0);
						s.textSize(si * 1.25);
						s.textAlign(s.CENTER);
						s.text("Join Code", wi + wi * .125, si * 9);
						s.line(wi + wi * .1, si * 8.5, s.width - wi * .1, si * 8.5)
						s.fill(this.playerColors[this.app.playerNumber - 1][0], this.playerColors[this.app.playerNumber - 1][1], this.playerColors[this.app.playerNumber - 1][2], 255);
						s.stroke(0);
						s.textFont(standardFont);
						s.textSize(si * .89);
						let upperCase = this.app.gameRoom.toUpperCase();
						s.text(upperCase, wi + wi * .125, si * 10.5);

						s.textFont(titleFont);
						s.textAlign(s.LEFT);
						s.textSize(si * 1.1);
						s.stroke(0);
						s.strokeWeight(2);
						//Scrolling Bar;
						s.textSize(si * 1.7);
						s.textFont(standardFont);
						scroller = this.delay / 250;
						s.text("Waiting on Players...", -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);
					/*	scroller = (this.delay + 60) / 250;
						s.text("Starting Cores: 2", -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);
						scroller = (this.delay + 120) / 250;
						s.text("Games Active: ", -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);
						scroller = (this.delay - 60) / 250;
						s.text("Starting Credits: 7", -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);
						*/
					}
				}
				else if (this.app.gamePhase === "PLACEMENT" && this.app.clientState !== 'SPECTATOR' && this.app.clientState !== 'DEFEATED_PLAYER' && this.app.turnIsIn !== true) {

					s.textFont(titleFont);
					s.textSize(wi / 9);

					if (this.app.playerNumber == 2) {
						submitShifterX = 0;
						submitShifterY = he / 2;
					}
					else if (this.app.playerNumber == 3) {
						submitShifterX = wi / 2;
						submitShifterY = 0;
					}
					else if (this.app.playerNumber == 4) {
						submitShifterX = wi / 2;
						submitShifterY = he / 2;
					}
					if(newGame === 0){
						buttonMaker = 1;
						buttonMakerTwo = 1;
					}
					newGame = 1;

					this.t = 1;
					animate = 0;

					s.image(imgTwo, 0, 0, he * 1.6, he);
					if (this.app.playerNumber == 1) {
						s.fill(0, 190);
						s.noStroke();
						s.rect(wi / 2, 0, wi / 2, he);
						s.rect(0, he / 2, wi / 2, he / 2);
					}
					else if (this.app.playerNumber == 2) {
						s.fill(0, 190);
						s.noStroke();
						s.rect(0, 0, wi, he / 2);
						s.rect(wi / 2, he / 2, wi / 2, he / 2);
					}
					else if (this.app.playerNumber == 3) {
						s.fill(0, 190);
						s.noStroke();
						s.rect(0, 0, wi / 2, he);
						s.rect(wi / 2, he / 2, wi / 2, he / 2);
					}
					else if (this.app.playerNumber == 4) {
						s.fill(0, 190);
						s.noStroke();
						s.rect(0, 0, wi, he / 2);
						s.rect(0, he / 2, wi / 2, he / 2);
					}
					s.strokeWeight(1);
					s.fill(255);
					s.stroke(0);
					s.textSize(si * .4);
					s.textAlign(s.CENTER);
					s.text("Press 'M' To Access Game Menu", wi/4 - wi/8 + submitShifterX+wi/8, he - si * 0.8 - submitShifterY);
					s.textAlign(s.LEFT);
					if (this.app.game.players[this.app.playerNumber - 1].baseCount < 2 && this.app.game.turnNumber === 1) {
						bBase.drawButton();
						s.fill(255);
						s.stroke(0);
						s.textSize(wi / 28.5);
						s.textAlign(s.CENTER);
						if (this.app.game.players[this.app.playerNumber - 1].baseCount == 0){
							s.text("Place First Core", 3 * wi / 4 - playerShifter, si * buttonScale * 3.7);
						}
						else{
							s.text("Place Second Core", 3 * wi / 4 - playerShifter, si * buttonScale * 3.7);
						}
						s.textAlign(s.LEFT);
						if (s.mouseIsPressed) {
							if (bBase.isInRange(s.mouseX, s.mouseY)) {
								bBase.buttonHasBeenPressed();
							}
							if (bBase.isPressed === true) {
								if (this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
									bBase.func.call(this.app, bBase.text, this.app.playerNumber, hoverX, hoverY);
									bBase.isPressed = false;
								}
								else if (this.app.playerNumber == 2 && hoverX <= 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
									bBase.func.call(this.app, bBase.text, this.app.playerNumber, hoverX, hoverY);
									bBase.isPressed = false;
								}
								else if (this.app.playerNumber == 3 && hoverX > 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
									bBase.func.call(this.app, bBase.text, this.app.playerNumber, hoverX, hoverY);
									bBase.isPressed = false;
								}
								else if (this.app.playerNumber == 4 && hoverX > 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
									bBase.func.call(this.app, bBase.text, this.app.playerNumber, hoverX, hoverY);
									bBase.isPressed = false;
								}
							}
						}
					}
					else {
						s.textSize(wi / 40);
						s.textAlign(s.CENTER);
						if (this.app.turnNumber > 1) {
							bPhaseThree.drawButton();
							s.fill(255);
							s.stroke(0);
							s.text("Review Board", bPhaseThree.xx + si * 3.05, bPhaseThree.yy + si / 1.25);
						}
						if (bSubmit.submitted === false) {
							bSubmit.drawButton();
						}
						if (bSubmit.confirmed === false) {
							s.fill(255);
							s.stroke(0);
							s.text("Submit Orders", bPhaseThree.xx + si * 3.05, bSubmit.yy + si / 1.25);
							counter = 0;
						}
						else if (bSubmit.submitted === true) {
							s.fill(this.playerColors[this.app.playerNumber - 1][0], this.playerColors[this.app.playerNumber - 1][1], this.playerColors[this.app.playerNumber - 1][2], this.playerColors[this.app.playerNumber - 1][3]);
							s.stroke(0);
							s.text("Submitted", bPhaseThree.xx + si * 3.05, bSubmit.yy + si / 1.25);
						}
						else {
							s.fill(this.playerColors[this.app.playerNumber - 1][0], this.playerColors[this.app.playerNumber - 1][1], this.playerColors[this.app.playerNumber - 1][2], this.playerColors[this.app.playerNumber - 1][3]);
							s.stroke(0);
							s.text("Confirm", bPhaseThree.xx + si * 3.05, bSubmit.yy + si / 1.25);
							counter = counter + 1;
						}
						s.textAlign(s.LEFT);
						for (let i = 0; i < unitButtons.length; i = i + 1) {
							unitButtons[i].drawButton();
							if (unitButtons[i].isPressed == true) {
								showUnitDescription(unitButtons[i].text, this.app.playerNumber, wi, he, si);
								possibleTargets = getPossibleTargets(unitButtons[i].text, hoverX, hoverY, this.app.playerNumber);

							}
						}
						if (s.mouseIsPressed) {
							if (this.app.turnNumber > 1) {
								if (bPhaseThree.isInRange(s.mouseX, s.mouseY)) {
									//bPhaseThree.func.call(this.app, 3);
									this.app.setGamePhase("REVIEW");
									//break
								}
							}
							if (bSubmit.isInRange(s.mouseX, s.mouseY)) {
								bSubmit.buttonHasBeenPressed();
								if (bSubmit.isPressed === true && bSubmit.confirmed === false) {
									bSubmit.confirmation();
								}
								else if (bSubmit.isPressed === true && bSubmit.confirmed === true && counter > 40) {
									bSubmit.isPressed = false;
									bSubmit.submission();
									bSubmit.func.call(this.app);
									//TESTING // DEBUG:
									//bSubmit.submitted = false;
									//bSubmit.confirmed = false;
								}
							}
							currentButtonPressed = newButtonPressed;

							for (let i = 0; i < unitButtons.length; i = i + 1) {
								if (unitButtons[i].isInRange(s.mouseX, s.mouseY)) {
									unitButtons[i].buttonHasBeenPressed();
									newButtonPressed = i;
									//currentButtonPressed = i;

								}

								if (currentButtonPressed != newButtonPressed) {
									unitButtons[currentButtonPressed].isPressed = false;
								}
								if (i != newButtonPressed) {
									unitButtons[i].isPressed = false;
								}
							}
							if (bSubmit.submitted == false) {
								if (unitButtons[newButtonPressed].isPressed === true) {
									if (this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
										unitButtons[newButtonPressed].func.call(this.app, unitButtons[newButtonPressed].text, this.app.playerNumber, hoverX, hoverY);
										unitButtons[newButtonPressed].isPressed = false;
										possibleTargets = [];
									}
									else if (this.app.playerNumber == 2 && hoverX <= 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
										unitButtons[newButtonPressed].func.call(this.app, unitButtons[newButtonPressed].text, this.app.playerNumber, hoverX, hoverY);
										unitButtons[newButtonPressed].isPressed = false;
										possibleTargets = [];
									}
									else if (this.app.playerNumber == 3 && hoverX > 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
										unitButtons[newButtonPressed].func.call(this.app, unitButtons[newButtonPressed].text, this.app.playerNumber, hoverX, hoverY);
										unitButtons[newButtonPressed].isPressed = false;
										possibleTargets = [];
									}
									else if (this.app.playerNumber == 4 && hoverX > 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
										unitButtons[newButtonPressed].func.call(this.app, unitButtons[newButtonPressed].text, this.app.playerNumber, hoverX, hoverY);
										unitButtons[newButtonPressed].isPressed = false;
										possibleTargets = [];
									}
								}
							}
						}

						drawUnitMenu(this.playerColors, this.app.playerNumber, buttonScale);
					}

					if (this.app.playerNumber == 2) {
						s.translate(0, -he / 2);
					}
					else if (this.app.playerNumber == 3) {
						s.translate(wi / 2, 0);
					}
					else if (this.app.playerNumber == 4) {
						s.translate(wi / 2, -he / 2);
					}
					s.textSize(wi / 40);
					s.fill(255);
					s.stroke(0);
					s.strokeWeight(1);
					drawCreditsSymbol(wi / 2.73, he / 1.43, si * .75, this.app.playerNumber, 10, this.playerColors);
					s.text(":  " + this.app.game.players[this.app.playerNumber - 1].credits, wi / 2.53, he / 1.405);
					s.textSize(wi / 80);
					s.fill(255);
					//s.text("Deal Damage To Opposing", wi/3.2, he/1.45);
					//s.text("Cores To Earn Credits", wi/3.1, he/1.4);
					s.textSize(wi / 40);


					for (let a = 1; a <= 4; a = a + 1) {
						s.fill(this.playerColors[a - 1][0], this.playerColors[a - 1][1], this.playerColors[a - 1][2], this.playerColors[a - 1][3]);
						if (this.app.playerSpotsInGameRoom[a] !== null) {
							switch (this.app.playerSpotsInGameRoom[a].gamePhase) {
								case 'AI':
									s.text("Orders Submitted", wi / 35, he / 1.75 + (a - 1) * si);
									break
								case "TITLE":
									s.text("Loading", wi / 35, he / 1.75 + (a - 1) * si);
									break
								case "PLACEMENT":
									if (this.app.playerSpotsInGameRoom[a].ordersSubmitted) {
										s.text("Orders Submitted", wi / 35, he / 1.75 + (a - 1) * si);
									} else {
										s.text("Making Turn", wi / 35, he / 1.75 + (a - 1) * si);
									}
									break
								case "REVIEW":
									if (this.app.playerSpotsInGameRoom[a].ordersSubmitted) {
										s.text("Orders Submitted", wi / 35, he / 1.75 + (a - 1) * si);
									} else {
										s.text("Reviewing Board", wi / 35, he / 1.75 + (a - 1) * si);
									}
									break
								default:
									s.text("Hypothesizing", wi / 35, he / 1.75 + (a - 1) * si);
							}

						}
						else {
							s.text("Waiting For Player", wi / 35, he / 1.75 + (a - 1) * si);
						}
					}
					if (this.app.playerNumber == 2) {
						s.translate(-0, he / 2);
					}
					else if (this.app.playerNumber == 3) {
						s.translate(-wi / 2, 0);
					}
					else if (this.app.playerNumber == 4) {
						s.translate(-wi / 2, he / 2);
					}
					//Run the functions for drawing the players quadrant and the unit menu
					if (fullBoardTrigger == 0) {
						drawQuarterGrid(this.stage.grid, this.playerColors, this.app.playerNumber);
					}
					else {
						drawGrid(wi, he, si, this.playerColors, 150);
					}
					let board = this.app.game.board;
					for (var k = 0; k < board.length; k = k + 1) {
						for (var l = 0; l < board[k].length; l = l + 1) {
							if (board[k][l].length != 0) {
								for (var m = 0; m < board[k][l].length; m = m + 1) {
									let displayObject = this.app.game.gameObjects.get(board[k][l][m]);
									if (displayObject !== undefined) {
										if (displayObject.player == this.app.playerNumber || (fullBoardTrigger != 0 && this.app.turnNumber > 1)) {
											drawDisplayObject(displayObject, l, k, si, this.playerColors, animate);
										}
									}
								}
							}
						}
					}
					//Target path hovering
					//Calculate which cell the mouse is currently hovering over and highlight it

					if (hoverX >= 0 && hoverX < 30 && hoverY >= 0 && hoverY < 20) {
						if (board[hoverY][hoverX].length != 0) {

							if (this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
								tooltip(hoverX, hoverY, board, this.t, wi, he, si, this.playerColors, this.simulationDisplayTurn, this.app);
							}
							else if (this.app.playerNumber == 2 && hoverX <= 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
								tooltip(hoverX, hoverY, board, this.t, wi, he, si, this.playerColors, this.simulationDisplayTurn, this.app);
							}
							else if (this.app.playerNumber == 3 && hoverX > 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
								tooltip(hoverX, hoverY, board, this.t, wi, he, si, this.playerColors, this.simulationDisplayTurn, this.app);
							}
							else if (this.app.playerNumber == 4 && hoverX > 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
								tooltip(hoverX, hoverY, board, this.t, wi, he, si, this.playerColors, this.simulationDisplayTurn, this.app);
							}
						}
					}
					s.fill(255, 100);
					s.noStroke();
					if (this.app.game.players[this.app.playerNumber - 1].baseCount < 2 && this.app.game.turnNumber === 1) {
						if (this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si * 2, si * 2);
						}
						else if (this.app.playerNumber == 2 && hoverX <= 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si * 2, si * 2);
						}
						else if (this.app.playerNumber == 3 && hoverX > 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si * 2, si * 2);
						}
						else if (this.app.playerNumber == 4 && hoverX > 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si * 2, si * 2);
						}
					}
					else {
						if (this.app.playerNumber == 1 && hoverX <= 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si, si);
							for (let i = 0; i < possibleTargets.length; i++) {
								s.fill(255, 240, 0, 85);
								s.noStroke();
								s.rect(possibleTargets[i][0] * si, possibleTargets[i][1] * si, si);
								if (possibleTargets.length == 1) {
									s.fill(255, 85);
									s.stroke(0, 85);
									s.textSize(wi / 40);
									s.textFont(titleFont);
									s.textAlign(s.CENTER);
									s.text("?", possibleTargets[i][0] * si + si / 2, possibleTargets[i][1] * si + si / 1.4);
									s.textAlign(s.LEFT);
								}
								//let tarX = possibleTargets[i][0];
								fullBoardTrigger = 1;
							}
						}
						else if (this.app.playerNumber == 2 && hoverX <= 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si, si);
							for (let i = 0; i < possibleTargets.length; i++) {
								s.fill(255, 240, 0, 105);
								s.noStroke();
								s.rect(possibleTargets[i][0] * si, possibleTargets[i][1] * si, si);
								if (possibleTargets.length == 1) {
									s.fill(255, 85);
									s.stroke(0, 85);
									s.textSize(wi / 40);
									s.textFont(titleFont);
									s.textAlign(s.CENTER);
									s.text("?", possibleTargets[i][0] * si + si / 2, possibleTargets[i][1] * si + si / 1.4);
									s.textAlign(s.LEFT);
								}
								fullBoardTrigger = 1;
								//let tarX = possibleTargets[i][0];
							}
						}
						else if (this.app.playerNumber == 3 && hoverX > 14 && hoverY < 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si, si);
							for (let i = 0; i < possibleTargets.length; i++) {
								s.fill(255, 240, 0, 105);
								s.noStroke();
								s.rect(possibleTargets[i][0] * si, possibleTargets[i][1] * si, si);
								if (possibleTargets.length == 1) {
									s.fill(255, 85);
									s.stroke(0, 85);
									s.textSize(wi / 40);
									s.textFont(titleFont);
									s.textAlign(s.CENTER);
									s.text("?", possibleTargets[i][0] * si + si / 2, possibleTargets[i][1] * si + si / 1.4);
									s.textAlign(s.LEFT);
								}
								fullBoardTrigger = 1;
								//let tarX = possibleTargets[i][0];
							}
						}
						else if (this.app.playerNumber == 4 && hoverX > 14 && hoverY >= 10 && hoverX < 30 && hoverY < 20) {
							s.rect(hoverX * si, hoverY * si, si, si);
							for (let i = 0; i < possibleTargets.length; i++) {
								s.fill(255, 240, 0, 105);
								s.noStroke();
								s.rect(possibleTargets[i][0] * si, possibleTargets[i][1] * si, si);
								if (possibleTargets.length == 1) {
									s.fill(255, 85);
									s.stroke(0, 85);
									s.textSize(wi / 40);
									s.textFont(titleFont);
									s.textAlign(s.CENTER);
									s.text("?", possibleTargets[i][0] * si + si / 2, possibleTargets[i][1] * si + si / 1.4);
									s.textAlign(s.LEFT);
								}
								fullBoardTrigger = 1;
							}
						}
						else {
							fullBoardTrigger = 0;
						}
					}
					if(s.keyIsPressed ){
						if(s.keyCode === 77){
							if(showMenu === true){
								showMenu = false;
							}
							else{
							showMenu = true;
						}
						s.keyIsPressed = false;
					}
				}
				if(showMenu === true && this.app.postGameMenu === false){
					s.noStroke();
					s.fill(0, 190);
					s.rect(0, 0, wi, he);
					s.stroke(255);
					s.strokeWeight(2);
					s.line(0, he / 4, wi * 2 / 7, he / 4);
					s.line(wi * 5 / 7, he / 4, wi, he / 4);
					s.line(0, he / 4 + he / 8, wi * 2 / 7, he / 4 + he / 8);
					s.line(wi * 5 / 7, he / 4 + he / 8, wi, he / 4 + he / 8);
					s.line(0, he / 4 + 2 * he / 8, wi * 2 / 7, he / 4 + 2 * he / 8);
					s.line(wi * 5 / 7 , he / 4 + 2 * he / 8, wi , he / 4 + 2 * he / 8);
					bLeaveMatch.drawButton();
					bFullScreen.drawButton();
					bCloseMenu.drawButton();

					s.textAlign(s.CENTER);
					s.textSize(si*1.15);
					s.fill(255);
					s.stroke(0);
					s.textFont(titleFont);
					s.text("Leave Game", wi / 2 - 4, he / 4 + si * .4);
					s.text("Toggle Full Screen", wi / 2 - 4, he / 4 + si * .4 + he / 8);
					s.text("Close Menu", wi / 2-4, he / 4 + si*.4 + 2 * he / 8);

					s.textAlign(s.LEFT);
					//bFullScreen.drawButton();
					if (s.mouseIsPressed) {
						if (bLeaveMatch.isInRange(s.mouseX, s.mouseY)) {
							this.app.sendLeaveGame();
							showMenu = false;
						}
						else if (bFullScreen.isInRange(s.mouseX, s.mouseY)) {
							let fs = s.fullscreen();

							if(s.height !== window.screen.height){
								s.fullscreen(true);
								//s.resizeCanvas(tempConfig.canvasX, tempConfig.canvasY);
								s.resizeCanvas(window.screen.height * 1.5, window.screen.height);
						}
						else{
								s.fullscreen(false);
								s.resizeCanvas(tempConfig.canvasX, tempConfig.canvasY);
								//s.resizeCanvas(100, 100);
						}
						buttonMaker = 1;
						buttonMakerTwo = 1;
					}
					else if (bCloseMenu.isInRange(s.mouseX, s.mouseY)) {
						showMenu = false;
					}
					s.mouseIsPressed = false;
				}
			}
			simulationCountdown = 0;
		}//Bug Fix: Underneath buttons need to be disabled
		else if (this.app.gamePhase == "SIMULATION" || this.app.clientState === 'SPECTATOR' || this.app.clientState === 'DEFEATED_PLAYER') {
			if(simulationCountdown < 150){

			}
			else{
			if (animate >= 10 && this.t < (Object.keys(this.simulationDisplayTurn.tick).length - 1)) {
				this.t = this.t + 1; //Leaves User On Final Tick #
				animate = 0;
			}
		}
			drawGrid(wi, he, si, this.playerColors, simulationCountdown);
			if (this.t < Object.keys(this.simulationDisplayTurn.tick).length && this.t > 0) {
				for (let p = 0; p < 4; p = p + 1) {
					if (this.simulationDisplayTurn.tick[this.t].players[p].victoryCondition == - 1) {
						if (p == 1) {
							s.translate(0, he / 2);
						}
						else if (p == 2) {
							s.translate(wi / 2, 0);
						}
						else if (p == 3) {
							s.translate(wi / 2, he / 2);
						}
						s.fill(0, 220);
						s.noStroke();
						s.rect(0, 0, wi / 2, he / 2);
						if (p == 1) {
							s.translate(0, -he / 2);
						}
						else if (p == 2) {
							s.translate(-wi / 2, 0);
						}
						else if (p == 3) {
							s.translate(-wi / 2, -he / 2);
						}
					}
				}
				b = this.simulationDisplayTurn.tick[this.t].board;
				for (var k = 0; k < b.length; k = k + 1) {
					for (var l = 0; l < b[k].length; l = l + 1) {
						if (b[k][l].length != 0) {
							for (var m = 0; m < b[k][l].length; m = m + 1) {
								let displayObject = this.simulationDisplayTurn.tick[this.t].gameObjects.get(b[k][l][m]);
								if (displayObject !== undefined) {
									drawDisplayObject(displayObject, l, k, si, this.playerColors, animate);
									if (displayObject.objCategory === "Units" || displayObject.objCategory === "Bases") {
										if (displayObject.collidedWith.length > 0) {
											if (displayObject.collidedWith[0] == true) {
												drawCollision(l, k, si, displayObject.collidedWith[1], animate, this.playerColors);
											}
										}
									}
								}
							}
						}
					}
				}
				//Tooltip Section
				if (hoverX >= 0 && hoverX < 30 && hoverY >= 0 && hoverY < 20) {
					tooltip(hoverX, hoverY, b, this.t, wi, he, si, this.playerColors, this.simulationDisplayTurn, this.app);
				}

				for (let p = 0; p < 4; p = p + 1) {
					if (this.simulationDisplayTurn.tick[this.t].players[p].victoryCondition == - 1) {
						s.textFont(titleFont);
						if (p == 1) {
							s.translate(0, he / 2);
						}
						else if (p == 2) {
							s.translate(wi / 2, 0);
						}
						else if (p == 3) {
							s.translate(wi / 2, he / 2);
						}
						s.textSize(si * 1.6);
						s.fill(this.playerColors[p][0], this.playerColors[p][1], this.playerColors[p][2], 255);
						s.stroke(0);
						s.text("Defeated", wi / 8, he / 4);
						if (this.simulationDisplayTurn.tick[this.t].players[p].victoryCondition == - 1) {
							s.textFont(titleFont);
							if (p == 1) {
								s.translate(0, -he / 2);
							}
							else if (p == 2) {
								s.translate(-wi / 2, 0);
							}
							else if (p == 3) {
								s.translate(-wi / 2, -he / 2);
							}
						}
					}
					else if (this.simulationDisplayTurn.tick[this.t].players[p].victoryCondition == 1) {
						if(gameOver === 0){
							postGameMenuTimer = 0;
						}
						gameOver = 1;
						//Victory Sequence, fix it.
						s.strokeWeight(1);
						s.noFill();
						let refx = s.width / 2;
						let refy = s.height / 2;
						let theta = 0;
						let phase = 0;
						let meh = 0;
						let osx = 0;
						let osy = 0;
						let wave = 12;
						let rad = 360;
						let radius = s.height / 4 + s.height * s.sin(s.radians(this.delay));
						for (let i = 0; i < rad; i = i + 1) {
							s.stroke(255, 20);
							theta = i * (360 / rad);
							phase = ((Math.PI) / rad);
							meh = (radius * 1.5 + 11.5) * s.sin(wave * theta + phase) * s.cos(phase);
							osx = (s.width / 25 + meh) * s.cos(theta);
							osy = (s.width / 25 + meh) * s.sin(theta);
							s.strokeWeight(8);
							s.point(osx + refx, osy + refy);
							s.strokeWeight(6);
							s.point(osx + refx, osy + refy);
							s.strokeWeight(3);
							s.point(osx + refx, osy + refy);
							s.stroke(255, 255);
							s.strokeWeight(1);
							s.point(osx + refx, osy + refy);
						}
						s.textFont(titleFont);
						s.textSize(si * 3.6);
						s.fill(255, 255);
						s.stroke(0);
						s.text("Player " + (p + 1), wi / 4, he / 2.2);
						s.text("Is Victorious", wi / 13, he / 1.5);
						postGameMenuTimer = postGameMenuTimer + 1;
						if(postGameMenuTimer > 800){
							this.app.postGameMenu = true;
						}
					}
				}
			}
			animate = animate + (.6 + s.deltaTime / 70);//IMPORTANT - ANIMATION SPEED

					if (this.t === Object.keys(this.simulationDisplayTurn.tick).length - 1) {
						bSubmit.submitted = false;
						bSubmit.confirmed = false;

						this.app.onSimulationPhaseEnd();

						if (gameOver == 0 && this.app.clientState !== "SPECTATOR" && this.app.clientState !== "DEFEATED_PLAYER") {
							this.app.setGamePhase("REVIEW");
							sideBarGrowth = 1;
							sideBarMenu = false;
						}
					}
					if(s.keyIsPressed ){
						//console.log(s.keyCode);
						if(s.keyCode === 77){
							if(showMenu === true){
								showMenu = false;
							}
							else{
							showMenu = true;
						}
						s.keyIsPressed = false;

						}
					}
					if(showMenu === true && this.app.postGameMenu === false){
						s.noStroke();
						s.fill(0, 190);
						s.rect(0, 0, wi, he);
						s.stroke(255);
						s.strokeWeight(2);
						s.line(0, he / 4, wi * 2 / 7, he / 4);
						s.line(wi * 5 / 7, he / 4, wi, he / 4);
						s.line(0, he / 4 + he / 8, wi * 2 / 7, he / 4 + he / 8);
						s.line(wi * 5 / 7, he / 4 + he / 8, wi, he / 4 + he / 8);
						s.line(0, he / 4 + 2 * he / 8, wi * 2 / 7, he / 4 + 2 * he / 8);
						s.line(wi * 5 / 7 , he / 4 + 2 * he / 8, wi , he / 4 + 2 * he / 8);
						bLeaveMatch.drawButton();
						bFullScreen.drawButton();
						bCloseMenu.drawButton();

						s.textAlign(s.CENTER);
						s.textSize(si*1.15);
						s.fill(255);
						s.stroke(0);
						s.textFont(titleFont);
						s.text("Leave Game", wi / 2 - 4, he / 4 + si * .4);
						s.text("Toggle Full Screen", wi / 2 - 4, he / 4 + si * .4 + he / 8);
						s.text("Close Menu", wi / 2-4, he / 4 + si*.4 + 2 * he / 8);

						s.textAlign(s.LEFT);
						//bFullScreen.drawButton();
						if (s.mouseIsPressed) {
							if (bLeaveMatch.isInRange(s.mouseX, s.mouseY)) {
								this.app.sendLeaveGame();
								showMenu = false;
							}
							else if (bFullScreen.isInRange(s.mouseX, s.mouseY)) {
								let fs = s.fullscreen();

								if(s.height !== window.screen.height){
									s.fullscreen(true);
									//s.resizeCanvas(tempConfig.canvasX, tempConfig.canvasY);
									s.resizeCanvas(window.screen.height * 1.5, window.screen.height);
							}
							else{
									s.fullscreen(false);
									s.resizeCanvas(tempConfig.canvasX, tempConfig.canvasY);
									//s.resizeCanvas(100, 100);
							}
							buttonMaker = 1;
							buttonMakerTwo = 1;
						}
						else if (bCloseMenu.isInRange(s.mouseX, s.mouseY)) {
							showMenu = false;
						}
						s.mouseIsPressed = false;
					}
				}
				if(simulationCountdown < 150){
					s.textSize(si * 3);
					s.textFont(titleFont);
					s.fill(255);
					s.textAlign(s.CENTER);
					if(simulationCountdown < 50){
						s.text("3", wi/2, he/1.8125);
					}
					else if(simulationCountdown < 100){
						s.text("2", wi/2, he/1.8125);
					}
					else{
						s.text("1", wi/2, he/1.8125);
					}
					s.textAlign(s.LEFT);
					simulationCountdown = simulationCountdown + 1;
				}
			}
			else if (this.app.gamePhase === "REVIEW" && this.app.game.players[this.app.playerNumber - 1].victoryCondition !== -1) {
				if (sideBarGrowth > 0.8) {
					sideBarGrowth = sideBarGrowth - .003;
				}
				else {
					sideBarMenu = true;
				}
				wi = s.width * sideBarGrowth;
				si = wi / 30;
				he = si * 20;
				//this.t = Object.keys(this.simulationDisplayTurn.tick).length;
				let scrubDiff = ((7.15 * s.width/10) / 99);
				//scrubber.xx = (7.15 * s.width/10);
				this.t = 1 + s.int(scrubber.xx/scrubDiff);

				drawGrid(wi, he, si, this.playerColors, 150);
					for (let p = 0; p < 4; p = p + 1) {
						if (this.app.game.players[p].victoryCondition === -1) {
							if (p === 1) {
								s.translate(0, he / 2);
							}
							else if (p === 2) {
								s.translate(wi / 2, 0);
							}
							else if (p === 3) {
								s.translate(wi / 2, he / 2);
							}
							s.fill(0, 220);
							s.noStroke();
							s.rect(0, 0, wi / 2, he / 2);
							if (p === 1) {
								s.translate(0, -he / 2);
							}
							else if (p === 2) {
								s.translate(-wi / 2, 0);
							}
							else if (p === 3) {
								s.translate(-wi / 2, -he / 2);
							}
						}
					}
					b = this.simulationDisplayTurn.tick[this.t].board;
					for (var k = 0; k < b.length; k = k + 1) {
						for (var l = 0; l < b[k].length; l = l + 1) {
							if (b[k][l].length != 0) {
								for (var m = 0; m < b[k][l].length; m = m + 1) {
									let displayObject = this.simulationDisplayTurn.tick[this.t].gameObjects.get(b[k][l][m]);
									if (displayObject !== undefined) {
										if (displayObject.objCategory != "Projectiles" || this.t < 100) {
											drawDisplayObject(displayObject, l, k, si, this.playerColors, animate);
										}

									}
								}
							}
						}
					}
					hoverX = s.int(s.mouseX / si);
					hoverY = s.int(s.mouseY / si);
					if (hoverX >= 0 && hoverX < 30 && hoverY >= 0 && hoverY < 20) {
						tooltip(hoverX, hoverY, b, this.t, wi, he, si, this.playerColors, this.simulationDisplayTurn, this.app);
					}

					for (let p = 0; p < 4; p = p + 1) {
						if (this.app.game.players[p].victoryCondition == -1) {
							s.textFont(titleFont);
							if (p === 1) {
								s.translate(0, he / 2);
							}
							else if (p === 2) {
								s.translate(wi / 2, 0);
							}
							else if (p === 3) {
								s.translate(wi / 2, he / 2);
							}
							s.textSize(si * 1.6);
							s.fill(this.playerColors[p][0], this.playerColors[p][1], this.playerColors[p][2], 255);
							s.stroke(0);
							s.text("Defeated", wi / 8, he / 4);
							if (this.app.game.players[p].victoryCondition == -1) {
								s.textFont(titleFont);
								if (p === 1) {
									s.translate(0, -he / 2);
								}
								else if (p === 2) {
									s.translate(-wi / 2, 0);
								}
								else if (p === 3) {
									s.translate(-wi / 2, -he / 2);
								}
							}
						}
					}
					//HoverSquares
					s.fill(255, 100);
					s.noStroke();
					s.rect(hoverX * si, hoverY * si, si, si);

					///SIDE BAR FOR REVIEW MODE
					s.textFont(titleFont);
					s.fill(0, 150);
					s.noStroke();
					s.rect(wi, 0, s.width - wi, he);
					s.rect(0, he, s.width, s.width - he);
					if (sideBarMenu === true) {
						s.textSize(si * 1.05);
						s.fill(this.playerColors[this.app.playerNumber - 1][0], this.playerColors[this.app.playerNumber - 1][1], this.playerColors[this.app.playerNumber - 1][2], 255);
						s.stroke(0);
						s.text("Review Mode", wi + si / 3, si * 1.5);
						s.stroke(255);
						s.line(wi + si / 4, si * 2, s.width - si / 4, si * 2);
						s.textSize(si * .7);
						bPhaseOne.yy = si * 4;
						bPhaseOne.drawButton();

						s.fill(255);
						s.stroke(0);
						s.text("Deploy Machines", wi + si / 1.3, si * 4.9);
						s.textSize(si * 1.25);
						s.textAlign(s.CENTER);
						s.text("Score", wi + wi * .125, si * 8.5);
					//	s.line(wi + wi * .1, si * 8.5, s.width - wi * .1, si * 8.5)
						s.stroke(255);
						s.fill(255, 100);
						s.stroke(0);
						s.textFont(standardFont);
						s.textSize(si * .89);

						for (let a = 0; a < 4; a = a + 1) {
							s.fill(this.playerColors[a][0], this.playerColors[a][1], this.playerColors[a][2], this.playerColors[a][3]);
							if (this.app.game.players[a].victoryCondition === - 1) {
								s.text("Defeated", wi + wi * .125, si * 10 + a * si);
							}
							else {
								s.text("- " + this.app.game.players[a].score + " -", wi + wi * .125, si * 10 + a * si);
							}
						}
						s.textFont(titleFont);
						s.textAlign(s.LEFT);
						s.textSize(si * 1.1);
						drawCreditsSymbol(wi + si / .42, si * 16, si * 1.3, this.app.playerNumber, 10, this.playerColors);
						s.stroke(0);
						s.strokeWeight(2);
						s.text(":  " + this.app.game.players[this.app.playerNumber - 1].credits, wi + si / .25, si * 16.4);
						//Scrolling Bar;
						s.textSize(si * 1.7);
						s.textFont(standardFont);
						scroller = this.delay / 250;
						s.text("Damage Dealt: " + this.app.game.players[this.app.playerNumber - 1].damageDealtThisTurn, -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);
						scroller = (this.delay + 60) / 250;
						s.text("Machines Lost: " + this.app.game.players[this.app.playerNumber - 1].unitsLostThisTurn, -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);
						scroller = (this.delay + 120) / 250;
						s.text("Machines Destroyed: " + this.app.game.players[this.app.playerNumber - 1].unitsKilledThisTurn, -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);
						scroller = (this.delay - 60) / 250;
						s.text("Credits Earned: " + this.app.game.players[this.app.playerNumber - 1].creditsEarnedThisTurn, -s.width + 3 * s.width * (scroller - Math.floor(scroller)), s.height - si * 1.7);

						if (s.mouseIsPressed && bPhaseOne.isInRange(s.mouseX, s.mouseY)) {
							bPhaseOne.func.call(this.app, "PLACEMENT");
						}
					}
					if(s.keyIsPressed ){
						//console.log(s.keyCode);
						if(s.keyCode === 77){
							if(showMenu === true){
								showMenu = false;
							}
							else{
							showMenu = true;
						}
						s.keyIsPressed = false;

						}
					}
					if(showMenu === true && this.app.postGameMenu === false){

						wi = s.width;
						si = wi / 30;
						he = s.height;
						s.noStroke();
						s.fill(0, 190);
						s.rect(0, 0, wi, he);
						s.stroke(255);
						s.strokeWeight(2);
						s.line(0, he / 4, wi * 2 / 7, he / 4);
						s.line(wi * 5 / 7, he / 4, wi, he / 4);
						s.line(0, he / 4 + he / 8, wi * 2 / 7, he / 4 + he / 8);
						s.line(wi * 5 / 7, he / 4 + he / 8, wi, he / 4 + he / 8);
						s.line(0, he / 4 + 2 * he / 8, wi * 2 / 7, he / 4 + 2 * he / 8);
						s.line(wi * 5 / 7 , he / 4 + 2 * he / 8, wi , he / 4 + 2 * he / 8);
						bLeaveMatch.drawButton();
						bFullScreen.drawButton();
						bCloseMenu.drawButton();

						s.textAlign(s.CENTER);
						s.textSize(si*1.15);
						s.fill(255);
						s.stroke(0);
						s.textFont(titleFont);
						s.text("Leave Game", wi / 2 - 4, he / 4 + si * .4);
						s.text("Toggle Full Screen", wi / 2 - 4, he / 4 + si * .4 + he / 8);
						s.text("Close Menu", wi / 2-4, he / 4 + si*.4 + 2 * he / 8);

						s.textAlign(s.LEFT);
						//bFullScreen.drawButton();
						if (s.mouseIsPressed) {
							if (bLeaveMatch.isInRange(s.mouseX, s.mouseY)) {
								this.app.sendLeaveGame();
								showMenu = false;
							}
							else if (bFullScreen.isInRange(s.mouseX, s.mouseY)) {
								let fs = s.fullscreen();

								if(s.height !== window.screen.height){
									s.fullscreen(true);
									//s.resizeCanvas(tempConfig.canvasX, tempConfig.canvasY);
									s.resizeCanvas(window.screen.height * 1.5, window.screen.height);
							}
							else{
									s.fullscreen(false);
									s.resizeCanvas(tempConfig.canvasX, tempConfig.canvasY);
									//s.resizeCanvas(100, 100);
							}
							buttonMaker = 1;
							buttonMakerTwo = 1;
						}
						else if (bCloseMenu.isInRange(s.mouseX, s.mouseY)) {
							showMenu = false;
						}
						s.mouseIsPressed = false;
					}
				}

				if(sideBarMenu){
					 //Only trigger the drag bar once the screen has shrunk and review mode is officially underway.
					 //Draw the backdrop, grey line
					if(dragging === 1){
						scrubber.scrubberIsPressed();
						scrubber.moveScrubber(s.mouseX);
						//if(scrubber.isInRange(s.mouseX, s.mouseY) === false){
						if(s.mouseIsDragged === false || s.mouseIsPressed === true){
							dragging = 0;
						}
					}
					else{
						scrubber.isPressed = false;
					}
					if(s.mouseIsPressed && scrubber.isInRange(s.mouseX, s.mouseY)){
						dragging = 1;
					}
					scrubber.drawScrubber();

					//this.t = this.t
				}
		}
				//End Review Phase
				//Begin Optional Statistics Phase
				else if (this.app.gamePhase === "STATS") {
					s.background(0);
					s.tint(105, 105, 105, 80+(1+s.cos(this.delay/5.5))*30);
					s.image(imgTwo, 0, 0, s.height * 1.6, s.height);
					s.noFill();
					s.stroke(255);
					s.text("EXIT", 8.15 * s.width / 10, 1.85 * s.height / 20);
					s.rect(8 * s.width / 10, 1 * s.height / 25, 1 * s.width / 10, 1 * s.width / 20);
					if (s.mouseIsPressed && s.mouseX < 8 * s.width / 10 + 1 * s.width / 10 && s.mouseX > 8 * s.width / 10 && s.mouseY < 1 * s.height / 25 + 1 * s.width / 20 && s.mouseY > 1 * s.height / 25) {
						this.app.sendLeaveGame();
					}
					s.textFont(titleFont);
					s.fill(255,255);
					s.stroke(0);
					s.textAlign(s.CENTER);
					s.textSize(si*2);
					s.text("STATISTICS", s.width/2, s.height/8.8)
					s.textSize(si);

					for(let r = 0; r < 6 ; r = r + 1){
						s.stroke(255);
						s.line(s.width/15,s.height/6+r*s.height/6.5,s.width-s.width/15,s.height/6+r*s.height/6.5)
						for(let c = 0; c < 7; c = c + 1){
							s.stroke(255);
							s.line(s.width/15+(c*13/6)*s.width/15,s.height/6,s.width/15+(c*13/6)*s.width/15,s.height/6+5*s.height/6.5)
							s.stroke(0);
							if(c === 0){
								if(r === 0){
									s.text("PLAYER",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5);
								}
								else if (r < 5){
									s.fill(this.playerColors[r - 1][0], this.playerColors[r - 1][1], this.playerColors[r - 1][2], 255);
									s.textSize(si/1.5);
									if (this.app.playerSpotsInGameRoom[r].playerType == 'Human') {
										s.text(this.app.playerSpotsInGameRoom[r].alias,  s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5);
									}
									else{
										s.text(this.app.playerSpotsInGameRoom[r].playerType, s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5);
								  }
									s.textSize(si);
								}
							}
							else if(c === 1){
								if(r === 0){
									s.textSize(si/1.5);
									s.text("Units",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.5)*s.height/6.5);
									s.text("Killed",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.7)*s.height/6.5);
									s.textSize(si);
								}
								else if (r < 5){
									s.fill(this.playerColors[r - 1][0], this.playerColors[r - 1][1], this.playerColors[r - 1][2], 255);
									s.text(this.app.game.players[r-1].unitsKilledTotal, s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5)
								}
							}
							else if(c === 2){
								if(r === 0){
									s.textSize(si/1.5);
									s.text("Units",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.5)*s.height/6.5);
									s.text("Lost",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.7)*s.height/6.5);
									s.textSize(si);
								}
								else if (r < 5){
									s.fill(this.playerColors[r - 1][0], this.playerColors[r - 1][1], this.playerColors[r - 1][2], 255);
									s.text(this.app.game.players[r-1].unitsLostTotal, s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5)
								}
							}
							else if(c === 3){
								if(r === 0){
									s.textSize(si/1.5);
									s.text("Damage",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.5)*s.height/6.5);
									s.text("Dealt",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.7)*s.height/6.5);
									s.textSize(si);
								}
								else if (r < 5){
									s.fill(this.playerColors[r - 1][0], this.playerColors[r - 1][1], this.playerColors[r - 1][2], 255);
									s.text(this.app.game.players[r-1].damageDealtTotal, s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5)
								}
							}
							else if(c === 4){
								if(r === 0){
									s.textSize(si/1.5);
									s.text("Credits",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.5)*s.height/6.5);
									s.text("Earned",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.7)*s.height/6.5);
									s.textSize(si);
								}
								else if (r < 5){
									s.fill(this.playerColors[r - 1][0], this.playerColors[r - 1][1], this.playerColors[r - 1][2], 255);
									s.text(this.app.game.players[r-1].creditsEarnedTotal, s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5)
								}
							}
							else if(c === 5){
								if(r === 0){
									s.textSize(si/1.5);
									s.text("Favorite",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.5)*s.height/6.5);
									s.text("Unit",s.width/15+((c+.5)*13/6)*s.width/15,s.height/6+(r+.7)*s.height/6.5);
									s.textSize(si);
								}
								else if (r < 5){
									s.fill(this.playerColors[r - 1][0], this.playerColors[r - 1][1], this.playerColors[r - 1][2], 255);
									s.textSize(si/1.8);
									s.text(this.app.game.players[r-1].frequentUnit, s.width/15.9+((c+.5)*13/6)*s.width/15,s.height/6+(r+.6)*s.height/6.5)
									s.textSize(si);
								}
							}
						}
					}

					s.textAlign(s.LEFT);
				}


				if(this.app.postGameMenu === true){
					s.noStroke();
					s.fill(0,190);
					s.rect(0,0,wi,he);
					s.stroke(255);
					s.strokeWeight(2);
					s.line(0,he/4,wi*2/7,he/4);
					s.line(wi*5/7,he/4,wi,he/4);
					s.line(0,he/4+he/8,wi*2/7,he/4+he/8);
					s.line(wi*5/7,he/4+he/8,wi,he/4+he/8);
					bLeaveMatch.drawButton();
					bStatsPage.drawButton();

					s.textAlign(s.CENTER);
					s.textSize(si*1.15);
					s.fill(255);
					s.stroke(0);
					s.textFont(titleFont);
					s.text("Leave Game", wi/2-4, he/4 + si*.4);
					s.text("Statistics", wi/2-4, he/4 + si*.4 + he/8);
				//	s.text("Statistics", wi/2-4, he/4 + 2*si*.4 + he/8);
					s.textAlign(s.LEFT);
					//bFullScreen.drawButton();
					if (s.mouseIsPressed) {
						if (bLeaveMatch.isInRange(s.mouseX, s.mouseY)) {
							this.app.sendLeaveGame();
							this.app.postGameMenu = false;
						}
						else if (bStatsPage.isInRange(s.mouseX, s.mouseY)) {
							this.app.setGamePhase("STATS");
							this.app.postGameMenu = false;
					}
					s.mouseIsPressed = false;
				}


				}
				//Begin Spectator Mode
				if (this.app.clientState === "SPECTATOR" || this.app.clientState === "DEFEATED_PLAYER") {

					s.stroke(0, 100);
					s.fill(255, 100);
					s.strokeWeight(2);
					s.textSize(wi / 15);
					s.textFont(titleFont);
					s.textAlign(s.CENTER);
					s.text("SPECTATOR MODE", s.width / 2, s.height / 1.87);
					s.textAlign(s.LEFT);
				}
				//Load Screen Logic Below
				if (this.app.turnIsIn === true) {

					runLoadScreen(255);

				}
				if (this.app.simulationRun === true) {
					this.app.turnIsIn = false;
					this.app.simulationRun = false;
				}

				if (this.app.gamePhase === 'LOADING') {
					runLoadScreen(255);
					input.remove();
				}
				//EXPERIMENT
				s.mouseIsPressed = false;
			}



			//FUNCTIONS BELOW THIS LINE
			class Scrubber{
				constructor(x, y, xlen, ylen) {
					this.isPressed = false;
					this.xx = x;
					this.yy = y;
					this.xlen = xlen;
					this.ylen = ylen;
				}
				drawScrubber() {
					s.stroke(180, 255);
					if(this.isPressed){
						s.fill(180, 255);
						s.triangle(0, this.yy + this.ylen/2, this.xlen/5, this.yy, this.xlen/5, this.yy + this.ylen);
						s.triangle(7.15 * s.width/10 + this.xlen, this.yy + this.ylen/2, 7.15 * s.width/10 + this.xlen - this.xlen/5, this.yy, 7.15 * s.width/10 + this.xlen - this.xlen/5, this.yy + this.ylen);
					}
					s.line(0, this.yy + this.ylen/2, 7.15 * s.width/10 + this.xlen, this.yy + this.ylen/2);
					s.stroke(0, 255);
					s.fill(255,255)
					s.strokeWeight(3);
					s.rect(this.xx, this.yy, this.xlen, this.ylen);

					if (this.isPressed === true) {
						s.stroke(0, 255);
						s.fill(155, 155, 155, 155);
						s.rect(this.xx, this.yy, this.xlen, this.ylen);
					}
					s.strokeWeight(1);
					s.textFont(standardFont);
					s.fill(0);
					s.textSize(si/2.2)
					s.textAlign(s.CENTER);
					s.text("TIMELINE", this.xx + this.xlen/2, this.yy + this.ylen/1.3);
					s.textAlign(s.LEFT);
				}
				moveScrubber(mouseX){
					//If loop with the min and max point of the bar.
					if((mouseX - (this.xlen / 2)) <= 0){
						this.xx = 0;
					}
					else if((mouseX - (this.xlen / 2)) > 7.15 * s.width/10){
						this.xx = 7.15 * s.width / 10;
					}
					else{
						this.xx = mouseX - (this.xlen / 2);
					}
				}
				scrubberIsPressed(){
					this.isPressed = true;
				}
				isInRange(x, y) {
					if (x < (this.xx + this.xlen) && x > this.xx && y > this.yy && y < (this.yy + this.ylen)) {
						return true;
					}
					else {
						return false;
					}
				}
			}

			class Buttoned {
				constructor(x, y, xlen, ylen, text, func) {
					this.isPressed = false;
					this.xx = x;
					this.yy = y;
					this.text = text;
					this.xlen = xlen;
					this.ylen = ylen;
					this.func = func;
					this.confirmed = false;
					this.submitted = false;
				}
				drawButton() {
					s.stroke(255, 255, 255, 255);
					s.noFill();
					s.strokeWeight(3);
					s.rect(this.xx, this.yy, this.xlen, this.ylen);
					if (this.isPressed === true) {
						s.stroke(255, 255, 255, 255);
						s.fill(255, 255, 255, 100);
						s.rect(this.xx, this.yy, this.xlen, this.ylen);

					}
				}
				buttonHasBeenPressed() {
					if (this.submitted === false) {
						this.isPressed = true;
					}
				}
				submission() {
					this.submitted = true;
				}
				confirmation() {
					this.isPressed = false;
					this.confirmed = true;
				}
				isInRange(x, y) {
					if (x < (this.xx + this.xlen) && x > this.xx && y > this.yy && y < (this.yy + this.ylen)) {
						return true;
					}
					else {
						return false;
					}
				}
			}
			function getPossibleTargets(unitName, x, y, player) {

				let tempArray = Units[unitName].orientations[player];
				let finalArray = [];
				let counter = 0;
				let upperDistance = 30;
				let lowerDistance = 1;
				if (unitName === "Oscillator") {
					upperDistance = 2;
				}
				else if (unitName === "Resonator") {
					lowerDistance = 6;
					upperDistance = 19;
				}
				else if (unitName === "Tripwire") {
					//lowerDistance = 5;
					upperDistance = 6;
				}
				else if (unitName === "Ballast") {
					//lowerDistance = 5;
					upperDistance = 2;
				}
				else if (unitName === "RedShifter") {
					lowerDistance = 12;

					//upperDistance = 2;
				}
				else if (unitName === "BeamSplitter") {
					upperDistance = 9;
					//upperDistance = 2;
				}
				for (let i = 0; i < tempArray.length; i = i + 1) {
					let xx = lowerDistance;
					while ((tempArray[i][0] * xx + x) < 30 && (tempArray[i][0] * xx + x) >= 0 && xx < upperDistance) {
						let yy = 1;
						finalArray[counter] = [(tempArray[i][0] * xx + x), (tempArray[i][1] * xx + y)]
						counter = counter + 1;
						xx = xx + 1;
					}
				}
				if (unitName === "BeamSplitter") {
					let turningPoint = 8;
					if (player == 1) {
						for (let i = 1; i < 25; i = i + 1) {
							finalArray.push([x + turningPoint + i, y + turningPoint]);
							finalArray.push([x + turningPoint, y + turningPoint + i]);
						}
					}
					if (player == 2) {
						for (let i = 1; i < 25; i = i + 1) {
							finalArray.push([x + turningPoint + i, y - turningPoint]);
							finalArray.push([x + turningPoint, y - turningPoint - i]);
						}
					}
					if (player == 3) {
						for (let i = 1; i < 25; i = i + 1) {
							finalArray.push([x - turningPoint - i, y + turningPoint]);
							finalArray.push([x - turningPoint, y + turningPoint + i]);
						}
					}
					if (player == 4) {
						for (let i = 1; i < 25; i = i + 1) {
							finalArray.push([x - turningPoint - i, y - turningPoint]);
							finalArray.push([x - turningPoint, y - turningPoint - i]);
						}
					}

				}

				return finalArray;
			}

			function displayLobby(gameRoom, data, width, height, size, delay) {
				s.textSize(si);
				for (let p = 0; p < 4; p = p + 1) {

				}
			}
			function displayMatchmaking(data, width, height, size, delay, pColors) {
				s.background(255, 0, 128);
				//s.translate(0, height/20);
				let lightningTrigger = s.int(delay);
				s.tint(152, 255, 152, 90 + (1 + s.cos(delay / 5.5)) * 60);
				s.image(imgTwo, 0, 0, height * 1.6, height);
				s.noTint();
				//GLOW Begins
		/*		for(let g = 1; g  < 15 ; g = g + 1){
			  s.strokeWeight(g);
				s.stroke(255,40-g*2.5);
				s.noFill();
				s.rect(width / 4, height / 10, width / 2, 8 * height / 10);
			//	s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + (1 * 2) * 4 * height / 60, width / 4 - width / 15, height / 10 - 4 * height / 60 + (6 * 2) * 4 * height / 60);
				for(let r = 1; r < 6; r = r + 1){
				/*	s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60, width / 4, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60);
					s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60, width / 4, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60);

					s.line(3 * width / 4 + width / 15, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60, 3 * width / 4, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60);
					s.line(3 * width / 4 + width / 15, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60, 3 * width / 4, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60);*/

			/*		s.line(width / 4, height / 10 + (r) * 8 * height / 60, 3 * width / 4, height / 10 + (r) * 8 * height / 60);
				}
}*/

        s.strokeWeight(10);

 				s.translate(width / 170, height / 170);
				s.stroke(0,255);
 				s.noFill();
 				s.rect(width / 4, height / 10, width / 2, 8 * height / 10);
			//	s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + (1 * 2) * 4 * height / 60, width / 4 - width / 15, height / 10 - 4 * height / 60 + (6 * 2) * 4 * height / 60);
				for(let r = 1; r < 6; r = r + 1){
// 				/*	s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60, width / 4, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60);
// 					s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60, width / 4, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60);
//
// 					s.line(3 * width / 4 + width / 15, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60, 3 * width / 4, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60);
// 					s.line(3 * width / 4 + width / 15, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60, 3 * width / 4, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60);*/
//
 					s.line(width / 4, height / 10 + (r) * 8 * height / 60, 3 * width / 4, height / 10 + (r) * 8 * height / 60);
			}
				s.translate(-width / 170, -height / 170);

				s.strokeWeight(2);
				s.stroke(255);
				s.noFill();
				s.rect(width / 4, height / 10, width / 2, 8 * height / 10);
			//	s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + (1 * 2) * 4 * height / 60, width / 4 - width / 15, height / 10 - 4 * height / 60 + (6 * 2) * 4 * height / 60);
				for(let r = 1; r < 6; r = r + 1){
				/*	s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60, width / 4, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60);
					s.line(width / 4 - width / 15, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60, width / 4, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60);

					s.line(3 * width / 4 + width / 15, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60, 3 * width / 4, height / 10 - 4 * height / 60 + (r * 2) * 4 * height / 60);
					s.line(3 * width / 4 + width / 15, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60, 3 * width / 4, height / 10 - 4 * height / 60 + ((r + 1) * 2) * 4 * height / 60);*/

					s.line(width / 4, height / 10 + (r) * 8 * height / 60, 3 * width / 4, height / 10 + (r) * 8 * height / 60);
				}
				s.textFont(titleFont);
				s.strokeWeight(1);
				s.stroke(0);
				s.fill(255, 255);
				s.textAlign(s.CENTER);
				s.translate(width / 190, height / 190);
				s.stroke(0);
				s.textSize(size * 1.6);
				s.fill(0, 255);
				s.text("Matchmaking", width / 2, height / 13);
				s.textSize(size * 1.2);

				s.text("Enter Join Code:", width * 2.3 / 5, 3.69 * height / 20);

				s.text("Create New Lobby", width / 2, 6.37 * height / 20);

				s.text("Join Hot Seat", width / 2, 9.04 * height / 20);

				s.text("How To Play", width / 2, 11.7 * height / 20);

				s.text("ElixArcade", width / 2, 14.4 * height / 20);

				s.text("Feedback Form", width / 2, 17.1 * height / 20);

				s.translate(-width / 190, -height / 190);
				s.fill(255, 255);
				s.textSize(size * 1.6);
				s.text("Matchmaking", width / 2, height / 13);
				s.textSize(size * 1.2);
				s.text("Enter Join Code:", width * 2.3 / 5, 3.69 * height / 20);

				s.text("Create New Lobby", width / 2, 6.37 * height / 20);

				s.text("Join Hot Seat", width / 2, 9.04 * height / 20);

				s.text("How To Play", width / 2, 11.7 * height / 20);

				s.text("ElixArcade", width / 2, 14.4 * height / 20);

				//s.text("Players Online: " + data.onlinePlayerCount, width / 2, 17.1 * height / 20);
				s.text("Feedback Form", width / 2, 17.1 * height / 20);
				//s.textAlign(s.LEFT);
				//s.translate(0, -height/20);
			}

			function tooltip(hoverX, hoverY, b, tick, wi, he, si, pColors, sdt, app) {
				if (b[hoverY][hoverX].length != 0) {
					if (app.gamePhase != "PLACEMENT") {
						hoverObject = sdt.tick[tick].gameObjects.get(sdt.tick[tick].board[hoverY][hoverX][0]);
					}
					else {
						hoverObject = app.game.gameObjects.get(b[hoverY][hoverX][0]);
					}
					if (hoverObject && hoverObject.objCategory != "Projectiles") {
						s.stroke(0);
						s.strokeWeight(3);
						s.fill(255, 125);
						let transX = 0;
						let transY = 0;
						if (hoverX >= wi / (si * 2) && hoverY < he / (si * 2)) {
							transX = 1;
						}
						else if (hoverX >= wi / (si * 2) && hoverY >= he / (si * 2)) {
							transX = 1;
							transY = 1;
						}
						else if (hoverX < wi / (si * 2) && hoverY >= he / (si * 2)) {
							transY = 1;
						}
						s.translate(-si * 5 * transX, -si * 4 * transY);
						s.rect(hoverX * si + si, hoverY * si + si, si * 4, si * 3);
						s.fill(pColors[hoverObject.player - 1][0], pColors[hoverObject.player - 1][1], pColors[hoverObject.player - 1][2], pColors[hoverObject.player - 1][3]);
						s.stroke(0);
						s.textFont(standardFont);
						s.textSize(si / 2.5);
						s.text(hoverObject.fullName, hoverX * si + si * 1.2, hoverY * si + si * 1.7);


						s.fill(120, 255);
						s.rect(hoverX * si + si * 1.2, hoverY * si + si * 2.05, si * 3.6, si / 2);
						s.noStroke();
						s.fill(pColors[hoverObject.player - 1][0], pColors[hoverObject.player - 1][1], pColors[hoverObject.player - 1][2], pColors[hoverObject.player - 1][3]);

						s.rect(hoverX * si + si * 1.2, hoverY * si + si * 2.05, si * 3.6 * (hoverObject.health / hoverObject.constructor.maxHealth), si / 2);
						//s.fill(155,255);
						s.stroke(0);
						s.noFill();
						s.rect(hoverX * si + si * 1.2, hoverY * si + si * 2.05, si * 3.6, si / 2);

						s.noFill();

						s.fill(0);
						s.textAlign(s.CENTER);
						s.textSize(si / 3);
						s.noStroke();
						s.text("Health: " + hoverObject.health, hoverX * si + si * 3, hoverY * si + si * 2.43);
						s.textAlign(s.LEFT);
						s.fill(pColors[hoverObject.player - 1][0], pColors[hoverObject.player - 1][1], pColors[hoverObject.player - 1][2], pColors[hoverObject.player - 1][3]);

						if (hoverObject.objCategory === "Units") {

							s.textSize(si / 3.8);
							s.stroke(0);

							s.text("Damage Dealt: " + (hoverObject.damageDealt), hoverX * si + si * 1.3, hoverY * si + si * 3.1);
							if (hoverObject.lifeSpan === 0) {
								s.text("Rounds Active: " + 1, hoverX * si + si * 1.3, hoverY * si + si * 3.6);
							}
							else {
								s.text("Rounds Active: " + hoverObject.lifeSpan, hoverX * si + si * 1.3, hoverY * si + si * 3.6);
							}
						}
						s.translate(si * 5 * transX, si * 4 * transY);
						if (hoverObject.objCategory != "Bases" && app.gamePhase != 2) {
							let pt = getPossibleTargets(hoverObject.constructor.name, hoverX, hoverY, hoverObject.player);
							for (let i = 0; i < pt.length; i++) {
								s.fill(255, 240, 0, 85);
								s.noStroke();
								s.rect(pt[i][0] * si, pt[i][1] * si, si);
								if (pt.length === 1) {
									s.fill(255, 85);
									s.stroke(0, 85);
									s.textSize(wi / 40);
									s.textFont(titleFont);
									s.textAlign(s.CENTER);
									s.text("?", pt[i][0] * si + si / 2, pt[i][1] * si + si / 1.4);
									s.textAlign(s.LEFT);
								}
							}
						}
					}
				}

			}

			function runLoadScreen(alpha) {
				s.noStroke();
				s.fill(0, alpha)
				s.rect(0, 0, s.width, s.height);
				s.fill(255);
				s.textFont(titleFont);
				s.textSize(s.width / 23);
				s.textAlign(s.CENTER);
				s.text("LOADING", s.width / 2, s.height / 1.8);
				s.textAlign(s.LEFT);
			}

			function showUnitDescription(unitType, player, wid, hei, siz) {
				let tranX = 0;
				let tranY = 0;
				if (player == 1) {
					tranY = 1
				}
				else if (player == 3) {
					tranX = 1;
					tranY = 1;
				}
				else if (player == 4) {
					tranX = 1;
				}
				s.translate(wid * tranX / 2, hei * tranY / 2);
				s.textFont(standardFont);
				s.textSize(siz / 2.8);
				s.fill(255);
				s.stroke(0);
				s.strokeWeight(0);
				s.text(Units[unitType].description, siz, siz * 5, siz * 12, siz * 12);
				//s.text("RIGHT HERE", siz*2, siz*7);
				s.translate(-wid * tranX / 2, -hei * tranY / 2);
			}

			function drawDisplayObject(displayObject, x, y, size, colors, a) {

				if (displayObject.identifier === "Base") {
					drawBase(x, y, displayObject.player, size, displayObject.health, displayObject.maxHealth, colors);
				}
				if (displayObject.identifier === "Ray") {
					drawRayTracer(x, y, displayObject.player, size, displayObject.health, Units["RayTracer"].maxHealth, colors);
				}
				if (displayObject.identifier === "Red") {
					drawRedShifter(x, y, displayObject.player, size, displayObject.health, Units["RayTracer"].maxHealth, colors);
				}
				if (displayObject.identifier === "Osc") {
					drawOscillator(x, y, displayObject.player, size, displayObject.health, Units["Oscillator"].maxHealth, colors);
				}
				if (displayObject.identifier === "Mag") {
					drawMaglev(x, y, displayObject.player, size, displayObject.health, Units["Maglev"].maxHealth, colors);
				}
				if (displayObject.identifier === "Jug") {
					drawJuggernode(x, y, displayObject.player, size, displayObject.health, Units["Juggernode"].maxHealth, colors);
				}
				if (displayObject.identifier === "Bea") {
					drawBeamSplitter(x, y, displayObject.player, size, displayObject.health, Units["Ballast"].maxHealth, colors);
				}
				if (displayObject.identifier === "Bal") {
					drawBallast(x, y, displayObject.player, size, displayObject.health, Units["Ballast"].maxHealth, colors);
				}
				if (displayObject.identifier === "Tri") {
					drawTripwire(x, y, displayObject.player, size, displayObject.health, Units["Tripwire"].maxHealth, colors, displayObject.tripped);
				}
				if (displayObject.identifier === "Cir") {
					drawResonator(x, y, displayObject.player, size, displayObject.health, Units["Resonator"].maxHealth, colors);
				}
				if (displayObject.identifier === "Int") {
					drawIntegrator(x, y, displayObject.player, size, displayObject.health, Units["Integrator"].maxHealth, colors, displayObject.lifeSpan);
				}
				if (displayObject.identifier === "JugProj") {
					drawJuggernodeProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, displayObject.damage, a);
				}
				if (displayObject.identifier === "RayProj") {
					drawRayTracerProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, a);
				}
				if (displayObject.identifier === "RedProj") {
					drawRedShifterProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, displayObject.damage, displayObject.distance, a);
				}
				if (displayObject.identifier === "OscProj") {
					drawOscillatorProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, a);
				}
				if (displayObject.identifier === "MagProj") {
					drawMaglevProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, displayObject.damage, a);
				}
				if (displayObject.identifier === "BeaProj") {
					drawBeamSplitterProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, displayObject.damage, a);
				}
				if (displayObject.identifier === "BalProj") {
					drawBallastProjectile(x, y, displayObject.player, size, colors, displayObject.damage, a);
				}
				if (displayObject.identifier === "TriProj") {
					drawTripwireProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, displayObject.damage, a);
				}
				if (displayObject.identifier === "CirProj") {
					drawResonatorProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, displayObject.damage, a);
				}
				if (displayObject.identifier === "IntProj") {
					drawIntegratorProjectile(x, y, displayObject.player, size, colors, displayObject.orientation, displayObject.damage, a);
				}
			}


			function drawRect(rect) {
				s.fill(rect.color[0], rect.color[1], rect.color[2]);
				s.rect(rect.x, rect.y, rect.size, rect.size);
			}

			function drawUnitMenu(pColors, player, scale) {
				s.textFont(titleFont);
				s.translate(0, -scale / 2);
				let wid = s.width;
				let hei = s.height;
				let siz = s.width / 30;
				s.strokeWeight(3);
				s.stroke(255);
				s.textSize(wid / 23);
				if (player == 3 || player == 4) {
					s.translate(-wid / 2, 0);
				}
				s.fill(225, 225, 225, 65);
				s.quad(wid / 2 + siz, siz, wid / 2 + siz, hei - siz, wid - siz, hei - siz, wid - siz, siz);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.line(wid / 2 + siz * 10, siz, wid / 2 + siz * 10, hei - siz);
				s.line(wid / 2 + siz * 12, siz, wid / 2 + siz * 12, hei - siz);
				s.stroke(0);
				//s.text("Unit",wid/2+siz*1.5,siz*2.25);
				s.text("Machine", wid / 2 + siz * 2.5, siz * 2.45);
				let refXX = wid / 2 + siz * 11.02;
				let refYY = siz * 2;
				//s.translate(size,size);
				s.noFill();
				s.strokeWeight(1.5);
				s.ellipse(refXX, refYY, siz * 1.4, siz * 1.4);
				s.strokeWeight(3);
				s.fill(0);
				s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.ellipse(refXX, refYY, siz * 1.25, siz * 1.25);

				//s.ellipse(refXX,refYY,siz*1.04,siz*1.04);
				//s.translate(-size,-size);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				//let refXX = wid/2+siz*10.42;
				//let refYY = siz*1.56;
				refXX = wid / 2 + siz * 10.92;
				refYY = siz * 1.56;
				let propOne = .2;
				let propTwo = .35;
				s.strokeWeight(1.5);
				s.beginShape();
				s.vertex(refXX, refYY);
				s.vertex(refXX + siz * propOne, refYY);
				s.vertex(refXX + siz * propOne, refYY + siz * propTwo);
				s.vertex(refXX + siz * (propOne + propTwo), refYY + siz * propTwo);
				s.vertex(refXX + siz * (propOne + propTwo), refYY + siz * (propOne + propTwo));
				s.vertex(refXX + siz * propOne, refYY + siz * (propOne + propTwo));
				s.vertex(refXX + siz * propOne, refYY + siz * (propOne + propTwo + propTwo));
				s.vertex(refXX, refYY + siz * (propOne + propTwo + propTwo));
				s.vertex(refXX, refYY + siz * (propOne + propTwo));
				s.vertex(refXX - siz * propTwo, refYY + siz * (propOne + propTwo));
				s.vertex(refXX - siz * propTwo, refYY + siz * propTwo);
				s.vertex(refXX, refYY + siz * propTwo);
				s.vertex(refXX, refYY);
				s.endShape();

				drawCreditsSymbol(refXX + siz * 2.08, refYY + siz / 2.2, siz, player, 10, pColors);
				s.textSize(wid / 37);
				s.translate(0, siz / 6);
				//Ray Tracer Button Decoration
				s.strokeWeight(2);
				s.stroke(0);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawRayTracer(16.9, 3.15, 0, siz, Units["RayTracer"].maxHealth, Units["RayTracer"].maxHealth, pColors);
				s.fill(255);
				s.strokeWeight(3);
				s.text("Ray Tracer", wid / 2 + siz * 3.75, siz * 4);
				s.textAlign(s.CENTER);
				s.text(Units["RayTracer"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["RayTracer"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);

				//Oscillator Button Decoration
				s.translate(0, scale * siz * 1);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawRedShifter(16.9, 3.15, 0, siz, Units["RedShifter"].maxHealth, Units["RedShifter"].maxHealth, pColors);

				s.fill(255);
				s.strokeWeight(3);
				s.text("Red Shifter", wid / 2 + siz * 3.75, siz * 4);
				s.textAlign(s.CENTER);
				s.text(Units["RedShifter"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["RedShifter"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);


				s.translate(0, -scale * siz * 1);
				s.translate(0, scale * siz * 2);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawOscillator(16.9, 3.15, 0, siz, Units["Oscillator"].maxHealth, Units["Oscillator"].maxHealth, pColors);

				s.strokeWeight(3);
				s.fill(255);
				s.text("Oscillator", wid / 2 + siz * 3.75, siz * 4);
				s.textAlign(s.CENTER);
				s.text(Units["Oscillator"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["Oscillator"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);

				s.translate(0, -scale * siz * 2);
				//Ballast Button Decoration
				s.translate(0, scale * siz * 3);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawBeamSplitter(16.9, 3.15, 0, siz, Units["BeamSplitter"].maxHealth, Units["BeamSplitter"].maxHealth, pColors);

				s.fill(255);
				s.strokeWeight(3);
				s.text("Beam Splitter", wid / 2 + siz * 3.75, siz * 4)
				s.textAlign(s.CENTER);
				s.text(Units["BeamSplitter"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["BeamSplitter"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);

				s.translate(0, -scale * siz * 3);

				s.translate(0, scale * siz * 4);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawBallast(16.9, 3.15, 0, siz, Units["Ballast"].maxHealth, Units["Ballast"].maxHealth, pColors);

				s.fill(255);
				s.strokeWeight(3);
				s.text("Ballast", wid / 2 + siz * 3.75, siz * 4)
				s.textAlign(s.CENTER);
				s.text(Units["Ballast"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["Ballast"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);

				s.translate(0, -scale * siz * 4);
				//Juggernode Button Decoration
				s.translate(0, scale * siz * 5);
				s.strokeWeight(2);
				s.stroke(0);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawJuggernode(16.9, 3.15, 4, siz, 400, 400, pColors);

				s.fill(255);
				s.strokeWeight(3);
				s.text("Juggernode", wid / 2 + siz * 3.75, siz * 4)
				s.textAlign(s.CENTER);
				s.text(Units["Juggernode"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["Juggernode"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);

				s.translate(0, -scale * siz * 5);
				s.translate(0, scale * siz * 6);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawTripwire(16.9, 3.15, 0, siz, 400, 400, pColors);

				s.fill(255);
				s.stroke(0);
				s.strokeWeight(3);
				s.text("Tripwire", wid / 2 + siz * 3.75, siz * 4)
				s.textAlign(s.CENTER);
				s.text(Units["Tripwire"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["Tripwire"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);
				s.translate(0, -scale * siz * 6);
				//Maglev Button Decoration
				s.translate(0, scale * siz * 7);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawMaglev(16.9, 3.15, 4, siz, 400, 400, pColors);

				s.fill(255);
				s.strokeWeight(3);
				s.text("Maglev", wid / 2 + siz * 3.75, siz * 4)
				s.textAlign(s.CENTER);
				s.text(Units["Maglev"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["Maglev"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);
				s.noFill();
				s.translate(0, -scale * siz * 7);
				//Circuit Breaker Button Decoration
				s.translate(0, scale * siz * 8);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawResonator(16.9, 3.15, 4, siz, 400, 400, pColors);

				s.fill(255);
				s.strokeWeight(3);
				s.text("Resonator", wid / 2 + siz * 3.75, siz * 4);
				s.textAlign(s.CENTER);
				s.text(Units["Resonator"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["Resonator"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);
				s.noFill();
				s.stroke(255);
				s.translate(0, -scale * siz * 8);

				s.translate(0, scale * siz * 9);
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.rect(siz * 16.9, siz * 3.15, siz, siz);
				drawIntegrator(16.9, 3.15, 4, siz, 400, 400, pColors);

				s.fill(255);
				s.strokeWeight(3);
				s.text("Integrator", wid / 2 + siz * 3.75, siz * 4)
				s.textAlign(s.CENTER);
				s.text(Units["Integrator"].maxHealth, wid / 2 + siz * 11, siz * 4);
				s.text(Units["Integrator"].cost, wid / 2 + siz * 13, siz * 4);
				s.textAlign(s.LEFT);
				s.noFill();
				s.stroke(255);

				s.translate(0, -scale * siz * 9);
				s.translate(0, -siz / 6);
				if (player == 3 || player == 4) {
					s.translate(wid / 2, 0);
				}

				//text("Report",28*this.wid/40,3*this.hei/40);
				//text("H",36*this.wid/40,3*this.hei/40);
				//text("C",38.5*this.wid/40,3*this.hei/40);
				s.translate(0, scale / 2);
			}

			function drawQuarterGrid(grid, pColors, player) {
				s.stroke(0, opacity);
				s.strokeWeight(2);
				let opacity = 227;
				let rectSize = s.width / 30;
				let rectSizeY = s.height / 20;
				for (var i = 0; i < grid.length; i++) {
					let rectY = i * (s.height / 20);
					for (var j = 0; j < grid[i].length; j++) {
						//let rectX = j* s.height / grid.length;
						let rectX = j * s.width / grid[i].length;
						if (i <= grid.length / 2 - 1 && j <= grid[i].length / 2 - 1) {
							s.fill(pColors[0][0], pColors[0][1], pColors[0][2], opacity)
							if (player == 1) {
								s.rect(rectX, rectY, rectSize, rectSizeY);
							}
						}
						else if (i >= grid.length / 2 - 1 && j <= grid[i].length / 2 - 1) {
							s.fill(pColors[1][0], pColors[1][1], pColors[1][2], opacity)
							if (player == 2) {
								s.rect(rectX, rectY, rectSize, rectSizeY);
							}
						}
						else if (i <= grid.length / 2 - 1 && j >= grid[i].length / 2 - 1) {
							s.fill(pColors[2][0], pColors[2][1], pColors[2][2], opacity)
							if (player == 3) {
								s.rect(rectX, rectY, rectSize, rectSizeY);
							}
						}
						else if (i >= grid.length / 2 - 1 && j >= grid[i].length / 2 - 1) {
							s.fill(pColors[3][0], pColors[3][1], pColors[3][2], opacity)
							if (player == 4) {
								s.rect(rectX, rectY, rectSize, rectSizeY);
							}
						}
					}
				}
			}



			function drawGrid(wi, he, si, pColors, countDown) {
				s.image(imgTwo, 0, 0, s.height * 1.6, s.height);
				s.noStroke();
				let opacity = 100 + 127*(countDown/150);
				//s.fill(pColors[0][0],pColors[0][1],pColors[0][2],pColors[0][3]);
				s.fill(pColors[0][0], pColors[0][1], pColors[0][2], opacity);
				s.rect(0, 0, wi / 2, he / 2);
				//s.fill(pColors[1][0],pColors[1][1],pColors[1][2],pColors[1][3]);
				s.fill(pColors[1][0], pColors[1][1], pColors[1][2], opacity);
				s.rect(0, he / 2, wi / 2, he / 2);
				s.fill(pColors[2][0], pColors[2][1], pColors[2][2], opacity);
				s.rect(wi / 2, 0, wi / 2, he / 2);
				s.fill(pColors[3][0], pColors[3][1], pColors[3][2], opacity);
				s.rect(wi / 2, he / 2, wi / 2, he / 2);
				s.stroke(0, opacity);
				s.strokeWeight(2);
				for (let i = 0; i <= 30; i = i + 1) {
					s.line(si * i, 0, si * i, he);
				}
				for (let j = 0; j <= 20; j = j + 1) {
					s.line(0, j * si, wi, j * si);
				}
			}


			function drawBase(x, y, player, size, health, max, pColors) {
				if (player == 1) {
					s.image(imgThree, x * size, y * size, size - .95, size - .95);
				}
				else if (player == 2) {
					s.image(imgFour, x * size, y * size, size - .95, size - .95);
				}
				else if (player == 3) {
					s.image(imgFive, x * size, y * size, size - .95, size - .95);
				}
				else if (player == 4) {
					s.image(imgSix, x * size, y * size, size - .95, size - .95);
				}
			}

			function drawRayTracer(x, y, player, size, health, max, pColors) {
				s.stroke(0);
				s.strokeWeight(2*(size/(s.width/30)));
				s.translate(x * size + size / 2, y * size + size / 2);
				let angle = 0;
				s.rotate(s.radians(angle));
				s.line(size / 2.5, size / 2.5, size / 6, size / 8);
				s.line(size / 2.5, size / 2.5, size / 8, size / 6);
				s.rotate(-s.radians(angle));
				angle = 90;
				s.rotate(s.radians(angle));
				s.line(size / 2.5, size / 2.5, size / 6, size / 8);
				s.line(size / 2.5, size / 2.5, size / 8, size / 6);
				s.rotate(-s.radians(angle));
				angle = 180;
				s.rotate(s.radians(angle));
				s.line(size / 2.5, size / 2.5, size / 6, size / 8);
				s.line(size / 2.5, size / 2.5, size / 8, size / 6);
				s.rotate(-s.radians(angle));
				angle = 270;
				s.rotate(s.radians(angle));
				s.line(size / 2.5, size / 2.5, size / 6, size / 8);
				s.line(size / 2.5, size / 2.5, size / 8, size / 6);
				s.rotate(-s.radians(angle));
				s.translate(-x * size - size / 2, -y * size - size / 2);
				s.fill(0);
				s.ellipse(x * size + size / 2, y * size + size / 2, size / 5, size / 5);
			}

			function drawRedShifter(x, y, player, size, health, max, pColors) {
				s.image(imgSeven, size * x + size / 80, size * y + size / 80, size - size / 40, size - size / 40);
			}

			function drawOscillator(x, y, player, size, health, max, pColors) {
				//s.translate(0,size/25);
				s.stroke(0);
				s.fill(0);
				s.translate(x * size + size / 2, y * size + size / 2);
				for (let angle = 0; angle < 360; angle = angle + 120) {
					s.strokeWeight(2*(size/(s.width/30)));
					s.rotate(s.radians(angle));
					s.scale(1.3);
					s.triangle(0, size / 10, size / 8, size / 6, -size / 8, size / 6);
					s.scale(1 / 1.3);
					s.rotate(-s.radians(angle));
					//s.strokeWeight(1);
					s.rotate(s.radians(angle + 30));
					s.line(0, 0, size / 2.9, 0);
					//s.line(size/3.5,-size/20,size/3.5,size/20);
					s.rotate(-s.radians(angle + 30));
				}
				s.noFill();
				s.strokeWeight(2*(size/(s.width/30)));
				s.ellipse(0, 0, size / 1.3, size / 1.3);
				s.translate(-x * size - size / 2, -y * size - size / 2);
				//	s.translate(0,-size/25);
			}

			function drawMaglev(x, y, player, size, health, max, pColors) {
				s.stroke(0);
				s.noFill();
				s.strokeWeight(2*(size/(s.width/30)));
				s.beginShape();
				for (let i = 0; i <= 361; i = i + 20) {
					s.curveVertex(size / 2 + size * x + (size / 3) * s.sin(7 * s.radians(i) + Math.PI / 2), size / 2 + size * y + (size / 2.5) * s.sin(s.radians(i)));
				}
				s.endShape();
			}

			function drawResonator(x, y, player, size, health, max, pColors) {
				s.stroke(0);
				s.strokeWeight(2*(size/(s.width/30)));
				s.noFill();
				s.translate(size * x + size / 2, size * y + size / 2);
				let c = 0;
				for (let r = 0; r <= size / 1.3; r = r + size / 6) {
					s.rotate(c * (Math.PI / 4));
					s.rect(-r / 2, -r / 2, r, r);
					s.rotate(-c * (Math.PI / 4));
					c = c + 1;
				}

				s.translate(-(size * x + size / 2), -(size * y + size / 2));
			}

			function drawIntegrator(x, y, player, size, health, max, pColors, life) {

				s.noStroke();
				for (let r = 0; r < life; r = r + .5) {
					s.fill(255, 80 - r * 3);
					s.ellipse(size * x + size / 2, size * y + size / 2 - size / 4, r * size / 9, r * size / 9);
				}
				s.fill(0);
				s.stroke(0);
				s.strokeWeight(1*(size/(s.width/30)));
				s.translate(size * x + size / 2, size * y + size / 2);
				s.beginShape();
				s.vertex(-size / 6, size / 2.4);
				s.vertex(-size / 6, size / 2.45);
				s.vertex(-size / 7, size / 2.6);
				s.vertex(size / 7, size / 2.6);
				s.vertex(size / 6, size / 2.45);
				s.vertex(size / 6, size / 2.4);
				s.vertex(-size / 6, size / 2.4);
				s.endShape();
				s.strokeWeight(2*(size/(s.width/30)));
				for (let l = 2 * size / 12.5; l < size / 1.6; l = l + size / 12.5) {
					s.line(-size / 12, -size / 6 + l, size / 12, -size / 5 + l);
				}
				s.fill(255);
				s.ellipse(0, -size / 4, size / 2.9, size / 2.9);
				s.translate(-(size * x + size / 2), -(size * y + size / 2));
			}

			function drawTripwire(x, y, player, size, health, max, pColors, tripped) {
				let iconSize = size / 3;
				s.stroke(0);
				s.strokeWeight(1*(size/(s.width/30)));
				s.fill(0);
				s.translate(x * size + size / 2, y * size + size / 2);
				s.translate(0, iconSize / 2);
				s.triangle(0, -iconSize * 1.6, iconSize * .7, 0, -iconSize * .7, 0);
				s.ellipse(0, 0, iconSize * 2.2, 10);
				s.triangle(-iconSize / 1.65, -iconSize / 1, -iconSize, 0, -(s.abs(iconSize - s.abs(iconSize / 1.2))), 0);
				s.triangle(iconSize / 1.65, -iconSize / 1, +iconSize, 0, (s.abs(iconSize - s.abs(iconSize / 1.2))), 0);
				s.noStroke();
				s.stroke(0);
				s.fill(0);
				s.line(-iconSize + 1, 0, iconSize - 1, 0);
				s.noStroke();
				s.ellipse(0, -iconSize / 4.5, 11, 8);
				s.ellipse(0, -iconSize / 7, 12, 9);
				s.stroke(0);
				s.ellipse(0, -iconSize / 4.5, 11, 8);
				s.noStroke();
				s.ellipse(0, -iconSize / 3.2, 12, 6);

				if (tripped) {
					s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				}
				else {
					s.fill(255);
				}
				s.ellipse(0, -iconSize / 2.3, iconSize / 2, iconSize / 2);
				s.translate(0, -iconSize / 2);
				s.translate(-(x * size + size / 2), -(y * size + size / 2));
			}

			function drawJuggernode(x, y, player, size, health, max, pColors) {
				s.stroke(0);
				s.strokeWeight(2*(size/(s.width/30)));
				s.translate(x * size + size / 2, y * size + size / 2);
				for (let angle = 0; angle < 360; angle = angle + 60) {
					s.rotate(s.radians(angle));
					s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
					s.noFill();
					s.triangle(0, 0, size / 2.7, 0, size * .5 / 2.7, size * .5 / 2.7 * s.sqrt(3));
					s.fill(0);
					s.ellipse(size / 2.7, 0, size / 10, size / 10);
					s.ellipse(size * .5 / 2.7, size * .5 / 2.7 * s.sqrt(3), size / 10, size / 10);
					s.rotate(-s.radians(angle));
				}
				s.fill(0, 255)
				s.ellipse(0, 0, size / 5, size / 5);
				s.translate(-x * size - size / 2, -y * size - size / 2);
			}
			function drawBeamSplitter(x, y, player, size, health, max, pColors) {

				s.stroke(0);
				s.strokeWeight(2*(size/(s.width/30)));
				s.fill(255);
				let refy = y * size;

				for (let count = 0; count < 7; count = count + 1) {
					let r = size * x + size / 6 + count * size / 9
					s.line(r, refy + size / 6, r - (count - 3) * size / 50, refy + size / 2);

					s.ellipse(r, refy + size / 6, size / 12, size / 12);
					s.line(r - (count - 3) * size / 50, refy + size / 2, size * x + size / 2, refy + size - size / 7);

				}

			}

			function drawBallast(x, y, player, size, health, max, pColors) {
				s.stroke(0);
				s.strokeWeight(0);
				s.fill(0);
				s.ellipse(x * size + size / 2, y * size + 4 * size / 5, size * .65, size * .2);
				s.beginShape();
				s.vertex(x * size + 2 * size / 3, y * size + 3 * size / 4);
				s.vertex(x * size + 3 * size / 4, y * size + size / 2);
				s.vertex(x * size + size / 2, y * size + size / 8);
				s.vertex(x * size + size / 4, y * size + size / 2);
				s.vertex(x * size + size / 3, y * size + 3 * size / 4);
				s.endShape();
			}

			function titleSequence(width, height, delay, scale) {
				delay = delay / 1.2;
				s.background(0);
				s.translate(width / 2, height / 2);
				s.noFill();
				s.stroke(176, 196, 243, 255);
				s.strokeWeight(2);
				if (delay < 200) {
					for (var i = 0; i < delay; i = i + 1) {
						s.quad(-width / 2 + i * scale, -height / 2 + i * scale, -width / 2 + i * scale, height / 2 - i * scale, width / 2 - i * scale, height / 2 - i * scale, width / 2 - i * scale, -height / 2 + i * scale);
					}
				}
				else {
					for (var i = 0; i < 200; i = i + 1) {
						s.quad(-width / 2 + i * scale, -height / 2 + i * scale, -width / 2 + i * scale, height / 2 - i * scale, width / 2 - i * scale, height / 2 - i * scale, width / 2 - i * scale, -height / 2 + i * scale);
					}
				}

				for (var angle = delay * 3; angle < delay * 3 + 360; angle = angle + 30) {
					let titleX = (height / 3 + 90 * s.cos(3.14 * s.radians(delay))) * s.cos(s.radians(angle)) - 0;
					let titleY = (height / 3 + 2 * s.tan(3.14 * s.radians(delay / 20))) * s.sin(s.radians(angle)) + 0;
					s.noStroke();
					for (let o = 255; o > 0; o = o - 5) {
						s.fill(152, 255, 152, o);
						s.ellipse(titleX * 1.2, titleY, height / 12 - o * height / (255 * 12), height / 12 - o * height / (255 * 12));

					}
				}
				s.translate(-width / 2, -height / 2);
				s.background(0, 255 - delay * 7);

			}

			function drawRayTracerProjectile(x, y, player, size, pColors, orient, a) {
				let refx = x * size;
				let refy = y * size;
				s.stroke(0)
				s.strokeWeight(2);
				let projSize = size / 5;
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				if (orient[0] == 0 && orient[1] == 1) {
					s.ellipse(refx + size / 2, refy + (a + 1) * size / 10, projSize, projSize);
				}
				else if (orient[0] == 0 && orient[1] == -1) {
					s.ellipse(refx + size / 2, refy + size - (a + 1) * size / 10, projSize, projSize);
				}
				else if (orient[0] == 1 && orient[1] == 0) {
					s.ellipse(refx + (a + 1) * size / 10, refy + size / 2, projSize, projSize);
				}
				else if (orient[0] == -1 && orient[1] == 0) {
					s.ellipse(refx + size - (a + 1) * size / 10, refy + size / 2, projSize, projSize);
				}
			}
			function drawRedShifterProjectile(x, y, player, size, pColors, orient, damage, distance, a) {
				let refx = x * size + size / 2;
				let refy = y * size + size / 2;
				s.stroke(0);
				s.strokeWeight(1);

				let arrowSize = size / 8;
				let diag = s.abs(orient[1] + orient[0]) - 1;
				s.translate(refx, refy);

				s.translate(orient[0] * a * size / 10, orient[1] * a * size / 10);
				if (orient[0] == 0 && s.abs(orient[1]) == 1) {
					s.rotate(orient[1] * s.radians(90));
				}
				else if (orient[0] == -1 && orient[1] == 0) {
					s.rotate(s.radians(180))
				}
				else if (orient[0] == 1 && orient[1] == 1) {
					s.rotate(s.radians(45))
				}
				else if (orient[0] == 1 && orient[1] == -1) {
					s.rotate(-s.radians(45))
				}
				else if (orient[0] == -1 && orient[1] == 1) {
					s.rotate(s.radians(135))
				}
				else if (orient[0] == -1 && orient[1] == -1) {
					s.rotate(-s.radians(135))
				}
				//s.rotate(s.radians(90)+orient[1]*s.radians(0)-orient[0]*s.radians(90)-diag*orient[0]*s.radians(45));
				s.noFill();
				for (let l = 0; l < distance; l = l + 2) {
					s.arc(0 - (l + 1) * size / 25, 0, size / (5), (31 - l) * size / (150), -s.PI / 3, s.PI / 3);
				}
				if (damage > 0) {
					s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				} else {
					s.fill(0);
				}
				s.beginShape();
				s.vertex(0, 0 - arrowSize);
				s.vertex(0 + size / 4, 0);
				s.vertex(0, 0 + arrowSize);
				s.vertex(0 + size / 10, 0);
				s.vertex(0, 0 - arrowSize);
				s.endShape();

				//s.rotate(-s.radians(90)-orient[1]*s.radians(0)+orient[0]*s.radians(90)+diag*orient[0]*s.radians(45));
				if (orient[0] == 0 && s.abs(orient[1]) == 1) {
					s.rotate(-orient[1] * s.radians(90));
				}
				else if (orient[0] == -1 && orient[1] == 0) {
					s.rotate(-s.radians(180))
				}
				else if (orient[0] == 1 && orient[1] == 1) {
					s.rotate(-s.radians(45))
				}
				else if (orient[0] == 1 && orient[1] == -1) {
					s.rotate(s.radians(45))
				}
				else if (orient[0] == -1 && orient[1] == 1) {
					s.rotate(-s.radians(135))
				}
				else if (orient[0] == -1 && orient[1] == -1) {
					s.rotate(s.radians(135))
				}
				s.translate(-(orient[0] * a * size / 10), -(orient[1] * a * size / 10));

				s.translate(-refx, -refy);


			}


			function drawOscillatorProjectile(x, y, player, size, pColors, orient, a) {
				let refx = x * size + size / 2;
				let refy = y * size + size / 2;
				s.stroke(0, 255);
				s.strokeWeight(1.5);
				for (let i = -size / 3; i <= size / 3; i = i + size / 9) {
					s.line(refx + i, refy - .75 * (s.abs(i) - size / 3), refx + i, refy + .75 * (s.abs(i) - size / 3));
				}
				s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.strokeWeight(1.25 - s.abs((a - 4.5)) / 9);
				for (let i = -size / 3; i <= size / 3; i = i + size / 9) {
					s.line(refx + i, refy - .75 * (s.abs(i) - size / 3), refx + i, refy + .75 * (s.abs(i) - size / 3));
				}
			}

			function drawMaglevProjectile(x, y, player, size, pColors, orient, damage, a) {
				let refx = x * size;
				let refy = y * size;
				let scalar = size / 4;
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], damage * 5);
				s.stroke(0, 255);
				s.strokeWeight(2);
				//s.noStroke();
				s.beginShape();
				for (let angle = 0; angle <= 360; angle = angle + 20) {
					//s.rect(refx,refy,size,size);
					s.curveVertex(refx + size / 2 + orient[0] * a * size / 10 + scalar * s.cos(s.radians(angle)) * s.cos(s.radians(angle)) * s.cos(s.radians(angle)), refy + size / 2 + orient[1] * a * size / 10 + scalar * s.sin(s.radians(angle)) * s.sin(s.radians(angle)) * s.sin(s.radians(angle)));
				}
				s.endShape();
			}
			function drawBeamSplitterProjectile(x, y, player, size, pColors, orient, damage, a) {
				let refx = x * size + size / 2;
				let refy = y * size + size / 2;
				let starterAngle = 0;
				if (player == 1) {
					starterAngle = 45;
				}
				else if (player == 2) {
					starterAngle = 135;
				}
				else if (player == 3) {
					starterAngle = 315;
				}
				else if (player == 4) {
					starterAngle = 225;
				}
				let scalar = size / 4;
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 100);
				s.stroke(0, 255);
				s.strokeWeight(1);
				s.translate(refx + orient[0] * (a - 5) * size / 10, refy + orient[1] * (a - 5) * size / 10);

				s.rotate(s.radians(-starterAngle));
				if (player == 1 || player == 4) {
					s.rotate(s.radians((s.abs(orient[1]) - s.abs(orient[0])) * 45));
				}
				else {

					s.rotate(s.radians(-(s.abs(orient[1]) - s.abs(orient[0])) * 45));
				}
				for (let r = size / 2.5; r > 0; r = r - size / 12) {
					s.arc(0, -size + r, r, r, 0, Math.PI);
				}
				if (player == 1 || player == 4) {
					s.rotate(s.radians(-(s.abs(orient[1]) - s.abs(orient[0])) * 45));
				}
				else {
					s.rotate(s.radians((s.abs(orient[1]) - s.abs(orient[0])) * 45));
				}
				s.rotate(s.radians(starterAngle));
				s.translate(-(refx + orient[0] * (a - 5) * size / 10), -(refy + orient[1] * (a - 5) * size / 10));

			}


			function drawTripwireProjectile(x, y, player, size, pColors, orient, damage, a) {
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 155);
				s.stroke(0, 255);
				let refx = x * size + size / 2 + orient[0] * (a - 5) * size / 10;
				let refy = y * size + size / 2 + orient[1] * (a - 5) * size / 10;

				s.translate(refx, refy);
				for (let angle = 0; angle < 360; angle = angle + 60) {
					s.rotate(s.radians(angle));
					let endX;
					let endY;
					let xx = 0
					let yy = 0;
					while (yy < size / 10) {//to bottom of screen
						endX = xx + s.random(-size / 10, size / 10); //x-value varies
						endY = yy + size / 40;    //y just goes up
						s.strokeWeight(1);//bolt is a little thicker than a line
						s.stroke(255); //white line
						s.line(xx, yy, endX, endY);//draw a tiny segment
						xx = endX;  //then x and y are moved to the
						yy = endY;  //end of the segment and so on
					}
					s.rotate(-s.radians(angle));
				}
				s.stroke(0, 255);
				s.ellipse(0, 0, size / 4, size / 4);
				s.translate(-refx, -refy);


			}


			function drawJuggernodeProjectile(x, y, player, size, pColors, orient, damage, a) {
				let refx = x * size;
				let refy = y * size;

				s.noFill();
				s.stroke(0);
				s.strokeWeight(3);
				s.beginShape();
				let xAdd = 0;
				let yAdd = 0;
				if (orient[1] == -1) {
					yAdd = size;
				}
				if (orient[0] == -1) {
					xAdd = size;
				}
				for (let i = a; i <= (a + 8); i = i + .05) {
					s.curveVertex(refx + xAdd + orient[0] * i * (size / 10) - orient[0] * (size / 10) * s.cos(s.radians(i * 180)), refy + yAdd + orient[1] * i * size / 10 + orient[1] * (size / 10) * s.cos(s.radians(i * 180)));
				}
				s.endShape();
				s.strokeWeight(2);
				s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.beginShape();
				for (let i = a; i <= (a + 8); i = i + .05) {
					s.curveVertex(refx + xAdd + orient[0] * i * (size / 10) - orient[0] * (size / 10) * s.cos(s.radians(i * 180)), refy + yAdd + orient[1] * i * size / 10 + orient[1] * (size / 10) * s.cos(s.radians(i * 180)));
				}
				s.endShape();
				//s.ellipse(refx,refy,size,size);
			}
			function drawBallastProjectile(x, y, player, size, pColors, damage, a) {
				let refx = x * size;
				let refy = y * size;
				s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 115);
				s.strokeWeight(1);
				let amp = size / (20 + 2 * s.abs(5 - a));
				let n = 20 + s.abs(5 - a) / 50;
				s.noFill();
				s.strokeWeight(2);
				s.stroke(0, 255);
				s.translate(refx + size / 2, refy + size / 2);
				s.beginShape();
				s.curveVertex((size / 3 + (amp) * s.sin(n * s.radians(0))) * s.cos(s.radians(0)), (size / 3 + (amp) * s.sin(n * s.radians(0))) * s.sin(s.radians(0)));
				for (let angle = 0; angle <= 360; angle = angle + 5) {
					s.curveVertex((size / 3 + (amp) * s.sin(n * s.radians(angle))) * s.cos(s.radians(angle)), (size / 3 + (amp) * s.sin(n * s.radians(angle))) * s.sin(s.radians(angle)));
				}
				s.curveVertex((size / 3 + (amp) * s.sin(n * s.radians(0))) * s.cos(s.radians(0)), (size / 3 + (amp) * s.sin(n * s.radians(0))) * s.sin(s.radians(0)));

				s.endShape();
				s.strokeWeight(1);
				s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.beginShape();
				s.curveVertex((size / 3 + (amp) * s.sin(n * s.radians(0))) * s.cos(s.radians(0)), (size / 3 + (amp) * s.sin(n * s.radians(0))) * s.sin(s.radians(0)));

				for (let angle = 0; angle <= 360; angle = angle + 5) {
					s.curveVertex((size / 3 + (amp) * s.sin(n * s.radians(angle))) * s.cos(s.radians(angle)), (size / 3 + (amp) * s.sin(n * s.radians(angle))) * s.sin(s.radians(angle)));
				}
				s.curveVertex((size / 3 + (amp) * s.sin(n * s.radians(0))) * s.cos(s.radians(0)), (size / 3 + (amp) * s.sin(n * s.radians(0))) * s.sin(s.radians(0)));

				s.endShape();
				s.translate(-(refx + size / 2), -(refy + size / 2));

			}

			function drawResonatorProjectile(x, y, player, size, pColors, orient, damage, a) {
				s.strokeWeight(1);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 105);
				let crossHairOffset = size / 5;

				if (damage == 0) {
					s.translate(((a - 5) * size / 10) * orient[0], ((a - 5) * size / 10) * orient[1]);
					s.strokeWeight(2)
					s.stroke(255, 185);
					s.ellipse(x * size + size / 2, y * size + size / 2, size / 20, size / 20);
					s.line(x * size + size / 2, y * size + size / 2 - size / 20, x * size + size / 2, y * size + size / 2 - crossHairOffset);
					s.line(x * size + size / 2 - size / 20, y * size + size / 2, x * size + size / 2 - crossHairOffset, y * size + size / 2);
					s.line(x * size + size / 2, y * size + size / 2 + size / 20, x * size + size / 2, y * size + size / 2 + crossHairOffset);
					s.line(x * size + size / 2 + size / 20, y * size + size / 2, x * size + size / 2 + crossHairOffset, y * size + size / 2);
					s.strokeWeight(1)
					s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 185);
					s.ellipse(x * size + size / 2, y * size + size / 2, size / 20, size / 20);
					s.line(x * size + size / 2, y * size + size / 2 - size / 20, x * size + size / 2, y * size + size / 2 - crossHairOffset);
					s.line(x * size + size / 2 - size / 20, y * size + size / 2, x * size + size / 2 - crossHairOffset, y * size + size / 2);
					s.line(x * size + size / 2, y * size + size / 2 + size / 20, x * size + size / 2, y * size + size / 2 + crossHairOffset);
					s.line(x * size + size / 2 + size / 20, y * size + size / 2, x * size + size / 2 + crossHairOffset, y * size + size / 2);
					s.translate(-((a - 5) * size / 10) * orient[0], -((a - 5) * size / 10) * orient[1]);
				}
				else {
					s.noStroke();

					s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 155 * (4.5 - s.abs(4.5 - a)) / 4.5);

					s.rect(x * size, y * size, size, size);
				}
			}

			function drawIntegratorProjectile(x, y, player, size, pColors, orient, damage, a) {
				s.strokeWeight(1);
				let refx = x * size + size / 2;
				let refy = y * size + size / 2;
				let projSize = size / 6;
				let length = 4;
				a = a * 2 - 9
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				if (s.abs(orient[0]) == 2) {
					if (a > 4 && a < 10) {
						s.strokeWeight(3);
						s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 100);
						s.line(refx + (orient[0] / 2) * (a) * size / 10 - size / 2, refy - orient[1] * size / 4 + orient[1] * (a) * size / 20, refx + (orient[0] / 2) * (a + length) * size / 10 - size / 2, refy - orient[1] * size / 4 + orient[1] * (a + length) * size / 20);
					}
					s.strokeWeight(1);
					s.stroke(0);
					s.line(refx + (orient[0] / 2) * (a) * size / 10 - size / 2, refy - orient[1] * size / 4 + orient[1] * (a) * size / 20, refx + (orient[0] / 2) * (a + length) * size / 10 - size / 2, refy - orient[1] * size / 4 + orient[1] * (a + length) * size / 20);
					//s.ellipse(refx+(orient[0]/2)*(a)*size/10-size/2,refy-orient[1]*size/4+orient[1]*(a)*size/20,projSize,projSize);
				}
				else {
					if (a > 4 && a < 10) {
						s.strokeWeight(2);
						s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 155);
						s.line(refx - (orient[0]) * size / 4 + orient[0] * (a) * size / 20, refy + (orient[1] / 2) * (a) * size / 10 - size / 2, refx - (orient[0]) * size / 4 + orient[0] * (a + length) * size / 20, refy + (orient[1] / 2) * (a + length) * size / 10 - size / 2);
					}
					s.strokeWeight(1);
					s.stroke(0);
					s.line(refx - (orient[0]) * size / 4 + orient[0] * (a) * size / 20, refy + (orient[1] / 2) * (a) * size / 10 - size / 2, refx - (orient[0]) * size / 4 + orient[0] * (a + length) * size / 20, refy + (orient[1] / 2) * (a + length) * size / 10 - size / 2);
					//s.ellipse(refx-(orient[0])*size/4+orient[0]*(a)*size/20,refy+(orient[1]/2)*(a)*size/10-size/2,projSize,projSize);
				}

			}


			function drawCreditsSymbol(x, y, size, player, a, pColors) {
				s.stroke(0);
				s.strokeWeight(2);
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.translate(x, y);
				for (let angle = 45; angle < 360; angle = angle + 90) {
					s.rotate(s.radians(angle));
					s.rect(size / 2, -size / 10, size / 3.5, size / 5);
					s.rotate(-s.radians(angle));
				}
				s.translate(-x, -y);
				s.noFill();
				s.stroke(0);
				s.ellipse(x, y, size, size);
				s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.ellipse(x, y, size * .875, size * .875);
				s.stroke(0);
				s.fill(0);
				s.ellipse(x, y, size * .75, size * .75);
				s.noStroke();
				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);
				s.translate(x, y);
				for (let angle = 45; angle < 360; angle = angle + 90) {
					s.rotate(s.radians(angle));
					s.rect(size / 2.3, -size / 10.6, size / 3.5, size / 5.3);
					s.rotate(-s.radians(angle));
				}
				s.stroke(0);

				s.fill(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 255);

				s.strokeWeight(1);
				s.noStroke();
				size = size * 1.05;
				s.beginShape();
				s.vertex(0, size * .25);
				s.vertex(-size * .2, -size * .2);
				s.vertex(-size * .1, -size * .2);
				s.vertex(0, size * .05);
				s.vertex(size * .08, -size * .11);
				s.vertex(size * .02, -size * .11);
				s.vertex(size * .19, -size * .27);
				s.vertex(size * .15, -size * .17);
				s.vertex(size * .22, -size * .17);
				s.vertex(0, size * .25);
				s.endShape();
				s.translate(-x, -y);
			}

			function drawCollision(x, y, size, proj, a, pColors) {
				let player = proj.player;
				let refx = x * size + size / 2;
				let refy = y * size + size / 2;
				s.noTint();
				s.noFill();
				let theta = 0;
				let phase = 0;
				let meh = 0;
				let osx = 0;
				let osy = 0;
				let wave = Math.floor(proj.damage)*.1 + 10;
				let rad = 360;
				let radius = size / 25;
				for (let i = 0; i < rad; i = i + 18) {
					s.stroke(pColors[player - 1][0], pColors[player - 1][1], pColors[player - 1][2], 25 + 2 * s.abs(a - 4.5));
					theta = i * (360 / rad);
					phase = ((Math.PI) / rad);
					meh = (radius * 1.8 + 11.5) * s.sin(wave * theta + phase) * s.cos(phase);
					osx = (size / 25 + meh) * s.cos(theta);
					osy = (size / 25 + meh) * s.sin(theta);
					s.strokeWeight(8);
					s.point(osx + refx, osy + refy);
					s.strokeWeight(6);
					s.point(osx + refx, osy + refy);
					s.strokeWeight(3);
					s.point(osx + refx, osy + refy);
					s.stroke(255, 160 - 17 * s.abs(a - 4.5));
					s.strokeWeight(1);
					s.point(osx + refx, osy + refy);
				}
			}

			function keyPressed() {
				if (s.keyCode === s.LEFT_ARROW) {
					return -1;
				} else if (s.keyCode === s.RIGHT_ARROW) {
					return 1;
				}
				else {
					return 0;
				}
				return false;
			}

		}

		this.engine = new p5(sketch);


	}


}
