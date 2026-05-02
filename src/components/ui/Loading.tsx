import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer } from './ThemedComponents';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', fullScreen = true }) => {
  const { theme } = useTheme();

  const content = (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      {message ? (
        <Text style={[styles.text, { color: theme.text.secondary }]}>{message}</Text>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return <View style={[styles.fullScreen, { backgroundColor: theme.background[0] }]}>{content}</View>;
  }

  return content;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Manrope',
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
  },
});

export default Loading;
