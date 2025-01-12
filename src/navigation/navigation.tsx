//import libraries



import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from '../utils/Navigation';
import { FC } from 'react';
import React from 'react';

import IntroductionScreen from '../features/screens/IntroductionScreen';
import SplashScreen from '../features/screens/SplashScreen';
import CategoryScreen from '../features/screens/CategoryScreen';
import CourseScreen from '../features/screens/CourseScreen';
import Details from '../features/screens/Details';
import MarkSummaryScreen from '../features/screens/MarksSummaryScreen';
import QuizScreen from '../features/screens/QuizScreen';
import DescriptionScreen from '../features/screens/DescriptionScreen';
import LoginScreen from '../features/screens/LoginScreen';
import AdminLoginScreen from '../features/screens/AdminLoginScreen';
import DashboardScreen from '../features/screens/DashboardScreen';
import Profile from '../features/screens/Profile';
import TheoryScreen from '../features/screens/TheoryScreen';
import BookScreen from '../features/screens/BookScreen';


const Stack = createNativeStackNavigator();

// create a component
const Navigation: FC = () => {
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                initialRouteName="SplashScreen" // Correct placement
                screenOptions={{
                    headerShown: false, // Correct placement and syntax
                }}
            >
                <Stack.Screen name="IntroductionScreen" component={IntroductionScreen} />
                <Stack.Screen name="SplashScreen" component={SplashScreen} />
                <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
                <Stack.Screen name="CourseScreen" component={CourseScreen} />
                <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
                <Stack.Screen name="Details" component={Details} />
                <Stack.Screen name="MarkSummaryScreen" component={MarkSummaryScreen} />
                <Stack.Screen name="BookScreen" component={BookScreen} />
                <Stack.Screen name="QuizScreen" component={QuizScreen} />
                <Stack.Screen name="TheoryScreen" component={TheoryScreen} />
                <Stack.Screen name="DescriptionScreen" component={DescriptionScreen} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen
                options={{
                    animation:'fade',
                }}
                name="LoginScreen" component={LoginScreen} />
                <Stack.Screen
                options={{
                    animation:'fade',
                }}
                 name="AdminLoginScreen" component={AdminLoginScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

// define your styles

//make this component available to the app
export default Navigation;
