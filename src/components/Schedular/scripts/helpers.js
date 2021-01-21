export function isBetween(x, min, max, strict = false) {
  return !strict ? x >= min && x <= max : x > min && x < max;
}

export function convertMinsToHrsMins(minutes, amPm = false) {
  var h = Math.floor(minutes / 60);
  const isAfterMidday = h >= 12;
  h = amPm ? h % 12 : h;
  h = h === 0 && isAfterMidday ? 12 : h;
  var m = minutes % 60;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  return h + ":" + m + (amPm ? (isAfterMidday ? "PM" : "AM") : "");
}

export const insertIntoArrayWithSplicingOverlappingItems = (arr, val, maxValue, rangeIndex) => {
  let whereToInsert = 0;
  let finalValue = val;
  if (arr.length) {
    let ind = arr.length - 1;
    let finished = false;
    while (!finished && ind >= 0) {
      let x1 = arr[ind].range[0],
        x2 = arr[ind].range[1];

      //if edited range is compared to itself - comparing must be not strict
      //two ranges intersect if x1 <= y2 && y1 <= x2, where ranges are (x1:x2) and (y1:y2)
      if ((rangeIndex && x1 <= val[1] && val[0] <= x2) || (x1 < val[1] && val[0] < x2)) {
        whereToInsert = ind;
        finalValue[0] = Math.min(finalValue[0], arr[ind].range[0]);
        finalValue[1] = Math.max(finalValue[1], arr[ind].range[1]);
        arr.splice(ind, 1);
      } else if (val[0] >= arr[ind].range[1]) {
        finished = true;
        whereToInsert = ind + 1;
      }
      ind--;
    }
    arr.splice(whereToInsert, 0, {
      range: finalValue,
      from: maxValue,
    });
  } else {
    arr.splice(0, 0, {
      range: val,
      from: maxValue,
    });
  }
};
