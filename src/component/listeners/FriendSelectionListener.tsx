export interface FriendSelectionListener {
    onFriendSelected(username: string, conversationId: number): void;
}