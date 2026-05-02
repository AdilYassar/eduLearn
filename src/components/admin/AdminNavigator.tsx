import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminLoginScreen from './screens/AdminLoginScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminStudentManagementScreen from './screens/AdminStudentManagementScreen';
import AdminCourseManagementScreen from './screens/AdminCourseManagementScreen';
import AdminQuizManagementScreen from './screens/AdminQuizManagementScreen';
import AdminVideoLibraryScreen from './screens/AdminVideoLibraryScreen';
import AdminPerformanceScreen from './screens/AdminPerformanceScreen';
import AdminSettingsScreen from './screens/AdminSettingsScreen';
import AdminBookLibraryScreen from './screens/AdminBookLibraryScreen';
import AdminFeedbackScreen from './screens/AdminFeedbackScreen';
import AdminSupportTicketsScreen from './screens/AdminSupportTicketsScreen';
import AdminSupportChatScreen from './screens/AdminSupportChatScreen';

const Stack = createNativeStackNavigator();

export const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="AdminLoginScreen"
    >
      <Stack.Screen name="AdminLoginScreen" component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminStudentManagement" component={AdminStudentManagementScreen} />
      <Stack.Screen name="AdminCourseManagement" component={AdminCourseManagementScreen} />
      <Stack.Screen name="AdminQuizManagement" component={AdminQuizManagementScreen} />
      <Stack.Screen name="AdminVideoLibrary" component={AdminVideoLibraryScreen} />
      <Stack.Screen name="AdminPerformance" component={AdminPerformanceScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="AdminBookLibrary" component={AdminBookLibraryScreen} />
      <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
      <Stack.Screen name="AdminSupportTickets" component={AdminSupportTicketsScreen} />
      <Stack.Screen name="AdminSupportChatScreen" component={AdminSupportChatScreen} />
    </Stack.Navigator>
  );
};

