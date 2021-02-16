let lastDistance;
let initialDistance;
let center;

export const preventGoBack = (e) => {
  if (e.pageX > 10 && e.pageX < window.innerWidth - 10) {
    return;
  } else {
    e.preventDefault();
  }
};

export const onTouchStart = (e) => {
  if (e.touches.length >= 2) {
    e.preventDefault();
    lastDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    center = e.touches[0].pageX - (e.touches[0].pageX - e.touches[1].pageX) / 2;
    initialDistance = lastDistance;
  }
};

export const onTouchMove = (e) => {
  if (e.touches.length >= 2) {
    e.preventDefault();
    lastDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
  }
};

export const onTouchEnd = (e, onZoom) => {
  if (lastDistance > initialDistance) {
    onZoom(center, "in");
  } else if (lastDistance < initialDistance) {
    onZoom(center, "out");
  }
};
