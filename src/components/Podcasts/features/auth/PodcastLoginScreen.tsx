/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { Colors, Fonts } from '@utils/Constants'
import { screenHeight, screenWidth } from '../../utils/Scaling'
import CustomText from '@components/ui/CustomText'
import { navigate, resetAndNavigate } from '@utils/Navigation'


const PodcastLoginScreen = () => {
    const [email, setEmail] = React.useState<string>('')
    const [password, setPassword] = React.useState<string>('')
  return (
    <View style={styles.container}>
        <Image
        source={require('../../../../assets/images/logo3.png')}
        style={styles.logoImage}
        />
        <CustomText style={styles.header} fontFamily={'light'}   >Login</CustomText>
        <TextInput 
        style={styles.input}
        placeholder='Email'
        placeholderTextColor={Colors.text}
        onChangeText={setEmail}
        value={email}
        
        />
        <TextInput 
        style={styles.input}
        placeholder='Password'
        placeholderTextColor={Colors.text}
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        />

        <TouchableOpacity 
        style={styles.button}
        onPress={() => console.log('Login')}
        // disabled={loading}

        >
            <CustomText style={{fontSize:16}} fontFamily={''}>
                {false ? 'Loading...' : 'Login'}
            </CustomText>
        </TouchableOpacity>


        <TouchableOpacity 
     
        onPress={() =>navigate('PodcastRegisterScreen')}
        // disabled={loading}

        >
            <CustomText style={styles.signupText} fontFamily={''}>
               Dont have an account? Sign Up
            </CustomText>
        </TouchableOpacity>
    </View>
  )
}

const styles= StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:Colors.teal_400,
        alignItems:'center',
        padding:20
    },
    header:{
        marginBottom:20,
        color:'black'
    },
    logoImage:{
        height:screenHeight * 0.15,
        marginTop:50,
        width:screenWidth * 0.6,
        resizeMode:'contain'
        
    },
    input:{
        width:'100%',
        height:50,
        backgroundColor:'white',
        borderRadius:8,
        paddingHorizontal:15,
        color:Colors.text,
        marginBottom:15,

    },
    button:{
        width:'100%',
        height:50,
        backgroundColor:'white',
        borderRadius:8,
        justifyContent:'center',
        alignItems:'center',
        marginTop:10,

    },
    signupText:{
        marginTop:15,
        color:'black',
      fontSize: 14,
    }
})

export default PodcastLoginScreen