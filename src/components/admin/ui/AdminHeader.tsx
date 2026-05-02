import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../../context/ThemeContext';
import { ChevronLeft } from 'lucide-react-native';

interface AdminHeaderProps {
  title: string;
  onBackPress?: () => void;
  showBack?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  subtitle?: string;
  style?: ViewStyle;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  onBackPress,
  showBack = false,
  leftAction,
  rightAction,
  subtitle,
  style,
}) => {
  const { theme } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 0,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      marginRight: 8,
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    customLeftAction: {
      marginRight: 12,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 13,
      color: theme.dark ? '#cac4d3' : '#797582',
      marginTop: 2,
      fontWeight: '500',
    },
    rightAction: {
      marginLeft: 16,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={theme.dark ? '#fdf7ff' : '#5D4BA3'} />
          </TouchableOpacity>
        )}
        {leftAction && (
          <View style={styles.customLeftAction}>
            {leftAction}
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
};

export default AdminHeader;

