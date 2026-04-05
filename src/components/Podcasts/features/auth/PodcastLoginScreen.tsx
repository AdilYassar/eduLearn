
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { Colors, Fonts } from '@utils/Constants'
import { screenHeight, screenWidth } from '../../utils/Scaling'
import CustomText from '@components/ui/CustomText'
import { navigate, resetAndNavigate } from '@utils/Navigation'
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../../graphQL/queries';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerStore } from '@components/Podcasts/state/usePlayerStore'

const PodcastLoginScreen = () => {
    const [email, setEmail] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')
    
    const {setUser} = usePlayerStore();
    
    const [login, {loading, error}] = useMutation(LOGIN_MUTATION);
    
    const handleLogin = async () => {
        // Basic validation
        if (!email.trim() || !password.trim()) {
            Alert.alert('Validation Error', 'Please enter both email and password.');
            return;
        }

        try {
            const {data} = await login({
                variables: {
                    email: email.trim(),
                    password
                }
            });
            
            if (data?.authenticateUserWithPassword?.sessionToken) {
                // Store token in AsyncStorage
                await AsyncStorage.setItem('token', data.authenticateUserWithPassword.sessionToken);
                
                // Update user in store
                setUser(data.authenticateUserWithPassword.item);
                
                // Navigate to main app
                resetAndNavigate('UserBottomTab');
            } else {
                Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Login Error', 'An error occurred while logging in. Please try again.');
        }
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../../assets/images/logo3.png')}
                style={styles.logoImage}
            />
            <CustomText style={styles.header} fontFamily={'light'}>Login</CustomText>
            
            <TextInput 
                style={styles.input}
                placeholder='Email'
                placeholderTextColor={Colors.text}
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />
            
            <TextInput 
                style={styles.input}
                placeholder='Password'
                placeholderTextColor={Colors.text}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                autoCapitalize="none"
            />
            
            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                <CustomText style={{fontSize: 16, color: loading ? Colors.text : 'black'}} fontFamily={''}>
                    {loading ? 'Loading...' : 'Login'}
                </CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity
                onPress={() => navigate('PodcastRegisterScreen')}
                disabled={loading}
            >
                <CustomText style={styles.signupText} fontFamily={''}>
                    Don't have an account? Sign Up
                </CustomText>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.teal_400,
        alignItems: 'center',
        padding: 20
    },
    header: {
        marginBottom: 20,
        color: 'black',
        fontSize: 24
    },
    logoImage: {
        height: screenHeight * 0.15,
        marginTop: 50,
        width: screenWidth * 0.6,
        resizeMode: 'contain'
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        color: Colors.text,
        marginBottom: 15,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.7
    },
    signupText: {
        marginTop: 15,
        color: 'black',
        fontSize: 14,
    }
})

export default PodcastLoginScreen