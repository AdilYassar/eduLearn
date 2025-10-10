import axios from "axios";
import { Alert } from "react-native";
import { BASE_URL } from "../config";
export const createSession = async () => {
    try {
        const apiRes = await axios.post(`${BASE_URL}/create-session`);
        return apiRes?.data?.sessionId;
    } catch (error) {
        console.error("Error creating session:", error);
        Alert.alert("Failed to create session. Please try again." );
    }
}


export const checkSession = async (id) => {
    try {
        const apiRes = await axios.get(`${BASE_URL}/is-alive?sessionId=${id}`);
        return apiRes?.data?.isAlive;
    } catch (error) {
        console.error("Error getting session:", error);
        Alert.alert("Failed to getting session. Please try again." );
        return false;
    }
}