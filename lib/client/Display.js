import p5 from 'p5';

export default class Display {

 	constructor(engine = undefined,  stage = new Object) {
 		this.engine = engine;
 		this.stage = stage;
 		this.phase = 0;
	}

	init() {

		let sketch = (s) => {
			s.setup = () =>{
				s.createCanvas(400, 400);
    		}
    		s.draw = () => {
				s.background(100);

				for (var i =0; i < this.stage.rects.length; i++) {
					drawRect(this.stage.rects[i]);
				}
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

		}

		this.engine = new p5(sketch);

		console.log('Initialized Display');
	}

	

}