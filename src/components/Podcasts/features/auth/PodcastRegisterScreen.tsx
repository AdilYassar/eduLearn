/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Colors, Fonts } from '@utils/Constants';
import { screenHeight, screenWidth } from '../../utils/Scaling';
import CustomText from '@components/ui/CustomText';
import { navigate, resetAndNavigate } from '@utils/Navigation';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '../../graphQL/queries';

const PodcastRegisterScreen = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');

    // Proper hook usage - no try-catch around hooks
    const [register, { loading, error }] = useMutation(REGISTER_MUTATION, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

const handleRegister = async () => {
    // Basic validation (keep your existing validation)
    if (!name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return;
    }

    if (!email.trim()) {
        Alert.alert('Error', 'Please enter your email');
        return;
    }

    if (!validateEmail(email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
    }

    if (!password.trim()) {
        Alert.alert('Error', 'Please enter a password');
        return;
    }

    if (password.trim().length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
    }

    try {
        const result = await register({
            variables: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password.trim()
            }
        });

        console.log('Registration result:', result);

        // Fix: Check for the nested user object
        if (result?.data?.registerUser?.user) {
            const userData = result.data.registerUser.user;
            console.log('Registration successful for user:', userData);
            
            Alert.alert(
                'Success',
                `Registration successful! Welcome ${userData.name}!`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setName('');
                            setEmail('');
                            setPassword('');
                            resetAndNavigate('PodcastLoginScreen');
                        }
                    }
                ]
            );
        } else {
            // Check if there are any errors in the response
            console.log('Registration failed - no user data returned');
            Alert.alert('Error', 'Registration failed. Please try again.');
        }
    } catch (err) {
        console.error('Registration error:', err);
        console.error('Error details:', {
            message: err.message,
            graphQLErrors: err.graphQLErrors,
            networkError: err.networkError
        });
        
        let errorMessage = 'Registration failed. Please try again.';
        
        // Handle GraphQL errors
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
            errorMessage = err.graphQLErrors[0].message;
        } else if (err.networkError) {
            errorMessage = 'Network error. Please check your connection.';
        } else if (err.message) {
            errorMessage = err.message;
        }
        
        Alert.alert('Error', errorMessage);
    }
};

    const navigateToLogin = () => {
        navigate('PodcastLoginScreen');
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../../assets/images/logo3.png')}
                style={styles.logoImage}
            />
            <CustomText style={styles.header} fontFamily="light">
                Register
            </CustomText>

            <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={Colors.text}
                onChangeText={setName}
                value={name}
                autoCapitalize="words"
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor={Colors.text}
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.text}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
                autoCapitalize="none"
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                <CustomText style={styles.buttonText} fontFamily="">
                    {loading ? 'Registering...' : 'Register'}
                </CustomText>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToLogin} style={styles.loginLink}>
                <CustomText style={styles.signupText} fontFamily="">
                    Already have an account? Login
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.teal_400,
        alignItems: 'center',
        padding: 20,
    },
    header: {
        marginBottom: 20,
        color: 'black',
        fontSize: 24,
        marginTop: 20,
    },
    logoImage: {
        height: screenHeight * 0.15,
        marginTop: 50,
        width: screenWidth * 0.6,
        resizeMode: 'contain',
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
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    buttonText: {
        fontSize: 16,
        color: 'black',
    },
    loginLink: {
        marginTop: 15,
    },
    signupText: {
        color: 'black',
        fontSize: 14,
    },
});

export default PodcastRegisterScreen;