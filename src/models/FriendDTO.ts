
export class FriendDTO {
    username?: string;
    conversationId?: number;

    constructor(username?: string, conversationId?: number) {
        this.username = username;
        this.conversationId = conversationId;
    }

    getUsername(): string | undefined {
        return this.username;
    }

    setUsername(username: string): void {
        this.username = username;
    }

    getConversationId(): number | undefined {
        return this.conversationId;
    }

    setConversationId(conversationId: number): void {
        this.conversationId = conversationId;
    }

    toString(): string {
        return this.username || '';
    }
}