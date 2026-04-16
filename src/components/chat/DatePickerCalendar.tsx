import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, ThemedText } from '../ui/ThemedComponents';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface DatePickerCalendarProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  isVisible,
  onClose,
  onDateSelect,
  selectedDate,
}) => {
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateSelect(newDate.toISOString());
    onClose();
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: firstDayOfMonth }).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const isDateSelected = (day: number) => {
    if (!selectedDate || !day) return false;
    const selected = new Date(selectedDate);
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={styles.modal}
      backdropOpacity={0.5}
    >
      <Animated.View entering={FadeInUp} style={styles.container}>
        <GlassCard
          style={styles.calendarCard}
          opacity={0.1}
          glow={true}
          glowColor={theme.primary}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.text.secondary + '40' }]}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <ChevronLeft size={24} color={theme.primary} />
            </TouchableOpacity>
            <ThemedText style={styles.monthYear} weight="bold" size={RFValue(16)}>
              {monthName}
            </ThemedText>
            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronRight size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdayHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <ThemedText style={styles.weekdayText} weight="semibold" size={RFValue(11)}>
                  {day}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.daysContainer}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => day && handleDateSelect(day)}
                disabled={!day}
                style={[
                  styles.dayCell,
                  isDateSelected(day as number) && {
                    backgroundColor: theme.primary,
                  },
                ]}
              >
                {day ? (
                  <ThemedText
                    style={[
                      styles.dayText,
                      isDateSelected(day as number) && styles.selectedDayText,
                    ]}
                    size={RFValue(12)}
                  >
                    {day}
                  </ThemedText>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.text.secondary + '20' }]}
              onPress={onClose}
            >
              <ThemedText style={styles.btnText} weight="bold" size={RFValue(12)}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.primary }]}
              onPress={() => {
                selectedDate && onDateSelect(selectedDate);
                onClose();
              }}
            >
              <ThemedText style={styles.selectedBtnText} weight="bold" size={RFValue(12)}>
                Confirm
              </ThemedText>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  calendarCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  monthYear: {
    textAlign: 'center',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    opacity: 0.7,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
  },
  dayText: {
    textAlign: 'center',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    textAlign: 'center',
  },
  selectedBtnText: {
    textAlign: 'center',
    color: '#fff',
  },
});

export default DatePickerCalendar;
