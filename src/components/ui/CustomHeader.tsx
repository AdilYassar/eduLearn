/* eslint-disable react-native/no-inline-styles */
import {View, SafeAreaView, StyleSheet, Pressable} from 'react-native';
import React, {FC} from 'react';
import {Colors, Fonts} from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {RFValue} from 'react-native-responsive-fontsize';
import {goBack} from '@utils/Navigation';
import CustomText from './CustomText';

const CustomHeader: FC<{title: string; search?: boolean}> = ({
  search,
  title,
}) => {
  return (
    <SafeAreaView>
      <View style={styles.flexRow}>
        <Pressable onPress={() => goBack()}>
          <Icon
            name="chevron-back"
            color={Colors.text}
            size={RFValue(24)}
            style={{left: -100, position:'static'}}
            onPress={() => goBack()}
            
          />
        </Pressable>

        <CustomText
          style={styles.text}
          variant="h5"
          fontFamily={Fonts.SemiBold}>
          {title}
        </CustomText>
        <View>
          {search && (
            <Icon
              name="search"
              color={Colors.text}
              size={RFValue(16)}
              style={{left: 100}}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    justifyContent: 'center',
    padding: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 0.6,
    borderColor: Colors.border,
  },
  text: {
    textAlign: 'center',
  },
});

export default CustomHeader;
