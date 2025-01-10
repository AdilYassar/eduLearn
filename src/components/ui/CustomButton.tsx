/* eslint-disable react/react-in-jsx-scope */
import { FC } from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import CustomText from './CustomText';
import { Fonts } from '@utils/Constants';
import { Colors } from 'react-native/Libraries/NewAppScreen';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  styles?: ViewStyle;
}

const CustomButton: FC<CustomButtonProps> = ({ onPress, title, disabled = false, loading = false, styles: customStyles }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading} // Disable if loading
      activeOpacity={0.8}
      style={[
        styles.button,
        customStyles,
        { 
          backgroundColor: disabled ? Colors.disabled : Colors.secondary,
          borderColor: disabled ? Colors.disabled : Colors.secondary, // Set border color based on disabled state
        },
      ]}
      accessibilityLabel={title}
      accessible={true}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color="black" size="small" />
        ) : (
          <CustomText style={styles.text} fontFamily={Fonts.SemiBold}>
            {title}
          </CustomText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    width: '100%',
    borderWidth: 2, // Add border width
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000000FF',
  },
});

export default CustomButton;