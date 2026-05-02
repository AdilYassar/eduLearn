import React, { useEffect, useState, createContext, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    Home,
    Users,
    MessageSquare,
    Bell,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authService, socialSocketService } from '../service/social';
import { setCurrentUser, updateFriendStatus } from '../redux/reducers/socialSlice';
import { runSocialDebug } from '../service/social/apiDebug';
import { useTheme } from '../context/ThemeContext';

// Screens
import { FeedScreen } from '../features/Social/FeedScreen';
import { FriendsScreen } from '../features/Social/FriendsScreen';
import { ChatListScreen } from '../features/Social/ChatListScreen';
import { ChatScreen } from '../features/Social/ChatScreen';
import { NotificationsScreen } from '../features/Social/NotificationsScreen';
import { EditProfileScreen } from '../features/Social/EditProfileScreen';
import { CreateGroupScreen } from '../features/Social/CreateGroupScreen';
import { AddMembersScreen } from '../features/Social/AddMembersScreen';

const Stack = createNativeStackNavigator();

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
    { key: 'Feed',          label: 'Feed',     Icon: Home,          Component: FeedScreen },
    { key: 'Friends',       label: 'Friends',  Icon: Users,         Component: FriendsScreen },
    { key: 'Messages',      label: 'Messages', Icon: MessageSquare, Component: ChatListScreen },
    { key: 'Notifications', label: 'Notifs',   Icon: Bell,          Component: NotificationsScreen },
];

// ── Tab Context — lets any child call switchTab('Friends') ─────────────────────
export const SocialTabContext = createContext<{ switchTab: (key: string) => void }>({
    switchTab: () => {},
});

// ── Custom Top Header Nav ─────────────────────────────────────────────────────
const SocialTabs = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('Feed');
    const unreadNotifications = useSelector((state: any) => state.social.unreadNotificationCount);

    return (
        <SocialTabContext.Provider value={{ switchTab: setActiveTab }}>
            <View style={[styles.tabContainer, { backgroundColor: theme.background[0] }]}>
                <StatusBar 
                    barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
                    backgroundColor="transparent" 
                    translucent
                />

                {/* ── Top Icon Tab Bar ── */}
                <SafeAreaView edges={['top']} style={{ backgroundColor: theme.background[0] }}>
                    <View style={[styles.topBar, { backgroundColor: theme.background[0], borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={styles.tabRow}>
                            {TABS.map(({ key, label, Icon }) => {
                                const isActive = activeTab === key;
                                const hasBadge = key === 'Notifications' && unreadNotifications > 0;
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={styles.tabItem}
                                        onPress={() => setActiveTab(key)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.tabIconWrap}>
                                            <Icon
                                                size={22}
                                                color={isActive ? theme.primary : (theme.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')}
                                                strokeWidth={isActive ? 2 : 1.5}
                                            />
                                            {hasBadge && <View style={[styles.badge, { backgroundColor: theme.primary, borderColor: theme.background[0] }]} />}
                                        </View>
                                        <Text style={[
                                            styles.tabLabel, 
                                            { color: isActive ? theme.primary : (theme.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') },
                                            isActive && styles.tabLabelActive
                                        ]}>
                                            {label}
                                        </Text>
                                        {isActive && <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </SafeAreaView>

                {/* ── All screens mounted; only active one is visible ── */}
                <View style={[styles.screenContainer, { backgroundColor: theme.background[0] }]}>
                    {TABS.map(({ key, Component }) => (
                        <View
                            key={key}
                            style={[
                                styles.screenSlot,
                                activeTab !== key && styles.screenHidden,
                            ]}
                        >
                            <Component />
                        </View>
                    ))}
                </View>
            </View>
        </SocialTabContext.Provider>
    );
};

// ── Social Navigator ──────────────────────────────────────────────────────────
export const SocialNavigator = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const initSocial = async () => {
            try {
                const response = await authService.initialize();
                if (response.status === 'success' && response.data) {
                    dispatch(setCurrentUser(response.data));
                    import('@react-native-async-storage/async-storage').then(async (module) => {
                        const AsyncStorage = module.default;
                        const storedToken = await AsyncStorage.getItem('accessToken');
                        if (storedToken) {
                            socialSocketService.connect(storedToken);
                        }
                    });
                    runSocialDebug();
                }
            } catch (error) {
                console.error('Failed to initialize social:', error);
            }
        };
        initSocial();
        return () => { socialSocketService.disconnect(); };
    }, [dispatch]);

    useEffect(() => {
        const unsubOnline = socialSocketService.on('user:online', (data) => {
            dispatch(updateFriendStatus({ uuid: data.userUUID, isOnline: true }));
        });
        const unsubOffline = socialSocketService.on('user:offline', (data) => {
            dispatch(updateFriendStatus({ uuid: data.userUUID, isOnline: false, lastSeen: data.lastSeen }));
        });
        return () => { unsubOnline(); unsubOffline(); };
    }, [dispatch]);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SocialTabs" component={SocialTabs} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="AddMembers" component={AddMembersScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flex: 1,
    },
    topBar: {
    },
    tabRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        position: 'relative',
    },
    tabIconWrap: {
        position: 'relative',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 3,
        letterSpacing: 0.3,
    },
    tabLabelActive: {
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -1,
        left: '20%',
        right: '20%',
        height: 2,
        borderRadius: 2,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -4,
        width: 7,
        height: 7,
        borderRadius: 4,
        borderWidth: 1.5,
    },
    screenContainer: {
        flex: 1,
    },
    screenSlot: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    screenHidden: {
        display: 'none',
    },
});
