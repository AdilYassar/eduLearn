import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../../context/ThemeContext';

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const AdminButton: React.FC<ButtonProps> = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  const { theme } = useAppTheme();

  const variantStyles = {
    primary: {
      backgroundColor: '#5D4BA3',
      color: '#ffffff',
      borderTopColor: 'rgba(255, 255, 255, 0.15)',
      borderTopWidth: 1,
    },
    secondary: {
      backgroundColor: '#EDE5F8',
      color: '#5D4BA3',
      borderTopWidth: 0,
    },
    danger: {
      backgroundColor: '#ba1a1a',
      color: '#ffffff',
      borderTopWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#5D4BA3',
      borderWidth: 1.5,
      borderColor: '#EDE5F8',
      borderTopWidth: 1.5,
    },
  };

  const sizeStyles = {
    small: { height: 36, paddingHorizontal: 16 },
    medium: { height: 48, paddingHorizontal: 24 },
    large: { height: 56, paddingHorizontal: 32 },
  };

  const styles = StyleSheet.create({
    button: {
      ...sizeStyles[size],
      ...variantStyles[variant],
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
    },
    text: {
      color: variantStyles[variant].color,
      fontWeight: '700',
      fontSize: size === 'small' ? 14 : 16,
      marginRight: loading ? 8 : 0,
      letterSpacing: 0.2,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && <ActivityIndicator color={variantStyles[variant].color} size="small" />}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default AdminButton;

