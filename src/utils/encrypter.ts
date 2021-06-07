import bcrypt from 'bcrypt';
import { Service } from 'typedi';

@Service()
export class Encrypter {
    private rounds: 10;

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.rounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword;
    }

    comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
