// Use the window object to get width and height for web dimensions
const width = window.innerWidth;
const height = window.innerHeight;

export const CARD = {
  WIDTH: width * 0.9,
  HEIGHT: height * 0.78,
  BORDER_RADIUS: 20,
  OUT_OF_SCREEN: width + 0.5 * width,
};

export const COLORS = {
  like: '#00eda6',
  nope: '#ff006f',
  undoEnabled: '#4CAF50',
  undoDisabled: '#9E9E9E',
};

export const ACTION_OFFSET = 100;
