import { Colors } from "@utils/Constants";
import React, { ReactNode } from "react";
import { SafeAreaView, StyleSheet, View, ViewStyle } from "react-native";

interface CustomSafeAreaViewProps {
    children: ReactNode;
    style?: ViewStyle;
}

const CustomSafeAreaView: React.FC<CustomSafeAreaViewProps> = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            <SafeAreaView/>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 2, // Adjust as needed for your safe area
        paddingHorizontal: 5,
        backgroundColor: Colors.teal_700, // Adjust as needed
    },
});

export default CustomSafeAreaView;
