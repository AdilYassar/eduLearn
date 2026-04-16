import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '../../context/ThemeContext';
import { ThemedText } from '../ui/ThemedComponents';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface DatePickerDropdownProps {
  isVisible: boolean;
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({
  isVisible,
  onDateSelect,
  selectedDate,
}) => {
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isVisible) return null;

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
    <Animated.View entering={FadeInDown} style={styles.container}>
      <View style={[styles.calendarCard, { backgroundColor: theme.secondary }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.text.secondary + '40' }]}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <ChevronLeft size={22} color={theme.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.monthYear} weight="bold" size={RFValue(14)}>
            {monthName}
          </ThemedText>
          <TouchableOpacity onPress={handleNextMonth}>
            <ChevronRight size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <ThemedText style={styles.weekdayText} weight="semibold" size={RFValue(10)}>
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
                  size={RFValue(11)}
                >
                  {day}
                </ThemedText>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'visible',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
  },
  dayCell: {
    width: '14.285714%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 8,
  },
  dayText: {
    textAlign: 'center',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DatePickerDropdown;
