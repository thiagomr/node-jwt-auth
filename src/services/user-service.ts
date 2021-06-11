import { Service } from 'typedi';
import { REFRESH_TOKEN_EXPIRES_MILISECONDS } from '../config';
import { TokenData } from '../utils/protocols';
import { User, RefreshToken } from '../models';
import { Token, Encrypter } from '../utils';
import { UserRepository, RefreshTokenRepository } from '../repositories';

@Service()
export class UserService {
    constructor(
        private token: Token,
        private encrypter: Encrypter,
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository
    ) {}

    async register(user: User): Promise<User> {
        const findUser = await this.userRepository.findOneByEmail(user.email);

        if (findUser) {
            throw new Error('Duplicated User');
        }

        user.password = await this.encrypter.hashPassword(user.password);
        user.createdAt = new Date();

        await this.userRepository.insertOne(user);
        delete user.password;

        return user;
    }

    async login(email: string, password: string, ipAddress?: ''): Promise<{
        token: string,
        refreshToken: string,
        expiresAt: Date
    }> {
        const user = await this.userRepository.findOneByEmail(email);

        if (!user || !await this.encrypter.comparePassword(password, user.password)) {
            throw new Error('Unauthorized');
        }

        const token = this.token.generateAccess(user.token);
        const refreshToken = this.token.generateRefresh(user.token);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MILISECONDS);

        await this.refreshTokenRepository.insertOne({
            token: refreshToken,
            user,
            ipAddress,
            expiresAt
        });

        return {
            token,
            refreshToken,
            expiresAt
        };
    }

    async refreshToken(token: string): Promise<string> {
        const refreshToken = await this.refreshTokenRepository.findOneByToken(token);

        if (!this.isValidRefreshToken(refreshToken)) {
            throw new Error('Unauthorized');
        }

        return this.token.generateAccess(refreshToken.user.token as User);
    }

    private isValidRefreshToken(refreshToken: RefreshToken): boolean {
        if (!refreshToken || +Date.now() > +refreshToken.expiresAt || !this.token.validate(refreshToken.token)) {
            return false;
        }

        return true;
    }

    async revokeToken(token: string): Promise<void> {
        const refreshToken = await this.refreshTokenRepository.findOneByToken(token);

        if (!this.isValidRefreshToken(refreshToken)) {
            throw new Error('Unauthorized');
        }

        await this.refreshTokenRepository.expiresToken(refreshToken.token);
    }

    me(token: string): TokenData {
        const data = this.token.validate(token);

        if (!data) {
            throw new Error('Unauthorized');
        }

        return data as TokenData;
    }
}
