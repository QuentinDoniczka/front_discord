export class UserSession {
    private username: string;
    private token: string;

    constructor(username: string, token: string) {
        this.username = username;
        this.token = token;
    }

    public getUsername(): string {
        return this.username;
    }

    public setUsername(username: string): void {
        this.username = username;
    }

    public getToken(): string {
        return this.token;
    }

    public setToken(token: string): void {
        this.token = token;
    }
}