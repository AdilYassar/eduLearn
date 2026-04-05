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
    | 'body'
    | 'caption'
    | 'overline'
    | 'subtitle1'
    | 'subtitle2';
  
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline' | 'line-through';
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
  numberOfLines?: number;
  onLayout?: (event: object) => void;
  fontFamily?: string;
  size?: number;
  gradient?: boolean;
  shadow?: boolean;
  glow?: boolean;
}

const CustomText: React.FC<Props> = ({
  variant = 'body',
  weight = 'regular',
  color = '#1a1a1a',
  align = 'left',
  transform = 'none',
  decoration = 'none',
  opacity = 1,
  letterSpacing,
  lineHeight,
  fontFamily,
  size,
  style,
  children,
  numberOfLines,
  onLayout,
  gradient = false,
  shadow = false,
  glow = false,
  ...props
}) => {
  // Font family mapping based on weight
  const getFontFamily = () => {
    if (fontFamily) return fontFamily;
    
    switch (weight) {
      case 'light': return Fonts.Light || Fonts.Regular;
      case 'regular': return Fonts.Regular;
      case 'medium': return Fonts.Medium || Fonts.Regular;
      case 'semibold': return Fonts.SemiBold || Fonts.Regular;
      case 'bold': return Fonts.Bold || Fonts.Regular;
      case 'extrabold': return Fonts.ExtraBold || Fonts.Bold || Fonts.Regular;
      default: return Fonts.Regular;
    }
  };

  // Font size mapping based on variant
  const getFontSize = () => {
    if (size) return RFValue(size);
    
    switch (variant) {
      case 'h1': return RFValue(32);
      case 'h2': return RFValue(28);
      case 'h3': return RFValue(24);
      case 'h4': return RFValue(20);
      case 'h5': return RFValue(18);
      case 'h6': return RFValue(16);
      case 'subtitle1': return RFValue(16);
      case 'subtitle2': return RFValue(14);
      case 'body': return RFValue(14);
      case 'caption': return RFValue(12);
      case 'overline': return RFValue(10);
      default: return RFValue(14);
    }
  };

  // Line height based on variant
  const getLineHeight = () => {
    if (lineHeight) return lineHeight;
    
    const fontSize = getFontSize();
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3': return fontSize * 1.2;
      case 'h4':
      case 'h5':
      case 'h6': return fontSize * 1.3;
      case 'body':
      case 'subtitle1':
      case 'subtitle2': return fontSize * 1.5;
      case 'caption':
      case 'overline': return fontSize * 1.4;
      default: return fontSize * 1.5;
    }
  };

  // Letter spacing based on variant
  const getLetterSpacing = () => {
    if (letterSpacing !== undefined) return letterSpacing;
    
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3': return -0.5;
      case 'overline': return 1.5;
      case 'caption': return 0.4;
      default: return 0;
    }
  };

  // Dynamic styles
  const dynamicStyles: TextStyle = {
    fontFamily: getFontFamily(),
    fontSize: getFontSize(),
    color: color,
    textAlign: align,
    textTransform: transform,
    textDecorationLine: decoration,
    opacity: opacity,
    letterSpacing: getLetterSpacing(),
    lineHeight: getLineHeight(),
    
    // Shadow effect
    ...(shadow && {
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    }),
    
    // Glow effect
    ...(glow && {
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    }),
  };

  // Gradient text (using multiple text shadows for effect)
  const gradientStyle: TextStyle = gradient ? {
    textShadowColor: '#667eea',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  } : {};

  return (
    <Text
      style={[
        styles.baseText,
        dynamicStyles,
        gradientStyle,
        style,
      ]}
      numberOfLines={numberOfLines}
      onLayout={onLayout}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  baseText: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default CustomText;