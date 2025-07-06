export class NotificationDTO {
    from?: string;
    to?: string;

    constructor(from?: string, to?: string) {
        this.from = from;
        this.to = to;
    }

    getFrom(): string | undefined {
        return this.from;
    }

    setFrom(from: string): void {
        this.from = from;
    }

    getTo(): string | undefined {
        return this.to;
    }

    setTo(to: string): void {
        this.to = to;
    }
}