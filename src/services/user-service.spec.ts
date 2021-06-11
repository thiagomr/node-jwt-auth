import 'dotenv/config';
import { UserService } from './user-service';
import { UserRepository, RefreshTokenRepository } from '../repositories';
import { User } from '../models';
import { Container } from 'typedi';
import { Encrypter, Token } from '../utils';

const userRepositoryMock = {
    findOneByEmail: jest.fn(),
    insertOne: jest.fn()
};

const refreshTokenRepositoryMock = {
    findOneByToken: jest.fn(),
    insertOne: jest.fn(),
    expiresToken: jest.fn()
};

Container.set(UserRepository, userRepositoryMock);
Container.set(RefreshTokenRepository, refreshTokenRepositoryMock);

const userService = Container.get(UserService);
const userRepository = Container.get(UserRepository);
const encrypter = Container.get(Encrypter);
const token = Container.get(Token);

const sut = () => {
    const user = new User();

    user.firstName = 'Thiago';
    user.lastName = 'Moraes';
    user.password = 'q1w2e3';
    user.email = 'user@pokemail.com';

    const userParams = {
        email: 'user@pokemail.com',
        password: 'q1w2e3'
    };

    const refreshToken = {
        expiresAt: new Date(Date.now() + (3600 * 1000 * 24)), //1 day ahead
        token: 'q1w2e3',
        user
    };

    const tokenData = {
        firstName: 'Thaigo',
        lastName: 'Moraes'
    };

    return { user, userParams, refreshToken, tokenData };
};

test('should register an user', async () => {
    const { user } = sut();

    const spyEncrypter = jest.spyOn(encrypter, 'hashPassword');
    const spyFindUser = jest.spyOn(userRepository, 'findOneByEmail');
    const spyInsertUser = jest.spyOn(userRepository, 'insertOne');
    const response = await userService.register(user);

    expect(spyEncrypter).toHaveBeenCalledWith('q1w2e3');
    expect(spyFindUser).toHaveBeenCalledWith(user.email);
    expect(spyInsertUser).toHaveBeenCalledWith(user);
    expect(response).toEqual(user);
});

test('should throw a duplicated error', async () => {
    userRepositoryMock.findOneByEmail = jest.fn().mockReturnValue(new User());
    const { user } = sut();

    await expect(userService.register(user))
        .rejects
        .toThrow(new Error('Duplicated User'));
});

test('should login an authorized user', async () => {
    const { user, userParams } = sut();

    userRepositoryMock.findOneByEmail.mockReturnValue(user);
    encrypter.comparePassword = jest.fn().mockReturnValue(true);

    const spyFindUser = jest.spyOn(userRepository, 'findOneByEmail');
    const spyEncrypter = jest.spyOn(encrypter, 'comparePassword');
    const result = await userService.login(userParams.email, userParams.password);

    expect(spyFindUser).toHaveBeenCalledWith(user.email);
    expect(result.token).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.expiresAt).toEqual(expect.any(Date));
    expect(spyEncrypter).toHaveBeenCalledWith('q1w2e3', user.password);
});

test('should throw an unathorized error if user is not found', async () => {
    const { userParams } = sut();

    userRepositoryMock.findOneByEmail.mockReturnValue(null);

    await expect(userService.login(userParams.email, userParams.password))
        .rejects
        .toThrow(new Error('Unauthorized'));
});

test('should throw an unathorized error if password is invalid', async () => {
    const { user, userParams } = sut();

    userRepositoryMock.findOneByEmail.mockReturnValue(user);
    encrypter.comparePassword = jest.fn().mockReturnValue(false);

    await expect(userService.login(userParams.email, userParams.password))
        .rejects
        .toThrow(new Error('Unauthorized'));
});

test('should return a valid refresh token', async() => {
    const { refreshToken } = sut();

    refreshTokenRepositoryMock.findOneByToken = jest.fn().mockReturnValue(refreshToken);

    token.validate = jest.fn().mockReturnValue(true);
    token.generateAccess = jest.fn().mockReturnValue('encrypted_token');

    const result = await userService.refreshToken('token');

    expect(result).toEqual('encrypted_token');
});

test('should throw an error when token is not valid', async () => {
    const { refreshToken } = sut();

    refreshTokenRepositoryMock.findOneByToken = jest.fn().mockReturnValue(refreshToken);

    token.validate = jest.fn().mockReturnValue(false);

    await expect(userService.refreshToken('token')).rejects.toThrow(new Error('Unauthorized'));
});

test('should throw an error when date is in the past', async () => {
    const { refreshToken } = sut();

    refreshToken.expiresAt = new Date(Date.now() - (3600 * 1000 * 24)), //1 day ago

    refreshTokenRepositoryMock.findOneByToken = jest.fn().mockReturnValue(refreshToken);

    token.validate = jest.fn().mockReturnValue(true);
    token.generateAccess = jest.fn().mockReturnValue('encrypted_token');

    await expect(userService.refreshToken('token')).rejects.toThrow(new Error('Unauthorized'));
});

test('should revoke a valid token', async () => {
    const { refreshToken } = sut();

    token.validate = jest.fn().mockReturnValue(true);
    refreshTokenRepositoryMock.findOneByToken = jest.fn().mockReturnValue(refreshToken);
    refreshTokenRepositoryMock.expiresToken = jest.fn().mockReturnValue(refreshToken);

    const spyRefreshExpires = jest.spyOn(refreshTokenRepositoryMock, 'expiresToken');

    await userService.revokeToken('custom_token');

    expect(spyRefreshExpires).toHaveBeenCalledWith(refreshToken.token);
});

test('should throw an unauthorized error when revoke a not found token', async () => {
    const { refreshToken } = sut();

    token.validate = jest.fn().mockReturnValue(false);

    refreshTokenRepositoryMock.findOneByToken = jest.fn().mockReturnValue(refreshToken);

    await expect(userService.revokeToken('user_token')).rejects.toThrow(new Error('Unauthorized'));
});

test('should return user information', async () => {
    const { tokenData } = sut();
    token.validate = jest.fn().mockReturnValue(tokenData);

    const data = userService.me('user_token');

    expect(data).toEqual(tokenData);
});

test('should return an unauthorized error when an invalid token is sent', () => {
    token.validate = jest.fn().mockReturnValue(false);
    expect(() => userService.me('user_token')).toThrow(new Error('Unauthorized'));
});
