import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  FileText, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User
} from 'lucide-react-native';
import { useAppTheme } from '../../../context/ThemeContext';
import AdminHeader from '../ui/AdminHeader';
import { AdminCard } from '../ui/AdminCard';
import { adminSupportService } from '../services/adminAPI';

const AdminSupportTicketsScreen = ({ navigation }: any) => {
  const { theme } = useAppTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const response = await adminSupportService.getTickets();
      console.log('AdminSupportTicketsScreen: API Response:', response.data);
      // Handle direct array, .tickets, or .data wrapped formats
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data.tickets || response.data.data || []);
      setTickets(data);
    } catch (error) {
      console.error('AdminSupportTicketsScreen: Error fetching tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return { color: '#10B981', icon: Clock };
      case 'resolved': return { color: '#5D4BA3', icon: CheckCircle2 };
      case 'closed': return { color: '#797582', icon: AlertCircle };
      default: return { color: '#797582', icon: Clock };
    }
  };

  const renderTicketItem = ({ item }: any) => {
    const statusInfo = getStatusInfo(item.status);
    const StatusIcon = statusInfo.icon;

    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => navigation.navigate('AdminSupportChatScreen', { ticketId: item._id, ticket: item })}
      >
        <AdminCard style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View style={styles.ticketTitleRow}>
              <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
                <StatusIcon size={12} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{item.status}</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.dark ? '#484551' : '#EDE5F8'} />
          </View>

          <View style={styles.studentRow}>
            <User size={14} color={theme.dark ? '#cac4d3' : '#797582'} />
            <Text style={styles.studentName}>{item.studentName || 'Student ID: ' + item.userId}</Text>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.priorityRow}>
            <View style={[styles.priorityDot, { backgroundColor: item.priority === 'High' ? '#EF4444' : '#F59E0B' }]} />
            <Text style={styles.priorityText}>{item.priority} Priority</Text>
          </View>
        </AdminCard>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    listContent: {
      padding: 16,
    },
    ticketCard: {
      padding: 16,
      marginBottom: 12,
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    ticketTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 8,
    },
    ticketSubject: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      flexShrink: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      gap: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    studentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    studentName: {
      fontSize: 13,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '500',
    },
    dateText: {
      marginLeft: 'auto',
      fontSize: 11,
      color: theme.dark ? '#cac4d3' : '#797582',
    },
    priorityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    priorityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.dark ? '#cac4d3' : '#797582',
    },
    emptyContainer: {
      padding: 60,
      alignItems: 'center',
    },
    emptyText: {
      marginTop: 16,
      color: theme.dark ? '#cac4d3' : '#797582',
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title="Support Tickets"
        subtitle="Manage student inquiries"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#5D4BA3" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5D4BA3" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileText size={64} color={theme.dark ? '#312f36' : '#EDE5F8'} />
              <Text style={styles.emptyText}>No active support tickets found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminSupportTicketsScreen;
