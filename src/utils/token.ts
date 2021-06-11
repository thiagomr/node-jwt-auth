import jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { API_KEY_SECRET, REFRESH_TOKEN_EXPIRES_MILISECONDS, ACCESS_TOKEN_EXPIRES_MILISECONDS } from '../config';
import { TokenData } from './protocols';

@Service()
export class Token  {
    generateAccess(data: TokenData): string {
        return jwt.sign(data, API_KEY_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRES_MILISECONDS
        });
    }

    generateRefresh(data: TokenData): string {
        return jwt.sign(data, API_KEY_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES_MILISECONDS
        });
    }

    validate(token: string): unknown {
        try {
            const decoded = jwt.verify(token, API_KEY_SECRET);
            return decoded;
        } catch (error) {
            return null;
        }

    }
}
