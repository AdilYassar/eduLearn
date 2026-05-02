import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '../../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const AdminCard: React.FC<CardProps> = ({ children, style, padding = 20 }) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
      borderRadius: 20,
      padding,
      marginBottom: 16,
      borderColor: theme.dark ? '#484551' : '#EDE5F8',
      borderWidth: 1,
      shadowColor: 'transparent',
      elevation: 0,
    },
  });

  return <View style={[styles.card, style]}>{children}</View>;
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export const AdminStatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = '#5D4BA3',
}) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
      borderColor: theme.dark ? '#484551' : '#EDE5F8',
      borderWidth: 1,
      shadowColor: 'transparent',
      elevation: 0,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
    },
    label: {
      fontSize: 12,
      color: theme.dark ? '#cac4d3' : '#797582',
      marginBottom: 4,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    value: {
      fontSize: 32,
      fontWeight: '800',
      color: color,
      letterSpacing: -1,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      marginLeft: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
    </View>
  );
};

interface StatGridCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  compact?: boolean;
}

export const AdminStatGridCard: React.FC<StatGridCardProps> = ({
  label,
  value,
  icon,
  color = '#5D4BA3',
  compact = false,
}) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.dark ? '#2d2b33' : '#ffffff',
      borderRadius: compact ? 12 : 18,
      padding: compact ? 8 : 14,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.dark ? '#484551' : '#EDE5F8',
      borderWidth: 1,
      shadowColor: 'transparent',
      elevation: 0,
    },
    iconContainer: {
      width: compact ? 32 : 44,
      height: compact ? 32 : 44,
      borderRadius: compact ? 8 : 12,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: compact ? 6 : 8,
    },
    value: {
      fontSize: compact ? 14 : 18,
      fontWeight: '800',
      color: color,
      textAlign: 'center',
      marginBottom: 0,
    },
    label: {
      fontSize: compact ? 9 : 10,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

export default AdminCard;
