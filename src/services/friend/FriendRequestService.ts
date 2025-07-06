import type { IFriendRequestService } from './IFriendRequestService';
import { SessionManager } from '../../managers/SessionManager';
import { ApiConstants } from '../../utils/ApiConstants';

export class FriendRequestService implements IFriendRequestService {

    async getPendingFriendRequests(): Promise<string[]> {
        try {
            const token = SessionManager.getInstance().getToken();

            const response = await fetch(ApiConstants.PENDING_FRIEND_REQUESTS_ENDPOINT, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.status === 200) {
                const pendingUsernames: string[] = await response.json();
                return pendingUsernames;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching pending friend requests:', error);
            return [];
        }
    }

    async acceptFriendRequest(username: string): Promise<boolean> {
        try {
            const token = SessionManager.getInstance().getToken();

            const response = await fetch(`${ApiConstants.ACCEPT_FRIEND_REQUEST_ENDPOINT}/${username}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
            });

            return response.status === 204;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            return false;
        }
    }

    async declineFriendRequest(username: string): Promise<boolean> {
        try {
            const token = SessionManager.getInstance().getToken();

            const response = await fetch(`${ApiConstants.REFUSE_FRIEND_REQUEST_ENDPOINT}/${username}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                },
            });

            return response.status === 204;
        } catch (error) {
            console.error('Error declining friend request:', error);
            return false;
        }
    }
}