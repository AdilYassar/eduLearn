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
import QuizStart from '../features/screens/QuizStart';
import QuizQuestions from '../features/screens/QuizQuestions';
import MetaAi from '../features/screens/MetaAi';
import Ai from '../features/screens/Ai';
import HomeScreen from '../components/meet/screens/HomeScreen';
import JoinCallScreen from '../components/meet/screens/JoinCallScreen';
import LiveCallScreen from '../components/meet/screens/LiveCallScreen';
import PrepareCallScreen from '../components/meet/screens/PrepareCallScreen';
import { WSProvider } from '@components/meet/components/serviceComponent/api/WSProvider';
import PodcastLoginScreen from '@components/Podcasts/features/auth/PodcastLoginScreen';
import PodcastSplashScreen from '@components/Podcasts/features/auth/PodcastSplashScreen';
import PodcastRegisterScreen from '@components/Podcasts/features/auth/PodcastRegisterScreen';
import PodcastHomeScreen from '@components/Podcasts/features/home/PodcastHomeScreen';
import PodcastSearchScreen from '@components/Podcasts/features/search/PodcastSearchScreen';
import PodcastFavouriteScreen from '@components/Podcasts/features/favourite/PodcastFavouriteScreen';
import UserBottomTab from '@components/Podcasts/features/tabs/UserBottomTab';


const Stack = createNativeStackNavigator();

// create a component
const Navigation: FC = () => {
    return (
        <WSProvider>
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
                <Stack.Screen name="QuizQuestions" component={QuizQuestions} />
                <Stack.Screen name="MetaAi" component={MetaAi} />
                <Stack.Screen name="Ai" component={Ai} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="JoinCallScreen" component={JoinCallScreen} />
                <Stack.Screen name="LiveCallScreen" component={LiveCallScreen} />
                <Stack.Screen name="PrepareCallScreen" component={PrepareCallScreen} />
                <Stack.Screen name="PodcastLoginScreen" component={PodcastLoginScreen} />
                <Stack.Screen name="PodcastSplashScreen" component={PodcastSplashScreen} />
                <Stack.Screen name="MarkSummaryScreen" component={MarkSummaryScreen} />
                <Stack.Screen name="BookScreen" component={BookScreen} />
                <Stack.Screen name="QuizScreen" component={QuizScreen} />
                <Stack.Screen name="QuizStart" component={QuizStart} />
                <Stack.Screen name="PodcastRegisterScreen" component={PodcastRegisterScreen} />
                <Stack.Screen name="TheoryScreen" component={TheoryScreen} />
                <Stack.Screen name="DescriptionScreen" component={DescriptionScreen} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="PodcastHomeScreen" component={PodcastHomeScreen} />
                <Stack.Screen name="PodcastSearchScreen" component={PodcastSearchScreen} />
                <Stack.Screen name="PodcastFavouriteScreen" component={PodcastFavouriteScreen} />
                <Stack.Screen name="UserBottomTab" component={UserBottomTab} />






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
        </WSProvider>
    );
};

// define your styles

//make this component available to the app
export default Navigation;
