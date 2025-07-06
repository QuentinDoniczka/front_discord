export class FriendNotificationDTO {
    username_requester?: string;
    username_receiver?: string;

    constructor(username_requester?: string, username_receiver?: string) {
        this.username_requester = username_requester;
        this.username_receiver = username_receiver;
    }

    getUsername_requester(): string | undefined {
        return this.username_requester;
    }

    setUsername_requester(username_requester: string): void {
        this.username_requester = username_requester;
    }

    getUsername_receiver(): string | undefined {
        return this.username_receiver;
    }

    setUsername_receiver(username_receiver: string): void {
        this.username_receiver = username_receiver;
    }

    toString(): string {
        return `FriendNotificationDto{username_requester='${this.username_requester}', username_receiver='${this.username_receiver}'}`;
    }
}