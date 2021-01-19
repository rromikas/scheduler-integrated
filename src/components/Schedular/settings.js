const settings = {
  showLines: true,
  zoomOnWheel: true,
  zoomOptions: [
    { interval: 120, name: "2h", cellWidth: 102, step: 15 },
    { interval: 60, name: "1h", cellWidth: 104, step: 15 },
    { interval: 30, name: "30m", cellWidth: 106, step: 15 },
    { interval: 15, name: "15m", cellWidth: 108, step: 15 },
  ],
  timeGapBetweenZooms: 80,
  cellHeight: 72,
  totalMinutes: 60 * 24,
};

export default settings;
