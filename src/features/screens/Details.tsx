import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import CustomText from '../../components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate, replace } from '../../utils/Navigation';

const { width, height } = Dimensions.get('window');

const Details = () => {
  const [selectedRole, setSelectedRole] = useState('');

  // Animation values
  const imageSlideDown = useRef(new Animated.Value(-height * 0.65)).current; // Start above screen
  const promptAnim = useRef(new Animated.Value(0)).current;
  const teacherButtonSlideUp = useRef(new Animated.Value(300)).current; // Start below screen
  const studentButtonSlideUp = useRef(new Animated.Value(300)).current; // Start below screen

  useEffect(() => {
    // Sequential animation
    Animated.sequence([
      // Step 1: Image slides down from top (0-700ms)
      Animated.timing(imageSlideDown, {
        toValue: 0,
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      
      // Step 2: Parallel animations for content (700-1400ms)
      Animated.parallel([
        // "Who are you?" text fades in
        Animated.sequence([
          Animated.delay(0),
          Animated.timing(promptAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        
        // Teacher button slides up (150ms delay)
        Animated.sequence([
          Animated.delay(150),
          Animated.spring(teacherButtonSlideUp, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
        
        // Student button slides up (300ms delay)
        Animated.sequence([
          Animated.delay(300),
          Animated.spring(studentButtonSlideUp, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [imageSlideDown, promptAnim, teacherButtonSlideUp, studentButtonSlideUp]);

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    // Navigate based on role selection
    if (role === 'teacher') {
      replace('AdminNavigator');
    } else if (role === 'student') {
      replace('LoginScreen');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
      
      {/* Top Section - Animated Illustration */}
      <View style={styles.topSection}>
        <Animated.View
          style={{
            transform: [{ translateY: imageSlideDown }],
          }}
        >
          <Image
            source={require('../../assets/getStarted/hi.jpg')}
            style={styles.characterImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* Bottom Section - Role Selection */}
      <View style={styles.bottomSection}>
        {/* Who are you? Prompt - Fades in */}
        <Animated.View
          style={{
            opacity: promptAnim,
            transform: [
              {
                translateY: promptAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <CustomText
            variant="h1"
            size={RFValue(24)}
            fontFamily="Inter-Bold"
            style={styles.promptText}
          >
            Who are you?
          </CustomText>
        </Animated.View>
        
        {/* Teacher Button - Slides up from bottom */}
        <Animated.View
          style={{
            transform: [{ translateY: teacherButtonSlideUp }],
          }}
        >
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'teacher' && styles.selectedButton]}
            onPress={() => handleRoleSelection('teacher')}
          >
            <View style={styles.buttonIconArea}>
              <View style={styles.teacherIcon} />
            </View>
            <View style={styles.buttonTextArea}>
              <CustomText
                variant="h3"
                size={RFValue(16)}
                fontFamily="Inter-Bold"
                style={styles.buttonText}
              >
                Teacher
              </CustomText>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Student Button - Slides up from bottom */}
        <Animated.View
          style={{
            transform: [{ translateY: studentButtonSlideUp }],
          }}
        >
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'student' && styles.selectedButton]}
            onPress={() => handleRoleSelection('student')}
          >
            <View style={[styles.buttonIconArea, styles.studentIconArea]}>
              <View style={styles.studentIcon} />
            </View>
            <View style={styles.buttonTextArea}>
              <CustomText
                variant="h3"
                size={RFValue(16)}
                fontFamily="Inter-Bold"
                style={styles.buttonText}
              >
                Student
              </CustomText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  topSection: {
    flex: 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  characterImage: {
    width: width,
    height: height * 0.65,
  },
  bottomSection: {
    flex: 0.35,
    paddingHorizontal: 30,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  promptText: {
    color: '#333333',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 30,
  },
  roleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: '#FF8A65',
  },
  buttonIconArea: {
    backgroundColor: '#FFB74D',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentIconArea: {
    backgroundColor: '#FFF176',
  },
  buttonTextArea: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  buttonText: {
    color: '#333333',
    fontWeight: 'bold',
  },
  teacherIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#333333',
    borderRadius: 12,
  },
  studentIcon: {
    width: 32,
    height: 20,
    backgroundColor: '#333333',
    borderRadius: 10,
  },
});