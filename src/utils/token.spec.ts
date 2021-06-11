import 'dotenv/config';
import { Container } from 'typedi';
import { Token } from './token';
import { API_KEY_SECRET, ACCESS_TOKEN_EXPIRES_MILISECONDS, REFRESH_TOKEN_EXPIRES_MILISECONDS } from '../config';
import jwt from 'jsonwebtoken';

const token = Container.get(Token);

const sut = () => {
    const tokenData = {
        email: 'user@pokemail.com',
        firstName: 'Thiago',
        lastName: 'Moraes'
    };

    return { tokenData };
};

test('should generate a access token', () => {
    const { tokenData } = sut();
    const spySign = jest.spyOn(jwt, 'sign').mockImplementation(() => 'encrypted_token');
    const data = token.generateAccess(tokenData);

    expect(data).toEqual('encrypted_token');
    expect(spySign).toBeCalledWith(tokenData, API_KEY_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_MILISECONDS
    });
});

test('should generate a refresh token', () => {
    const { tokenData } = sut();
    const spySign = jest.spyOn(jwt, 'sign').mockImplementation(() => 'encrypted_token');
    const data = token.generateRefresh(tokenData);

    expect(data).toEqual('encrypted_token');
    expect(spySign).toBeCalledWith(tokenData, API_KEY_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_MILISECONDS
    });
});

test('should return decoded data when a valid token is sent', () => {
    const { tokenData } = sut();
    const spySign = jest.spyOn(jwt, 'verify').mockImplementation(() => tokenData);
    const data = token.validate('user_token');

    expect(data).toEqual(tokenData);
    expect(spySign).toBeCalledWith('user_token', API_KEY_SECRET);
});

test('should return null when a invalid token is sent', () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
    });

    const data = token.validate('user_token');
    expect(data).toEqual(null);
});
