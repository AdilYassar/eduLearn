import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import { navigate } from '../../utils/Navigation';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numColumns, setNumColumns] = useState(3);  // Initially set to 3 columns for 35% width.

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://3506-101-53-234-27.ngrok-free.app/api/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  interface CategoryItem {
    _id: string;
    name: string;
    image: string;
  }

  const handleCategoryClick = (categoryId: string) => {
    navigate('QuizScreen', { categoryId });
  };

  const scaleValue = useSharedValue(1);

  const onPressIn = () => {
    scaleValue.value = withSpring(1.1);
  };

  const onPressOut = () => {
    scaleValue.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.categoryCard, animatedStyle]}>
      <TouchableOpacity
        style={styles.categoryButton}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => handleCategoryClick(item._id)}
      >
        <LinearGradient
          colors={[Colors.teal_300, Colors.teal_500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          <Text style={styles.categoryName}>{item.name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Categories</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary_dark} />
      ) : (
        <FlatList
          key={numColumns}  // Adding key prop to force re-render when numColumns changes
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          numColumns={numColumns} // Dynamically set to 3 for 35% width
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: RFValue(10),
  },
  headerText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    marginBottom: RFValue(15),
    textAlign: 'center',
  },
  listContent: {
    // Optional styling for list content
  },
  categoryCard: {
    width: '30%',  // Adjusting the width to 35% of the screen width
    backgroundColor: Colors.teal_300,
    borderRadius: RFValue(10),
    padding: RFValue(10),
    margin: RFValue(5),
    marginBottom:25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    aspectRatio: 1,  // Ensuring square shape for category cards
  },
  categoryButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(10),
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(10),
  },
  categoryImage: {
    width: RFValue(30),  // Adjusting image size for 35% category width
    height: RFValue(30),
    borderRadius: RFValue(10),
    marginBottom: RFValue(5),
  },
  categoryName: {
    fontSize: RFValue(6),  // Smaller font size for category names in smaller containers
    fontWeight: '500',
    color: 'Black',
    textAlign: 'center',
  },
});

export default Category;
