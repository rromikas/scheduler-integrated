const settings = {
  showLines: true,
  zoomOnWheel: true,
  zoomOptions: [
    { interval: 120, name: "2h", cellWidth: 70, step: 15 },
    { interval: 60, name: "1h", cellWidth: 72, step: 15 },
    { interval: 30, name: "30m", cellWidth: 74, step: 15 },
    { interval: 15, name: "15m", cellWidth: 76, step: 15 },
  ],
  timeGapBetweenZooms: 80,
  cellHeight: 50,
  totalMinutes: 60 * 24,
};

export default settings;
