import { navigate } from "../utils/Navigation";
import { Alert } from "react-native";

  export const handleLoginAdmin = () => {
    
    const endpoint = '/api/admin/login';
    const email = ''; // Replace with actual email
    const password = ''; // Replace with actual password
    const payload = { email, password }; // Only required fields for login

    fetch(`https://95a6-101-53-234-27.ngrok-free.app${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.accessToken) {
          console.log('Admin logged in successfully!', data);
          navigate('MarkSummaryScreen');
        } else {
          const errorMessage = data.error?.message || 'Login failed. Please check your credentials.';
          console.error('Login failed:', errorMessage);
          Alert.alert(errorMessage);
        }
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        Alert.alert('An error occurred during login. Please try again.');
      });
  };