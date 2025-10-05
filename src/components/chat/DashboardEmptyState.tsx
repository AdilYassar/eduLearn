import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '@utils/Constants';

// Sample suggestion categories for students
const suggestionCards = [
  {
    id: 1,
    title: 'State of mind',
    subtitle: 'How are you feeling about your studies?',
    actionText: 'Share Mood',
    actionColor: '#ef4444',
    icon: '🧠',
  },
  {
    id: 2,
    title: 'Study Tips',
    subtitle: 'Get personalized study recommendations',
    actionText: 'Explore',
    actionColor: '#ec4899',
    icon: '📚',
  },
];

const quickActions = [
  { id: 1, text: 'Schedule study session', completed: false },
  { id: 2, text: 'Review learning materials', completed: false },
  { id: 3, text: 'Check assignment deadlines', completed: false },
];

const reminderCard = {
  title: 'Study Reminder',
  subtitle: 'Complete Mathematics homework',
  time: '08:00 PM',
  actionText: 'Snooze',
};

interface DashboardEmptyStateProps {
  isTyping: boolean;
  userName?: string;
  onCardPress?: (text: string) => void;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  onCardPress,
}) => {
  const handlePress = (text: string) => {
    if (onCardPress) {
      onCardPress(text);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {['All', 'Insights', 'Study Tips', 'To-do list', 'Resources'].map(
          (tab, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, index === 0 && styles.activeTab]}
              onPress={() => handlePress(`Tell me about ${tab.toLowerCase()}`)}
            >
              <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Cards Grid */}
      <View style={styles.cardsGrid}>
        {/* Suggestion Cards Row */}
        <View style={styles.cardRow}>
          {suggestionCards.map((card) => (
            <View key={card.id} style={styles.card}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.iconEmoji}>{card.icon}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: card.actionColor },
                ]}
                onPress={() => handlePress(card.subtitle)}
              >
                <Text style={styles.actionButtonText}>{card.actionText}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* To-do List Card */}
        <View style={[styles.card, styles.fullWidthCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>To-do list</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handlePress('Help me create a to-do list')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.todoItem}
              onPress={() => handlePress(action.text)}
            >
              <View style={styles.checkbox}>
                {action.completed && <View style={styles.checkboxFilled} />}
              </View>
              <Text style={styles.todoText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder Card */}
        <TouchableOpacity
          style={[styles.card, styles.fullWidthCard]}
          onPress={() => handlePress(`Remind me to ${reminderCard.subtitle}`)}
        >
          <Text style={styles.cardTitle}>Study Reminder</Text>
          <View style={styles.reminderContent}>
            <View>
              <Text style={styles.reminderTitle}>{reminderCard.subtitle}</Text>
              <Text style={styles.reminderTime}>{reminderCard.time}</Text>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              onPress={() => handlePress('Set a study reminder for later')}
            >
              <Text style={styles.actionButtonText}>
                {reminderCard.actionText}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Add Care Team / Get Help Card */}
        <TouchableOpacity
          style={[styles.card, styles.fullWidthCard, styles.addTeamCard]}
          onPress={() => handlePress('I need help with my studies')}
        >
          <Text style={styles.addTeamText}>Ask EduLearn AI{'\n'}for help!</Text>
          <View style={styles.addTeamButton}>
            <Text style={styles.addTeamButtonText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  tabContainer: {
    maxHeight: 50,
    marginBottom: 15,
    marginTop: 10,
  },
  tabContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: RFValue(13),
    color: '#fff',
    fontWeight: '500',
    opacity: 0.9,
  },
  activeTabText: {
    color: '#1e293b',
    fontWeight: '600',
    opacity: 1,
  },
  cardsGrid: {
    paddingHorizontal: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    marginRight: 10,
  },
  fullWidthCard: {
    marginRight: 0,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  iconEmoji: {
    fontSize: RFValue(32),
    marginVertical: 8,
  },
  cardSubtitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: RFValue(18),
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: RFValue(20),
    fontWeight: '600',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  todoText: {
    fontSize: RFValue(13),
    color: '#1e293b',
    flex: 1,
  },
  reminderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reminderTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: RFValue(12),
    color: '#64748b',
  },
  addTeamCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addTeamText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#64748b',
    lineHeight: RFValue(20),
  },
  addTeamButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTeamButtonText: {
    color: '#fff',
    fontSize: RFValue(24),
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default DashboardEmptyState;
