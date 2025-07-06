export class ChatMessageDTO {
    sender?: string;
    content?: string;
    timestamp?: string;

    constructor(sender?: string, content?: string, timestamp?: string) {
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
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

    getTimestamp(): string | undefined {
        return this.timestamp;
    }

    setTimestamp(timestamp: string): void {
        this.timestamp = timestamp;
    }
}