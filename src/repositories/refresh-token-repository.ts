import { RefreshToken, RefreshTokenModel } from '../models';
import { Service } from 'typedi';

@Service()
export class RefreshTokenRepository {
    private model = RefreshTokenModel;

    findOneByToken(token: string): Promise<RefreshToken> {
        return this.model.findOne({ token }).populate('user').exec();
    }

    insertOne(data: RefreshToken): Promise<RefreshToken> {
        return this.model.create(data);
    }

    async expiresToken(token: string): Promise<void> {
        await this.model.updateOne({ token }, { expiresAt: new Date() });
    }
}
