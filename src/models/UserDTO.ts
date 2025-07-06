export class UserDTO {
    email?: string;
    username?: string;
    password?: string;

    constructor(email?: string, username?: string, password?: string) {
        if (arguments.length === 3) {
            this.email = email;
            this.username = username;
            this.password = password;
        } else if (arguments.length === 1 && typeof email === 'string') {
            this.username = email;
        }
    }

    getEmail(): string | undefined {
        return this.email;
    }

    setEmail(email: string): void {
        this.email = email;
    }

    getUsername(): string | undefined {
        return this.username;
    }

    setUsername(username: string): void {
        this.username = username;
    }

    getPassword(): string | undefined {
        return this.password;
    }

    setPassword(password: string): void {
        this.password = password;
    }
}