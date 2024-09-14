import ColorThief from 'colorthief';

const colorThief = new ColorThief();

function getContrastingColor(color) {
  const brightness = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
}

export { colorThief, getContrastingColor };