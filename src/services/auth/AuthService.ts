

import type { IAuthService } from './IAuthService';
import type {RegisterDTO} from "../../models/RegisterDTO.ts";
import type {LoginDTO} from "../../models/LoginDTO.ts";
import {ApiConstants} from "../../utils/ApiConstants.ts";

export class AuthService implements IAuthService {

    async register(registerDto: RegisterDTO): Promise<boolean> {
        try {
            const response = await fetch(ApiConstants.USERS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerDto),
            });

            return response.status === 201 || response.status === 200;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    }

    async login(loginDto: LoginDTO): Promise<string | null> {
        try {
            const response = await fetch(ApiConstants.AUTHENTICATE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginDto),
            });

            if (response.status === 200) {
                const jsonResponse = await response.json();
                return jsonResponse.token || null;
            }

            return null;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    }
}