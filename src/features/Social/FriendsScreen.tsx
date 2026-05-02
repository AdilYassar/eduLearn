import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { FriendsList } from '../../components/social/Friends/FriendsList';
import { FriendRequests } from '../../components/social/Friends/FriendRequests';
import { UserSearch } from '../../components/social/Friends/UserSearch';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { chatService } from '../../service/social';
import { addConversation, setActiveConversation } from '../../redux/reducers/socialSlice';
import type { Friend } from '../../service/social/types';

import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, ThemedHeader } from '../../components/ui/ThemedComponents';

export const FriendsScreen: React.FC = () => {
    const layout = useWindowDimensions();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { theme } = useTheme();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'friends', title: 'Friends' },
        { key: 'requests', title: 'Requests' },
        { key: 'search', title: 'Discover' },
    ]);

    const conversations = useSelector((state: any) => state.social.conversations);

    const handleFriendPress = async (friend: Friend) => {
        const existingConv = conversations.find((c: any) =>
            c.type === 'direct' &&
            c.participantUUIDs.includes(friend.quizServerUUID)
        );

        if (existingConv) {
            navigation.navigate('ChatScreen' as never, { conversationId: existingConv._id } as never);
            return;
        }

        try {
            const response = await chatService.createConversation(friend.quizServerUUID);
            if (response.status === 'success' && response.data) {
                dispatch(addConversation(response.data));
                navigation.navigate('ChatScreen' as never, { conversationId: response.data._id } as never);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'friends':
                return <FriendsList onFriendPress={handleFriendPress} />;
            case 'requests':
                return <FriendRequests />;
            case 'search':
                return <UserSearch />;
            default:
                return null;
        }
    };

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.primary, height: 3, borderRadius: 2 }}
            style={{
                backgroundColor: theme.background[0],
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
            activeColor={theme.primary}
            inactiveColor={theme.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
            labelStyle={{ fontWeight: '700', fontSize: 13, textTransform: 'none' }}
            tabStyle={{ paddingVertical: 10 }}
        />
    );

    return (
        <ThemedContainer style={styles.container} useGradient={false} edges={['left', 'right']}>
            <ThemedHeader title="Neural Friends" />
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
            />
        </ThemedContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
