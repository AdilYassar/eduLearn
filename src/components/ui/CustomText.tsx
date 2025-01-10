/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Fonts } from '@utils/Constants';
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
  fontFamily?: Fonts;
  fontSize?: number;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
  numberOfLines?: number;
  onLayout?: (event: object) => void;
}

const CustomText: React.FC<Props> = ({
  variant = 'body',
  fontFamily = Fonts.Regular,
  fontSize,
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
      computedFontSize = RFValue(fontSize || 32);
      break;
    case 'h2':
      computedFontSize = RFValue(fontSize || 28);
      break;
    case 'h3':
      computedFontSize = RFValue(fontSize || 24);
      break;
    case 'h4':
      computedFontSize = RFValue(fontSize || 20);
      break;
    case 'h5':
      computedFontSize = RFValue(fontSize || 18);
      break;
    case 'h6':
      computedFontSize = RFValue(fontSize || 16);
      break;
    case 'h7':
      computedFontSize = RFValue(fontSize || 14);
      break;
    case 'h8':
      computedFontSize = RFValue(fontSize || 12);
      break;
    case 'h9':
      computedFontSize = RFValue(fontSize || 10);
      break;
    default:
      computedFontSize = RFValue(fontSize || 14); // Default size for 'body'
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
