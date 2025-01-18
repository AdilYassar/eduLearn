import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import AiLogo from '../../assets/images/logo.png';
import CustomText from '../ui/CustomText';
const exampleData = [
  '📘 Study Tips',
  '📚 Book Recommendations for Students',
  '💡 Science Facts',
  '📝 Note-Taking Strategies',
  '🎓 Career Guidance',
  '🔬 STEM Learning Resources',
  '🌍 Geography Facts',
  '📖 History Insights',
  '🧮 Math Problem-Solving Tips',
  '🖼️ Art History Lessons',
  '🧪 Fun Science Experiments',
  '🗣️ Language Learning Tips',
  '📆 Productivity Tips for Students',
  '👩‍💻 Coding Tutorials',
  '🎶 Music Theory Basics',
  '🎥 Educational Documentaries',
  '🐾 Biology Fun Facts',
  '📝 Essay Writing Tips',
  '📊 Data Analysis Techniques',
  '💼 Interview Preparation Advice',
  '📱 EdTech Tools',
  '🎉 Interactive Learning Games',
  '📈 Financial Literacy for Students',
  '🛠️ DIY Science Projects',
  '🥼 Lab Safety Tips',
  '💅 Creative Study Techniques',
  '🛋️ Organization Tips for Study Spaces',
  '🌅 Morning Study Routines',
  '🧳 Study Abroad Essentials',
  '📸 Photography Basics',
  '🌌 Mindfulness for Students',
  '🚗 Educational Field Trip Ideas',
  '✈️ Budget Travel for Study Trips',
  '💪 Self-Care for Busy Students',
  '🎁 Educational Gift Ideas',
  '📝 Daily Journal Prompts for Students',
  '🤹 Fun Study Break Ideas',
  '📺 Learning Through TV Shows',
  '🌐 Online Learning Platforms',
  '💼 Job Skills Development',
  '📊 Investment Basics for Beginners',
  '🚀 How to Start a Research Project',
  '🎨 Creative Writing for Students',
  '💍 Building Strong Peer Relationships',
];


interface EmptyComponentProps {
  isTyping: boolean;
}

const EmptyComponent = ({ isTyping }: EmptyComponentProps) => {
    const rotation=useRef(new Animated.Value(0)).current
    useEffect(()=>{
        Animated.loop(
            Animated.timing(
                rotation,
                {
                    toValue:1,
                    duration:4000,
                    useNativeDriver:true
                }
            )
        ).start()
    },[rotation])

    const rotate = rotation.interpolate({
        inputRange:[0,1],
        outputRange:['0deg','360deg']
    });

    const ItemScroll = ({item})=>{
        return(
            <TouchableOpacity style={styles.touchableItem}>
                <Text style={styles.touchable}>
            {item}
                </Text>
            </TouchableOpacity>
        )
    }
  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
        <Animated.Image
          source={AiLogo}
          style={[styles.img, {
            transform:[{rotate}]
          }]}
        />
      </View>
      <CustomText size={RFValue(22)}>
        Ask EduLearn AI for suggestions!
      </CustomText>
      {!isTyping && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} centerContent={true} 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
         >
        <View>
            <View style={{flexDirection:'row', alignItems:'center'}}>
            {exampleData?.slice(0,7).map((item, index)=>{
                return(
                    <ItemScroll item={item} key={index} />
                )
            })}
            </View>
            <View style={{flexDirection:'row', alignItems:'center',marginVertical:12}}>
            {exampleData?.slice(7,14).map((item, index)=>{
                return(
                    <ItemScroll item={item} key={index} />
                )
            })}
            </View>
            <View style={{flexDirection:'row', alignItems:'center'}}>
            {exampleData?.slice(14,21).map((item, index)=>{
                return(
                    <ItemScroll item={item} key={index} />
                )
            })}
            </View>
        </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer:{
    marginTop:20,
    maxHeight:RFValue(120)
  },
  scrollContent:{
    alignItems:'center'
  },
  touchable:{
    fontSize:RFValue(12),
    color:'white'
  },
  touchableItem:{
    backgroundColor:'rgba(0,0,0,3)',
    borderRadius:20,
    padding:10,
    marginHorizontal:5

  },
  imgContainer: {
    width: RFValue(50),
    height: RFValue(50),
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    
  },
  typingText: {
    marginTop: 10,
    fontSize: RFValue(14),
    color: 'white',
  },
});

export default EmptyComponent;
