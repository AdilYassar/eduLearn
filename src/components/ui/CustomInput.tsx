 import { Colors, Fonts } from '../../utils/Constants';
import React, { FC } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';  // Corrected the import, assuming Ionicons from react-native-vector-icons

interface InputProps {
  left: React.ReactNode;          // Left component, such as an icon
  onClear?: () => void;           // Clear input function
  right?: boolean;                // Boolean to render right component
}

const CustomInput: FC<InputProps & React.ComponentProps<typeof TextInput>> = ({
  onClear,
  left,
  right = true,
  ...props
}) => {
  return (
    <View style={styles.flexRow}>
      {/* Render left component */}
      {left && <View style={styles.left}>{left}</View>}

      {/* TextInput */}
      <TextInput
        {...props}
        style={styles.inputContainer}
        placeholderTextColor={'#111212FF'}  // Corrected the string syntax
      />

      {/* Right icon (Clear button) */}
      {props.value?.length !== 0 && right && (
        <TouchableOpacity onPress={onClear} style={styles.icon}>
          <Icon name="close-circle-sharp" size={RFValue(16)} color="#111212FF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 0.5,
    width: '100%',
    marginVertical: 10,
    backgroundColor: Colors.teal_300,
    shadowOpacity: 0.6,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowRadius: 2,
    shadowColor: Colors.border,
    borderColor: Colors.border,
  },
  inputContainer: {
    flex: 1,  // Use flex to take up the remaining space
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue(12),
    paddingVertical: 14,
    paddingBottom: 15,
    color: Colors.text,
  },
  left: {
    marginLeft: 10,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default CustomInput;
