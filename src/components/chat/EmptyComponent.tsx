import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import AiLogo from '../../assets/images/logo.png';
import CustomText from '../ui/CustomText';
const exampleData = [
    '🖼️ Home Decor',
    '🍲 Recipe Ideas',
    '🌱 Gardening Tips',
    '📚 Book Recommendations',
    '🎬 Movie Suggestions',
    '🎨 Art & Craft Projects',
    '🧘 Fitness & Wellness',
    '🌍 Travel Destinations',
    '🧑‍🍳 Cooking Hacks',
    '💡 Life Hacks',
    '💼 Career Advice',
    '💬 Daily Quotes',
    '📆 Productivity Tips',
    '👗 Fashion Trends',
    '🎶 Music Playlists',
    '🎮 Game Recommendations',
    '🐾 Pet Care Tips',
    '🍹 Drink Recipes',
    '🧳 Packing Tips',
    '👶 Parenting Advice',
    '📱 Tech News',
    '🎉 Party Planning',
    '📈 Finance Tips',
    '🛠️ DIY Projects',
    '🍕 Food Trends',
    '💅 Beauty Tips',
    '🛋️ Organization Ideas',
    '🌅 Morning Routines',
    '🧳 Travel Essentials',
    '📸 Photography Tips',
    '🌌 Mindfulness Practices',
    '🚗 Road Trip Ideas',
    '✈️ Budget Travel Tips',
    '💪 Self-Care Practices',
    '🎁 Gift Ideas',
    '📝 Journal Prompts',
    '🤹 Fun Hobbies',
    '📺 TV Show Picks',
    '🌐 Language Learning',
    '💼 Job Search Tips',
    '📊 Investment Insights',
    '🚀 Startup Advice',
    '🎨 Creative Writing Ideas',
    '💍 Relationship Tips',
];

const EmptyComponent = ({ isTyping }) => {
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
    width: RFValue(100),
    height: RFValue(100),
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
