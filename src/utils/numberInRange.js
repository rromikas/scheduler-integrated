export default (x, min, max) => {
  const xAsNumber = parseFloat(x);

  return xAsNumber >= parseFloat(min) && xAsNumber <= parseFloat(max);
};
