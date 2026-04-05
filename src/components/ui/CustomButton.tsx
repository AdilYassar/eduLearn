/* eslint-disable react/react-in-jsx-scope */
import { FC } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  View, 
  ViewStyle, 
  Animated,
  TouchableOpacityProps,
  Dimensions 
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import CustomText from './CustomText';
import { Fonts } from '../../utils/Constants';
import LinearGradient from 'react-native-linear-gradient'; // Make sure to install this

const { width } = Dimensions.get('window');

interface CustomButtonProps extends TouchableOpacityProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'elevated';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  borderRadius?: number;
  color?: string;
  textColor?: string;
  loadingColor?: string;
  rippleColor?: string;
  style?: ViewStyle;
  textStyle?: any;
  pressedOpacity?: number;
  shadow?: boolean;
  gradient?: string[];
  animationDuration?: number;
}

const CustomButton: FC<CustomButtonProps> = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  icon,
  iconPosition = 'left',
  borderRadius = 12,
  color,
  textColor,
  loadingColor,
  rippleColor,
  style: customStyles,
  textStyle,
  pressedOpacity = 0.7,
  shadow = false,
  gradient,
  animationDuration = 150,
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    small: { padding: 12, fontSize: 14, iconSize: 16 },
    medium: { padding: 16, fontSize: 16, iconSize: 20 },
    large: { padding: 20, fontSize: 18, iconSize: 24 }
  };

  const currentSize = sizeConfig[size];

  // Color schemes for different variants
  const getButtonColors = () => {
    const defaultColors = {
      primary: {
        background: color || '#007AFF',
        text: textColor || '#FFFFFF',
        border: 'transparent',
        loading: loadingColor || '#FFFFFF'
      },
      secondary: {
        background: color || '#F2F2F7',
        text: textColor || '#007AFF',
        border: 'transparent',
        loading: loadingColor || '#007AFF'
      },
      outline: {
        background: 'transparent',
        text: textColor || '#007AFF',
        border: color || '#007AFF',
        loading: loadingColor || '#007AFF'
      },
      ghost: {
        background: 'transparent',
        text: textColor || '#007AFF',
        border: 'transparent',
        loading: loadingColor || '#007AFF'
      },
      gradient: {
        background: 'transparent', // Will use LinearGradient
        text: textColor || '#FFFFFF',
        border: 'transparent',
        loading: loadingColor || '#FFFFFF'
      },
      elevated: {
        background: color || '#FFFFFF',
        text: textColor || '#000000',
        border: 'transparent',
        loading: loadingColor || '#000000'
      }
    };

    return defaultColors[variant];
  };

  const colors = getButtonColors();

  // Disabled state colors
  const disabledColors = {
    background: '#E5E5EA',
    text: '#AEAEB2',
    border: '#E5E5EA',
    loading: '#AEAEB2'
  };

  const finalColors = disabled ? disabledColors : colors;

  // Button styles based on variant
  const getButtonStyle = (): ViewStyle => ({
    backgroundColor: finalColors.background,
    borderColor: finalColors.border,
    borderWidth: variant === 'outline' ? 2 : 0,
    borderRadius,
    paddingHorizontal: currentSize.padding * 1.5,
    paddingVertical: currentSize.padding,
    minHeight: currentSize.padding * 2.5 + currentSize.fontSize,
    width: fullWidth ? '100%' : 'auto',
    alignSelf: fullWidth ? 'stretch' : 'center',
    
    // Shadow for elevated variant
    ...(shadow || variant === 'elevated' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
    } : {}),

    // Additional styling
    overflow: 'hidden',
  });

  // Gradient colors
  const gradientColors = gradient || ['#667eea', '#764ba2'];

  const ButtonContent = () => (
    <View style={styles.content}>
      {icon && iconPosition === 'left' && (
        <View style={[styles.iconContainer, { marginRight: 8 }]}>
          {icon}
        </View>
      )}
      
      {loading ? (
        <ActivityIndicator 
          color={finalColors.loading} 
          size={currentSize.iconSize} 
        />
      ) : (
        <CustomText
          variant="body"
          weight="semibold"
          size={currentSize.fontSize}
          color={finalColors.text}
          style={[styles.buttonText, textStyle]}
          numberOfLines={1}
        >
          {title}
        </CustomText>
      )}
      
      {icon && iconPosition === 'right' && !loading && (
        <View style={[styles.iconContainer, { marginLeft: 8 }]}>
          {icon}
        </View>
      )}
    </View>
  );

  const buttonStyle = getButtonStyle();

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={pressedOpacity}
        style={[buttonStyle, customStyles]}
        accessibilityLabel={title}
        accessible={true}
        {...props}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          <ButtonContent />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={pressedOpacity}
      style={[buttonStyle, customStyles]}
      accessibilityLabel={title}
      accessible={true}
      {...props}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});

export default CustomButton;