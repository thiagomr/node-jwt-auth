import { UserModel, User } from '../models';
import { Service } from 'typedi';

@Service()
export class UserRepository {
    private model = UserModel;

    findOneByEmail(email: string): Promise<User> {
        return this.model.findOne({ email }).exec();
    }

    insertOne(data: User): Promise<User> {
        return this.model.create(data);
    }
}
