import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, MessageSquare, User, Calendar } from 'lucide-react-native';
import { useAppTheme } from '../../../context/ThemeContext';
import AdminHeader from '../ui/AdminHeader';
import { AdminCard } from '../ui/AdminCard';
import { adminSupportService } from '../services/adminAPI';

const AdminFeedbackScreen = ({ navigation }: any) => {
  const { theme } = useAppTheme();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedback = async () => {
    try {
      const response = await adminSupportService.getFeedback();
      console.log('AdminFeedbackScreen: API Response:', response.data);
      // Handle direct array, .feedback, or .data wrapped formats
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data.feedback || response.data.data || []);
      setFeedback(data);
    } catch (error) {
      console.error('AdminFeedbackScreen: Error fetching feedback:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedback();
  };

  const renderFeedbackItem = ({ item }: any) => (
    <AdminCard style={styles.feedbackCard}>
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.dark ? '#312f36' : '#F8F6FD' }]}>
            <User size={16} color="#5D4BA3" />
          </View>
          <View>
            <Text style={styles.studentName}>{item.studentName || 'Anonymous'}</Text>
            <Text style={styles.studentEmail}>{item.studentEmail}</Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: '#5D4BA315' }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= item.rating ? '#FFD700' : theme.dark ? '#484551' : '#EDE5F8'}
            fill={star <= item.rating ? '#FFD700' : 'transparent'}
          />
        ))}
        <Text style={styles.dateText}>
          <Calendar size={12} color={theme.dark ? '#cac4d3' : '#797582'} /> {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.commentText}>{item.comment}</Text>
    </AdminCard>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    listContent: {
      padding: 16,
    },
    feedbackCard: {
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    studentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    studentName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    studentEmail: {
      fontSize: 11,
      color: theme.dark ? '#cac4d3' : '#797582',
    },
    categoryBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#5D4BA3',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 4,
    },
    dateText: {
      marginLeft: 'auto',
      fontSize: 11,
      color: theme.dark ? '#cac4d3' : '#797582',
    },
    commentText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      marginTop: 12,
      color: theme.dark ? '#cac4d3' : '#797582',
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title="Student Feedback"
        subtitle="Reviews and suggestions"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#5D4BA3" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={feedback}
          renderItem={renderFeedbackItem}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5D4BA3" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={theme.dark ? '#312f36' : '#EDE5F8'} />
              <Text style={styles.emptyText}>No feedback received yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminFeedbackScreen;
