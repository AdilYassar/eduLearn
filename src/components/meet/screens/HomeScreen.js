/* eslint-disable no-unused-vars */
import { TouchableOpacity, View, Text, Alert, FlatList, Image } from 'react-native';
import React, { useState } from 'react';
import { homeStyles } from '../styles/homeStyles';
import HomeHeader from '../components/ui/HomeHeader';
import { navigate } from '@utils/Navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import { useUserStore } from '../components/serviceComponent/zustandStore';
import { useWS } from '../components/serviceComponent/api/WSProvider';
import { useCallStore } from '../components/serviceComponent/callStore';
import { addHyphens, removeHyphens } from '../utils/Helpers';
import { checkSession } from '../components/serviceComponent/api/session';

const HomeScreen = () => {
    const { user, sessions, addSession, removeSession } = useUserStore();
    const { emit } = useWS();
    const { addSessionId, removeSessionId } = useCallStore();

    const handleNavigation = () => {
        const storedName = user?.name;
        if (!storedName) {
            console.log('User name is not set, opening modal'); // Debug log
            Alert.alert('Please set your name in the settings screen before joining a call');
            return;
        }
        navigate('JoinCallScreen');
    };

    const joinViaSessionId = async (id) => {
        const storedName = user?.name;
        if (!storedName) {
            Alert.alert('Please set your name in the settings screen before joining a call');
            return;
        }
        const isAvailable = await checkSession(id);
        if (isAvailable) {
            emit('prepare-session', { 
              userId: user?.id, 
              sessionId: removeHyphens(id)
            
            
            },
          )
          addSession(id);
          addSessionId(id);
          navigate('PrepareCallScreen');

        } else {
            removeSession(id);
            removeSessionId(id); 
            Alert.alert('Session is not available');
        }
    };

    const renderSessions = ({ item }) => {
        return (
            <View style={homeStyles.sessionContainer}>
                <Icon name="calendar-today" size={RFValue(20)} />
                <View style={homeStyles.sessionTextContainer}>
                    <Text style={homeStyles.sessionTitle}>{addHyphens(item)}</Text>
                    <Text style={homeStyles.sessionTime}>just join</Text>
                    <TouchableOpacity
                        style={homeStyles.joinButton}
                        onPress={() => joinViaSessionId(item)}
                    >
                        <Text style={homeStyles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={homeStyles.container}>
            <HomeHeader />
            <FlatList
                data={sessions}
                renderItem={renderSessions}
                keyExtractor={(item) => item}
                contentContainerStyle={{ paddingVertical: 20 }}
                ListEmptyComponent={
                    <>
                        <Image
                            source={require('../../../assets/bg.png')}
                            style={homeStyles.img}
                        />
                        <Text style={homeStyles.title}>Video Calls with Fellow Students</Text>
                        <Text style={homeStyles.subTitle}>
                            Join a call or start a new one to discuss more about your course-related things
                        </Text>
                    </>
                }
            />
            <TouchableOpacity
                style={homeStyles.absoluteButton}
                onPress={handleNavigation}
            >
                <Icon name="add" size={RFValue(20)} />
            </TouchableOpacity>
        </View>
    );
};

export default HomeScreen;