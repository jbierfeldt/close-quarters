import p5 from 'p5';
// import Unit from './lib/shared/Unit.js';

console.log("hey2");

let sketch = (s) => {
	s.setup = () =>{
		s.createCanvas(window.innerWidth,window.innerHeight);
    }
    s.draw = () =>{
		s.background(220);
    }
}

const P5 = new p5(sketch);

