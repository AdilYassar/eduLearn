import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '../../context/ThemeContext';

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

interface DashboardEmptyStateProps {
  isTyping: boolean;
  userName?: string;
  onCardPress?: (text: string) => void;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  onCardPress,
}) => {
  const { theme } = useTheme();

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
              style={[
                styles.tab, 
                { 
                  backgroundColor: index === 0 ? theme.primary + '20' : 'rgba(255,255,255,0.03)',
                  borderColor: index === 0 ? theme.primary : 'rgba(255,255,255,0.1)'
                }
              ]}
              onPress={() => handlePress(`Tell me about ${tab.toLowerCase()}`)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  { color: index === 0 ? theme.primary : theme.text.secondary }
                ]}
              >
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
            <View key={card.id} style={[styles.card, { borderColor: 'rgba(255,255,255,0.05)' }]}>
              <Text style={[styles.cardTitle, { color: theme.text.secondary }]}>{card.title}</Text>
              <Text style={styles.iconEmoji}>{card.icon}</Text>
              <Text style={[styles.cardSubtitle, { color: theme.text.primary }]}>{card.subtitle}</Text>
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
        <View style={[styles.card, styles.fullWidthCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>To-do list</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
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
              <View style={[styles.checkbox, { borderColor: 'rgba(255,255,255,0.2)' }]}>
                {action.completed && <View style={[styles.checkboxFilled, { backgroundColor: theme.primary }]} />}
              </View>
              <Text style={[styles.todoText, { color: theme.text.secondary }]}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Care Team / Get Help Card - FIXED DASHED BACKGROUND */}
        <TouchableOpacity
          style={[styles.addTeamCard, { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.15)' }]}
          onPress={() => handlePress('I need help with my studies')}
        >
          <Text style={[styles.addTeamText, { color: theme.text.primary }]}>Ask EduLearn AI{'\n'}for help!</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: RFValue(12),
    fontWeight: '500',
  },
  cardsGrid: {
    paddingHorizontal: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
  },
  fullWidthCard: {
    marginRight: 0,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: RFValue(12),
    fontWeight: '600',
    marginBottom: 4,
  },
  iconEmoji: {
    fontSize: RFValue(22),
    marginVertical: 4,
  },
  cardSubtitle: {
    fontSize: RFValue(13),
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: RFValue(16),
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: RFValue(11),
    fontWeight: '600',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFilled: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  todoText: {
    fontSize: RFValue(12),
    flex: 1,
  },
  addTeamCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addTeamText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    lineHeight: RFValue(18),
  },
  addTeamButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTeamButtonText: {
    color: '#fff',
    fontSize: RFValue(20),
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 12,
  },
});

export default DashboardEmptyState;
