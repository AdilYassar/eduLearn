import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageSquare, Heart } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { push } from '../../utils/Navigation';

const SocialCard = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Social hub</Text>
        <Text style={[styles.onlineText, { color: '#2DD4BF' }]}>● 8 online</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={() => push('SocialNavigator')}>
        <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }]}>
          
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, styles.z3, { backgroundColor: '#B388FF' }]}>
              <Text style={styles.avatarInitials}>S</Text>
            </View>
            <View style={[styles.avatar, styles.z2, { backgroundColor: '#2DD4BF' }]}>
              <Text style={styles.avatarInitials}>A</Text>
            </View>
            <View style={[styles.avatar, styles.z1, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[styles.avatarInitials, { color: theme.text.secondary }]}>+5</Text>
            </View>
          </View>

          <Text style={[styles.activityText, { color: theme.text.secondary }]}>
            <Text style={{ fontWeight: 'bold', color: theme.text.primary }}>Sam</Text> and 4 others are studying{' '}
            <Text style={{ color: '#B388FF' }}>Physics</Text>
          </Text>

          <View style={styles.footerRow}>
             <View style={styles.iconStat}>
                <MessageSquare size={12} color={theme.text.secondary} />
                <Text style={[styles.statText, { color: theme.text.secondary }]}>12</Text>
             </View>
             <View style={[styles.iconStat, { marginLeft: 16 }]}>
                <Heart size={12} color={theme.text.secondary} />
                <Text style={[styles.statText, { color: theme.text.secondary }]}>45</Text>
             </View>
          </View>

        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#121212', // to mask the overlap
    marginLeft: -8, // negative margin for overlap
  },
  z3: { zIndex: 3, marginLeft: 0 },
  z2: { zIndex: 2 },
  z1: { zIndex: 1 },
  avatarInitials: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  activityText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
});

export default SocialCard;
