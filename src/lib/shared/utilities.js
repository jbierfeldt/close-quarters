export class DEBUG {

	constructor(enabled = false, debugLevel = 0) {
		this.enabled = (enabled == 'true');
    this.debugLevel = debugLevel;
    this.enableCallback = undefined;
    this.disableCallback = undefined;
	}

	log(level, ...messages) {
		if (this.enabled == true && level >= this.debugLevel) {
			messages.forEach( (message) => {
				console.log(message);
			})
		}
  }
  
  enable() {
    this.enabled = true;

    if (this.enableCallback) {
      this.enableCallback.call();
    }
  }

  disable() {
    this.enabled = false;

    if (this.disableCallback) {
      this.disableCallback.call();
    }
  }
}

export const create2DArray = function (rows, columns) {
  let arr = [];

  for (let i=0;i<rows;i++) {
    arr[i] = [];
    for (let j=0;j<columns;j++) {
      arr[i][j] = [];
    }
  }

  return arr;
}

export const createID = function (length) {
    if (!length) {
        length = 8
    }
    let str = ''
    for (let i = 1; i < length + 1; i = i + 8) {
        str += Math.random().toString(36).substr(2, 10)
    }
    return (str).substr(0, length)
}
