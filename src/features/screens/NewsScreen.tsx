import React from 'react';
import { StyleSheet } from 'react-native';
import CustomSafeAreaView from '../../components/ui/CustomSafeAreaView';
import NewsComponent from '../../components/ui/NewsComponent';

const NewsScreen: React.FC = () => {
  return (
    <CustomSafeAreaView style={styles.container}>
      <NewsComponent />
    </CustomSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NewsScreen;
