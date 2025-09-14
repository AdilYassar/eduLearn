import {Dimensions} from 'react-native';

// Add safety checks to prevent NaN values
const getScreenDimensions = () => {
  const screen = Dimensions.get('screen');
  return {
    height: screen.height || 800, // fallback to 800 if NaN
    width: screen.width || 400,   // fallback to 400 if NaN
  };
};

const screen = getScreenDimensions();
export const screenHeight = screen.height;
export const screenWidth = screen.width;
export const multiColor = [
  '#0B3D91',
  '#1E4DFF',
  '#104E8B',
  '#4682B4',
  '#6A5ACD',
  '#7B68EE',
];

export const Colors = {
  primary: '#007AFF',
  background: '#fff',
  text: '#131313',
  theme: '#CF551F',
  secondary: '#E5EBF5',
  tertiary: '#3C75BE',
  secondary_light: '#F6F7F9',
};
