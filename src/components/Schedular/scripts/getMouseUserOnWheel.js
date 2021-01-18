function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

function isTrackpad(e) {
  var isTrackpad = false;
  if (e.wheelDeltaY) {
    if (Math.abs(e.wheelDeltaY) < 50) {
      isTrackpad = true;
    }
  } else if (e.deltaMode === 0) {
    isTrackpad = true;
  }
  return isTrackpad;
}

export default (e) => {
  return isTrackpad(e) ? "trackpad" : "mouse";
};
