/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Fonts } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';

interface Props {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'h7'
    | 'h8'
    | 'h9'
    | 'body';
   
  
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
  numberOfLines?: number;
  onLayout?: (event: object) => void;
  fontFamily: string;
  size?: number;
}

const CustomText: React.FC<Props> = ({
  variant = 'body',
  fontFamily = Fonts.Regular,
  size = RFValue(14),
  style,
  children,
  numberOfLines,
  onLayout,
  ...props
}) => {
  let computedFontSize: number;

  // Switch-case to set font size based on the variant
  switch (variant) {
    case 'h1':
      computedFontSize = RFValue(size || 32);
      break;
    case 'h2':
      computedFontSize = RFValue(size || 28);
      break;
    case 'h3':
      computedFontSize = RFValue(size || 24);
      break;
    case 'h4':
      computedFontSize = RFValue(size || 20);
      break;
    case 'h5':
      computedFontSize = RFValue(size || 18);
      break;
    case 'h6':
      computedFontSize = RFValue(size || 16);
      break;
    case 'h7':
      computedFontSize = RFValue(size || 14);
      break;
    case 'h8':
      computedFontSize = RFValue(size || 12);
      break;
    case 'h9':
      computedFontSize = RFValue(size || 10);
      break;
    default:
      computedFontSize = RFValue(size || 14); // Default size for 'body'
      break;
  }

  return (
    <Text
      style={[
        { fontFamily, fontSize: computedFontSize },
        style,
      ]}
      numberOfLines={numberOfLines !== undefined ? numberOfLines : undefined}
      onLayout={onLayout}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.Regular,
  },
});

export default CustomText;
