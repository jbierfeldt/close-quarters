//Close Quarters
//Copyright © 2020 Tom Wesley.
//Coder: Thomas Wesley 
//Last Edit 6/7/2020
//Notes 

//Variable Declarations - Need Cleaned Up

let colors=[4];
let imgOne;
 
let Units = [];

//Control the star speed
let speed;
//Victory Sequence
let flareon =140;
let jolteon =0;
let s=0;
let theta;
let m;

let delay=0;
let LINE_C =200;
let LINE_O =360;
let gen =0;

let colorr;

let pick;
//Control of Wave Fluctuation from bottom of screen
let fluct=0;
let spacing;
let radius;

let set=0;

let title;
let sinAngle = 0;
let sinOne=0;
let sinx = 0;
let siny = 0;
let prevx=0;
let prevy=0;

let mousex;
let mousey;
let GameOver=0;
let LevelChangeCount=0;
let LevelChangeTrigger=0;
let noText=0;
let levelStart=0;
let ratio=0;
let ratiotwo=0;
let prevxx=0;
let prevyy=0;

    let timer=0;
    let level=1;
    let victory=0;
    let turnoff=0;
    let full=true ;
//User Input Varibles
    let input;
    let button;
    let nameIn =0;
    let id;
    let playerName="";
    let DBEntry;
    let loadDB=0;
//Game Over Sequence    
    let phase=1;
    let craftLost=0;//counter to ensure the craft lost sequences are timed correctly before resetting
let scale=10;



let firstBaseSpot=0;
let pOneInitialBaseX=0;
let pOneInitialBaseY=0;
let turn=1 //For intial base placement
//Server-Client Adjustment
let player =1;
let budget=10;



function preload() {
  title = loadFont("volt.ttf");
 // table = loadTable('leaderboard.csv', 'csv', 'header'); 
  imgOne=loadImage("YellowGal.jpg");
}


function setup() {
  createCanvas(1280,720);
    colors[0]=color(1,100,87,255);
  colors[1]=color(255,240,0,255);
  colors[2]=color(128,0,0,255);
  colors[2]=color(128,128,126,255);

  //Create arrays of the class objects to be utilized in the draw phase
/*
  for (let i = 0; i < 1; i++) {
    Units[i] = new Unit();
  }*/
  let unitCount=1;
 
  /*var firebaseConfig = {
    apiKey: "AIzaSyC7KRHKPJUlp997AFgUN1FwwbWxOZf1mII",
    authDomain: "singularity-c216f.firebaseapp.com",
    databaseURL: "https://singularity-c216f.firebaseio.com",
    projectId: "singularity-c216f",
    storageBucket: "singularity-c216f.appspot.com",
    messagingSenderId: "877374644269",
    appId: "1:877374644269:web:d377b498db0a00ab1b98a4",
    measurementId: "G-HTXCRL5LBV"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  //console.log(firebase);
      input = createInput();
      input.position(width/3, 4*height/9);
      input.size(width/6,height/9);
      input.style('font-size', '48px');
      input.style('background-color', '#ffffa1');
      input.style('font-family', "Impact");
      */
}

