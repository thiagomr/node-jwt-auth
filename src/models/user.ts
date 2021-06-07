import { prop, getModelForClass } from '@typegoose/typegoose';
import { TokenData } from '../utils/protocols';

export class User {
    @prop()
    firstName: string;

    @prop()
    lastName: string;

    @prop()
    email: string;

    @prop({})
    password: string

    @prop({ default: new Date() })
    createdAt?: Date

    public get token(): TokenData {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email
        };
    }
}

export const UserModel = getModelForClass(User, {
    schemaOptions: {
        toJSON: {
            versionKey: false,
            transform: (_, ret) => {
                delete ret._id;
                delete ret.password;
                return ret;
            }
        },
        toObject: {
            versionKey: false,
        }
    }
});
