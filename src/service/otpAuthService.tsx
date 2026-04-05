import { BASE_URL } from './config';

export const verifyOtp = async (uuid: string, sessionId: string, otpCode: string) => {
    try {
        const response = await fetch(`${BASE_URL}/api/otp/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userUUID: uuid, sessionId, otpCode }),
        });

        const result = await response.json();
        
        if (response.ok) {
            return result;
        } else {
            throw new Error(result.message || 'OTP Verification failed');
        }
    } catch (error) {
        console.error('OTP Verification error:', error);
        throw error;
    }
};
