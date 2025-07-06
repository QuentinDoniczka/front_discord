export class MessageWSDTO {
    sender?: string;
    content?: string;
    conversationId?: number;
    timestamp?: string;

    constructor(sender?: string, content?: string, timestamp?: string, conversationId?: number) {
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
        this.conversationId = conversationId;
    }

    getSender(): string | undefined {
        return this.sender;
    }

    setSender(sender: string): void {
        this.sender = sender;
    }

    getContent(): string | undefined {
        return this.content;
    }

    setContent(content: string): void {
        this.content = content;
    }

    getConversationId(): number | undefined {
        return this.conversationId;
    }

    setConversationId(conversationId: number): void {
        this.conversationId = conversationId;
    }

    getTimestamp(): string | undefined {
        return this.timestamp;
    }

    setTimestamp(timestamp: string): void {
        this.timestamp = timestamp;
    }
}