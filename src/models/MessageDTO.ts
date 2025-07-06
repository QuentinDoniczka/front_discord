export class MessageDTO {
    username: string;
    messageContent: string;
    messageDateTime: string;

    constructor(username?: string, messageContent?: string, messageDateTime?: string) {
        this.username = username || "";
        this.messageContent = messageContent || "";
        this.messageDateTime = messageDateTime || "";
    }

    getUsername(): string {
        return this.username;
    }

    setUsername(username: string): void {
        this.username = username;
    }

    getMessageContent(): string {
        return this.messageContent;
    }

    setMessageContent(messageContent: string): void {
        this.messageContent = messageContent;
    }

    getMessageDateTime(): string {
        return this.messageDateTime;
    }

    setMessageDateTime(messageDateTime: string): void {
        this.messageDateTime = messageDateTime;
    }

    toString(): string {
        return `MessageDTO{username='${this.username}', messageContent='${this.messageContent}', messageDateTime=${this.messageDateTime}}`;
    }
}