import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { 
  Headphones, 
  Mail, 
  Phone, 
  ChevronRight, 
  MessageCircle, 
  HelpCircle, 
  FileText,
  Plus,
  Clock,
  CheckCircle,
  X
} from 'lucide-react-native';
import { ThemedContainer, ThemedText, ThemedHeader, GlassCard, ThemedButton } from '../../components/ui/ThemedComponents';
import { useTheme } from '../../context/ThemeContext';
import { navigate } from '../../utils/Navigation';
import { supportService } from '../../service/supportService';

const CustomerSupportScreen = () => {
  const { theme } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // New Ticket Form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await supportService.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
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

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await supportService.createTicket({ subject, initialMessage: message });
      setSubject('');
      setMessage('');
      setIsModalVisible(false);
      fetchTickets();
      Alert.alert('Success', 'Your support ticket has been created.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return '#10B981';
      case 'in progress': return '#F59E0B';
      case 'resolved': return theme.primary;
      case 'closed': return theme.text.secondary;
      default: return theme.text.secondary;
    }
  };

  const s = styles(theme);

  return (
    <ThemedContainer>
      <ThemedHeader 
        title="Customer Support" 
        showBack 
        rightAction={
          <TouchableOpacity onPress={() => setIsModalVisible(true)} style={s.headerPlus}>
            <Plus size={24} color={theme.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView 
        contentContainerStyle={s.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        
        <View style={s.heroSection}>
          <View style={[s.heroIconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Headphones size={48} color={theme.primary} />
          </View>
          <ThemedText weight="bold" size="large" style={s.heroTitle}>
            How can we help you?
          </ThemedText>
        </View>

        {/* 1. MY TICKETS SECTION */}
        <ThemedText weight="bold" style={s.sectionTitle}>My Support Tickets</ThemedText>
        {loading ? (
          <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
        ) : tickets.length > 0 ? (
          tickets.map((ticket: any) => (
            <TouchableOpacity 
              key={ticket._id} 
              activeOpacity={0.7} 
              style={{ marginBottom: 12 }}
              onPress={() => navigate('SupportChatScreen', { ticketId: ticket._id, subject: ticket.subject })}
            >
              <GlassCard style={s.ticketCard}>
                <View style={s.ticketInfo}>
                  <ThemedText weight="semibold">{ticket.subject}</ThemedText>
                  <View style={s.ticketMeta}>
                    <View style={[s.statusDot, { backgroundColor: getStatusColor(ticket.status) }]} />
                    <ThemedText variant="secondary" style={{ fontSize: 11, textTransform: 'capitalize' }}>
                      {ticket.status} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.text.secondary} />
              </GlassCard>
            </TouchableOpacity>
          ))
        ) : (
          <GlassCard style={s.emptyCard}>
            <HelpCircle size={32} color={theme.text.secondary + '40'} />
            <ThemedText variant="secondary" style={s.emptyText}>No active support tickets.</ThemedText>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <ThemedText weight="bold" style={{ color: theme.primary, marginTop: 8 }}>Open a Ticket</ThemedText>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* 2. DIRECT CONTACT */}
        <ThemedText weight="bold" style={s.sectionTitle}>Direct Contact</ThemedText>
        <View style={s.contactRow}>
          <TouchableOpacity 
            style={[s.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => Linking.openURL('mailto:support@edulearn.app')}
          >
            <Mail size={24} color={theme.primary} />
            <ThemedText weight="semibold" style={s.contactLabel}>Email Us</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.contactCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => Linking.openURL('tel:+1234567890')}
          >
            <Phone size={24} color={theme.primary} />
            <ThemedText weight="semibold" style={s.contactLabel}>Call Us</ThemedText>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* NEW TICKET MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <GlassCard style={s.modalContent}>
            <View style={s.modalHeader}>
              <ThemedText weight="bold" size="large">Open New Ticket</ThemedText>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={theme.text.primary} />
              </TouchableOpacity>
            </View>

            <ThemedText weight="semibold" style={s.inputLabel}>Subject</ThemedText>
            <TextInput
              style={[s.textInput, { color: theme.text.primary, borderColor: theme.border }]}
              placeholder="What is this regarding?"
              placeholderTextColor={theme.text.secondary + '60'}
              value={subject}
              onChangeText={setSubject}
            />

            <ThemedText weight="semibold" style={s.inputLabel}>Message</ThemedText>
            <TextInput
              style={[s.textInput, s.textArea, { color: theme.text.primary, borderColor: theme.border }]}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={theme.text.secondary + '60'}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />

            <ThemedButton
              title={isSubmitting ? "Creating..." : "Submit Ticket"}
              onPress={handleCreateTicket}
              disabled={isSubmitting}
              style={{ marginTop: 24 }}
            />
          </GlassCard>
        </View>
      </Modal>
    </ThemedContainer>
  );
};

const styles = (theme: any) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerPlus: {
    padding: 8,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  heroIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 24,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  contactLabel: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: '60%',
    backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 120,
  }
});

export default CustomerSupportScreen;
