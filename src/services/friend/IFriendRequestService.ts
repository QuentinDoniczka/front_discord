export interface IFriendRequestService {
    getPendingFriendRequests(): Promise<string[]>;
    acceptFriendRequest(username: string): Promise<boolean>;
    declineFriendRequest(username: string): Promise<boolean>;
}