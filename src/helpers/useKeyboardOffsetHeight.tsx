import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export default function useKeyboardOffsetHeight() {
    const [keyboardOffsetHeight, setKeyboardOffsetHeight] = useState(0);

    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            e => {
                setKeyboardOffsetHeight(e.endCoordinates.height);
            }
        );

        const keyboardHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardOffsetHeight(0); // Reset offset when keyboard is hidden
            }
        );

        // Cleanup function to remove listeners
        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    return keyboardOffsetHeight;
}
