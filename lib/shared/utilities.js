export const create2DArray = function (rows) {
  let arr = [];

  for (let i=0;i<rows;i++) {
    arr[i] = [];
    for (let j=0;j<rows;j++) {
      arr[i][j] = 0;
    }
  }

  return arr;
}