//The draw function runs through the actions within it continuously
function draw() {
  let playerCount=4;
 //Possibly insert a custom cursor eventually
 // var database=firebase.database();
 // var ref=database.ref('scores');
 
  cursor(CROSS);
  if(nameIn==0){
    budget=10;
    firstBaseSpot=0;
    turn=1;
    phase=1;
    background(0);
    speed=0.8;  
    textFont(title);
    fill(255,240,0,255);
    textSize(width/10);
    text("Enter An Alias",1*width/9,height/4)
    textSize(width/23);       
    text("Confirm",3.05*width/5,4.8*height/9)
    
    stroke(255,255);
      fill(255,150);
      if(mouseX<(width-width/5) && mouseX>3*width/5 && mouseY<5*height/9 && mouseY>4*height/9){
        rect(3*width/5,4*height/9,width/5,height/9);
      }
    if(mouseIsPressed && mouseX<(width-width/5) && mouseX>3*width/5 && mouseY<5*height/9 && mouseY>4*height/9){
      fullscreen(full);
     // playerName=addName();
    //  playerName=playerName.slice(0,8);
     // input.remove();
      mouseIsPressed=false;
      resizeCanvas(displayWidth, displayHeight);
      nameIn=1;
      delay=0;
    }  
    
 
  }
  
  else{
//Past The Name Entry Screen  
  let rowStep=width/30;
  let colStep=height/20
  delay=delay+0.5;
    cursor(CROSS);
    if(phase==0){
//IMPORTANT - screen between here for joining other players, waiting for all players
    }
    if(phase==1){
      if(budget==0){
        phase=2;       
      }
      background(0);
      if(player==1){
        if(turn==1){
          if(firstBaseSpot==0){
            pOneInitialBaseX=int(random(15))
            pOneInitialBaseY=int(random(11))
          }
          firstBaseSpot=1;          
        turn=2;
        }
        fill(colors[0]);   rect(pOneInitialBaseX*rowStep,pOneInitialBaseY*colStep,rowStep,colStep);
        strokeWeight(1.5);
        stroke(colors[0]);
        for(let i =0;i<11;i=i+1){          
          line(0,i*colStep,15*rowStep,i*colStep);
               }
        for(let i =0;i<16;i=i+1){          
          line(i*rowStep,0,i*rowStep,10*colStep);
               }
        
        //Unit Menu
        stroke(255);
        fill(100,100,100,40);
        rect(width/2+width/15,width/15,6*width/15,7*width/15);
        
      }
  speed=0.9;
  translate(width/2,height/2);
  rotate(delay*PI/2000);
  rotate(-delay*PI/2000);
    

    }
    else if(phase==2){
      budget=10;
      timer=0;
      background(0);
      while(timer<60){
        
        
       timer=timer+1; 
      }
    }
}
  
}

//Class Documentation
function keyPressed() {
  if (keyCode ==="M") {
    phase =2;
  } else if (keyCode === "D") {
    value = 2;
  }
}  
  
class Unit {
  constructor() { 
    this.priorx=0;
    //this.secondpriorx=0;
  }
  updateUnit() {      
    }
  unitDestroyed(team, x, y, unit,prevy,prevxx,prevyy) {
    
  }
}

class rayTracer extends Unit {
  constructor(x,y,player,size) { 
  
    super();
    this.xx=x;
    this.yy=y;
    //this.secondpriorx=0;
  }
  displayUnit() { 
    stroke(255);
    fill(colors[player]);
    ellipse(x,y,size,size);    
  }
  moveUnit(newX,newY) { 
  }
}


//Parametric Equations for Visuals
function x(t){
    return cos(sqrt(t))*PI*25/(sin(t)+2);
  
}
function y(t){
    return sin(sqrt(t))*PI*25/(cos(t)+2);
  
}
function z(t){
    return cos(t*t)*160-sin(t);
  
}
function w(t){
    return sin(t*t)*150+cos(t*sin(t));
  
}

//Database Related Functions
function addName(){
  id=input.value();
  nameIn=1;
  return id
}

function gotData(data){
  var arr=[["Kyle",1,2],["Gary",1,3],["Giovanni",1,1],["Blaine",1,0],["Misty",1,0],["Surge",1,2],["Erika",1,2],["Sabrina",1,3],["Brock",1,0],["Koga",1,1]];
  var minimum=0;
  var scoress=data.val();
  var keys=Object.keys(scoress);
  var skipper=0;
  for(var i=0;i<keys.length;i++){
    var k=keys[i];
    var levels=scoress[k].level;
    var names=scoress[k].name;
    var surf=scoress[k].surfer;
    var tempArr=[names,levels,surf];

    if(levels>minimum){
      for(var st=0;st<arr.length;st=st+1){
        if(names==arr[st][0]){
          if(levels>=arr[st][1]){
          arr[st]=tempArr;
        
          }
       skipper=1;
       break;
        }
        else{
          skipper=0;         
        }
      }
      if(skipper==0){
        append(arr,tempArr);
    
      }
      arr.sort((a,b) => b[1] - a[1]);
      if(arr.length >10){
        arr.pop();
        minimum=arr[9][1];      
    }
  }      
    
    
  }
  textFont(title);
    textSize(width/18.5);
      //Leaderboard when sinOne==-1
      for(var j=0;j<10;j++){
        if(arr[j][2]==0){
        fill(255,0,0,255);
        }
        if(arr[j][2]==1){
        fill(255,174,204,255);
        }
        if(arr[j][2]==2){
        fill(80,230,130,255);
        }
        if(arr[j][2]==3){
        fill(100,14,237,255);
        }
        text(arr[j][0],width/3.3,height*(j+3.4)/13);
        text(arr[j][1],2.7*width/4,height*(j+3.4)/13);
      }
}

function errData(err){

}