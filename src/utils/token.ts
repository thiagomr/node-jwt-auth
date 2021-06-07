import jwt from 'jsonwebtoken';
import { Service } from 'typedi';
import { SECRET, REFRESH_TOKEN_EXPIRES_MILISECONDS, ACCESS_TOKEN_EXPIRES_MILISECONDS } from '../config';
import { TokenData } from './protocols';

@Service()
export class Token  {
    generateAccess(data: TokenData): string {
        return jwt.sign(data, SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRES_MILISECONDS
        });
    }

    generateRefresh(data: TokenData): string {
        return jwt.sign(data, SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES_MILISECONDS
        });
    }

    validate(token: string): unknown {
        try {
            const decoded = jwt.verify(token, SECRET);
            return decoded;
        } catch (error) {
            return null;
        }

    }
}
