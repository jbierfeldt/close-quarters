export class DEBUG {

	constructor(enabled = false, debugLevel = 0) {
		this.enabled = enabled;
		this.debugLevel = debugLevel;
	}

	log(level, ...messages) {
		if (level >= this.debugLevel) {
			messages.forEach( (message) => {
				console.log(message);
			})
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
    return ('_' + str).substr(0, length)
}