import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../../context/ThemeContext';

interface AdminInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export const AdminInput: React.FC<AdminInputProps> = ({
  label,
  error,
  containerStyle,
  icon,
  ...props
}) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 8,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: error ? '#ba1a1a' : theme.dark ? '#484551' : '#EDE5F8',
      borderWidth: 1.5,
      borderRadius: 16,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      paddingHorizontal: 16,
      height: 52,
      shadowColor: '#2D2560',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 1,
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 4,
      fontSize: 16,
      fontWeight: '500',
      color: theme.dark ? '#fdf7ff' : '#1c1b21',
    },
    iconContainer: {
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    error: {
      fontSize: 12,
      color: '#ba1a1a',
      marginTop: 6,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.dark ? '#797582' : '#cac4d3'}
          selectionColor="#5D4BA3"
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

interface AdminListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLoading?: boolean;
}

export const AdminListItem: React.FC<AdminListItemProps> = ({
  title,
  subtitle,
  value,
  onPress,
  rightElement,
  isLoading = false,
}) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomColor: theme.dark ? '#312f36' : '#EDE5F8',
      borderBottomWidth: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
    },
    leftContent: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    subtitle: {
      fontSize: 13,
      color: theme.dark ? '#797582' : '#797582',
      marginTop: 2,
      fontWeight: '500',
    },
    value: {
      fontSize: 13,
      color: '#5D4BA3',
      marginLeft: 8,
      marginRight: 8,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {value && <Text style={styles.value}>{value}</Text>}
      {rightElement && rightElement}
    </View>
  );
};

export default AdminInput;

