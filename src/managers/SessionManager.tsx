import { UserSession } from '../models/UserSession';

export class SessionManager {
    private static instance: SessionManager;
    private currentSession: UserSession | null = null;

    private constructor() {}

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    public createSession(username: string, token: string): void {
        this.currentSession = new UserSession(username, token);
        console.log(`Session created for user: ${username} with token: ${token}`);
    }

    public getCurrentSession(): UserSession | null {
        return this.currentSession;
    }

    public isAuthenticated(): boolean {
        return this.currentSession !== null && this.currentSession.getToken() !== null;
    }

    public clearSession(): void {
        this.currentSession = null;
    }

    public getUsername(): string | null {
        return this.isAuthenticated() ? this.currentSession!.getUsername() : null;
    }

    public getToken(): string | null {
        return this.isAuthenticated() ? this.currentSession!.getToken() : null;
    }
}