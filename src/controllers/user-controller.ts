import { UserService } from '../services/user-service';
import { Body, Post, JsonController, Res, CookieParam, Get, HeaderParam } from 'routing-controllers';
import { User } from '../models';
import { Response } from 'express';
import { TokenData } from '../utils/protocols';

@JsonController('/user')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Post('/register')
    async register(@Body() body: User) : Promise<User> {
        const user = await this.userService.register(body);
        return user;
    }

    @Post('/login')
    async login(@Body() body: User, @Res() response: Response): Promise<{ token: string }> {
        const { token, refreshToken, expiresAt } = await this.userService.login(body.email, body.password);
        const cookieOptions = {
            httpOnly: true,
            expires: expiresAt
        };

        response.cookie('refreshToken', refreshToken, cookieOptions);

        return { token };
    }

    @Post('/refresh-token')
    async refreshToken(@CookieParam('refreshToken') refreshToken: string): Promise<{ token: string }> {
        const token = await this.userService.refreshToken(refreshToken);
        return { token };
    }

    @Post('/revoke-token')
    async revokeToken(@CookieParam('refreshToken') refreshToken: string): Promise<unknown> {
        await this.userService.revokeToken(refreshToken);
        return {};
    }

    @Get('/me')
    async me(@HeaderParam('Authorization') authHeader: string): Promise<TokenData> {
        const token = authHeader.split(' ')[1];
        const data = this.userService.me(token);

        return data;
    }
}
