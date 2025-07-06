import type {LoginDTO} from "../../models/LoginDTO.ts";
import type {RegisterDTO} from "../../models/RegisterDTO.ts";

export interface IAuthService {
    register(registerDto: RegisterDTO): Promise<boolean>;
    login(loginDto: LoginDTO): Promise<string | null>;
}

