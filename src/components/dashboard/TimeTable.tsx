import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@utils/Constants';

interface Class {
  id: string;
  subject: string;
  time: string;
}

interface DaySchedule {
  day: string;
  classes: Class[];
}

const TimeTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [timetable, setTimetable] = useState<DaySchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [time, setTime] = useState<string>('');

  // Load saved timetable from AsyncStorage
  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const savedTimetable = await AsyncStorage.getItem('timetable');
        if (savedTimetable) {
          setTimetable(JSON.parse(savedTimetable));
        }
      } catch (error) {
        console.error('Failed to load timetable:', error);
      }
    };

    loadTimetable();
  }, []);

  // Save timetable to AsyncStorage
  const saveTimetable = async () => {
    try {
      await AsyncStorage.setItem('timetable', JSON.stringify(timetable));
      Alert.alert('Success', 'Timetable saved successfully!');
    } catch (error) {
      console.error('Failed to save timetable:', error);
      Alert.alert('Error', 'Failed to save timetable. Please try again.');
    }
  };

  // Add a class to the selected day
  const addClass = () => {
    if (!selectedDay || !subject || !time) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newClass: Class = {
      id: Math.random().toString(), // Generate a unique ID
      subject,
      time,
    };

    const updatedTimetable = timetable.map((daySchedule) =>
      daySchedule.day === selectedDay
        ? { ...daySchedule, classes: [...daySchedule.classes, newClass] }
        : daySchedule
    );

    setTimetable(updatedTimetable);
    setSubject('');
    setTime('');
  };

  // Clear timetable
  const clearTimetable = async () => {
    try {
      await AsyncStorage.removeItem('timetable');
      setTimetable([]);
      Alert.alert('Success', 'Timetable cleared successfully!');
    } catch (error) {
      console.error('Failed to clear timetable:', error);
      Alert.alert('Error', 'Failed to clear timetable. Please try again.');
    }
  };

  // Initialize timetable with empty classes for each day
  const initializeTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const initialTimetable = days.map((day) => ({
      day,
      classes: [],
    }));
    setTimetable(initialTimetable);
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Add Timetable Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={initializeTimetable}
      >
        <Text style={styles.addButtonText}>Add Timetable</Text>
      </TouchableOpacity>

      {/* Display Timetable */}
      {timetable.length > 0 ? (
        <ScrollView style={styles.timetableContainer}>
          {timetable.map((daySchedule) => (
            <View key={daySchedule.day} style={styles.dayContainer}>
              <Text style={styles.dayText}>{daySchedule.day}</Text>
              {daySchedule.classes.length > 0 ? (
                <FlatList
                  data={daySchedule.classes}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.classContainer}>
                      <Text style={styles.classText}>
                        {item.subject} - {item.time}
                      </Text>
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.noClassesText}>No classes added yet.</Text>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noTimetableText}>No timetable added yet.</Text>
      )}

      {/* Clear Timetable Button */}
      {timetable.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearTimetable}
        >
          <Icon name="delete" size={24} color={Colors.primary_dark} />
        </TouchableOpacity>
      )}

      {/* Modal for Adding Classes */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Class</Text>

            {/* Day Picker */}
            <Text style={styles.label}>Select Day</Text>
            <View style={styles.dayPicker}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDay === day && styles.selectedDayButton,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDay === day && styles.selectedDayButtonText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subject Input */}
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
            />

            {/* Time Input */}
            <TextInput
              style={styles.input}
              placeholder="Time (e.g., 10:00 AM)"
              value={time}
              onChangeText={setTime}
            />

            {/* Add Class Button */}
            <TouchableOpacity
              style={[styles.modalButton, styles.addClassButton]}
              onPress={addClass}
            >
              <Text style={styles.modalButtonText}>Add Class</Text>
            </TouchableOpacity>

            {/* Save and Cancel Buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveTimetable}
              >
                <Text style={styles.modalButtonText}>Save Timetable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F7FB',
  },
  addButton: {
    backgroundColor: Colors.primary_dark,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timetableContainer: {
    flex: 1,
  },
  dayContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  classContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  classText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  noClassesText: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  noTimetableText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#BDC3C7',
    marginTop: 20,
  },
  clearButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 10,
  },
  dayPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedDayButton: {
    backgroundColor: '#007BFF',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  addClassButton: {
    backgroundColor: '#28a745',
  },
  saveButton: {
    backgroundColor: '#007BFF',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TimeTable;