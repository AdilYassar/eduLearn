import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../../context/ThemeContext';
import { AlertCircle, Inbox } from 'lucide-react-native';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  style?: ViewStyle;
  iconColor?: string;
}

export const AdminEmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  style,
  iconColor = '#5D4BA3',
}) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 30,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
      borderRadius: 24,
      marginTop: 20,
    },
    icon: {
      marginBottom: 20,
      opacity: 0.3,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 10,
      textAlign: 'center',
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 14,
      color: theme.dark ? '#cac4d3' : '#797582',
      textAlign: 'center',
      fontWeight: '500',
      lineHeight: 20,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.icon}>{icon}</View>
      ) : (
        <View style={styles.icon}>
          <Inbox size={64} color={iconColor} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

export const AdminLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    skeleton: {
      height: 60,
      backgroundColor: theme.dark ? '#312f36' : '#EDE5F8',
      borderRadius: 16,
      marginBottom: 12,
      opacity: 0.6,
    },
    fullWidth: {
      width: '100%',
    },
  });

  return (
    <View style={{ marginTop: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.skeleton, styles.fullWidth]}
        />
      ))}
    </View>
  );
};

export const AdminErrorBanner: React.FC<{ message: string }> = ({ message }) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: '#ffdad6',
      borderColor: '#ba1a1a',
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: '#ba1a1a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    icon: {
      marginRight: 12,
    },
    message: {
      flex: 1,
      fontSize: 14,
      color: '#410002',
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <AlertCircle size={20} color="#ba1a1a" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

export default AdminEmptyState;

