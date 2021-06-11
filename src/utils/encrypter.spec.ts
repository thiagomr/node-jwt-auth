import 'dotenv/config';
import { Container } from 'typedi';
import { Encrypter } from './encrypter';
import bcrypt from 'bcrypt';

const encrypter = Container.get(Encrypter);

test('should return a hashed password', async () => {
    jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => 'salt');
    const spyHash = jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed_password');
    const data = await encrypter.hashPassword('user_password');

    expect(data).toEqual('hashed_password');
    expect(spyHash).toBeCalledWith('user_password', 'salt');
});

test('should return true when compare a valid password', async () => {
    const spyHash = jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
    const data = await encrypter.comparePassword('user_password', 'hashed_password');

    expect(data).toEqual(true);
    expect(spyHash).toBeCalledWith('user_password', 'hashed_password');
});
