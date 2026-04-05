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

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#0e0e0e',
    surface: '#1a1919',
    primary: '#f382ff',
    secondary: '#ac8aff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#adaaaa',
    outlineVariant: '#484847',
};

export const FriendsScreen: React.FC = () => {
    const layout = useWindowDimensions();
    const navigation = useNavigation();
    const dispatch = useDispatch();
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
            indicatorStyle={{ backgroundColor: C.primary, height: 2, borderRadius: 2 }}
            style={{ backgroundColor: C.bg, elevation: 0, shadowOpacity: 0 }}
            activeColor={C.primary}
            inactiveColor={C.outlineVariant}
            labelStyle={{ fontWeight: '700', fontSize: 13, textTransform: 'none' }}
            tabStyle={{ paddingVertical: 10 }}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: C.bg,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: C.onSurface,
        letterSpacing: -0.5,
    },
});
