import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer } from '../../components/ui/ThemedComponents';
import BottomNavigationBar from '../../components/ui/BottomNavigationBar';
import Animated, { FadeIn } from 'react-native-reanimated';

const ScheduleManagementScreen = () => {
  const { theme } = useTheme();

  return (
    <ThemedContainer>
      <View style={styles.container}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[styles.content, { backgroundColor: theme.surface }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
              Schedule Management
            </Text>
          </View>

          {/* Coming Soon Content */}
          <View style={styles.centerContent}>
            <Calendar size={80} color={theme.primary} strokeWidth={1.5} />
            
            <Text style={[styles.comingSoonTitle, { color: theme.text.primary }]}>
              Coming Soon
            </Text>
            
            <Text style={[styles.comingSoonDescription, { color: theme.text.secondary }]}>
              Schedule management features are currently under development. We're working hard to bring you an amazing scheduling experience!
            </Text>

            <View style={[styles.featuresList, { borderColor: `${theme.primary}30` }]}>
              <Text style={[styles.featuresTitle, { color: theme.text.primary }]}>
                Upcoming Features:
              </Text>
              
              <Text style={[styles.featureItem, { color: theme.text.secondary }]}>
                📅 Create and manage study schedules
              </Text>
              <Text style={[styles.featureItem, { color: theme.text.secondary }]}>
                🔔 Smart reminders for classes and assignments
              </Text>
              <Text style={[styles.featureItem, { color: theme.text.secondary }]}>
                📊 Track your learning progress
              </Text>
              <Text style={[styles.featureItem, { color: theme.text.secondary }]}>
                🎯 Set and achieve your goals
              </Text>
              <Text style={[styles.featureItem, { color: theme.text.secondary }]}>
                🗓️ Sync with your calendar
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Navigation Bar */}
        <BottomNavigationBar backgroundColor={theme.componentBackground[0]} currentScreen="ScheduleManagementScreen" />
      </View>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: 'Inter-Bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: -0.5,
    fontFamily: 'Inter-Bold',
  },
  comingSoonDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  featuresList: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
    fontFamily: 'Inter-Bold',
  },
  featureItem: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
});

export default ScheduleManagementScreen;
