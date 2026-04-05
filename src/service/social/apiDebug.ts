import { friendService } from './authAndUserService';
import { socialApiClient } from './apiClient';

export const runSocialDebug = async () => {
    console.log('--- STARTING SOCIAL DEBUG ---');
    try {
        console.log('Fetching Friend Requests...');
        const response = await friendService.getFriendRequests();
        console.log('RAW RESPONSE (friendService.getFriendRequests()):');
        console.log(JSON.stringify(response, null, 2));

        if (response.data) {
             console.log('Response DATA array length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
        } else {
             console.log('Response DATA is undefined/null');
        }

    } catch (e: any) {
        console.error('DEBUG ERROR:', e);
        if (e.response) {
             console.error('Error Response Data:', e.response.data);
             console.error('Error Status:', e.response.status);
        }
    }
    console.log('--- END SOCIAL DEBUG ---');
};
