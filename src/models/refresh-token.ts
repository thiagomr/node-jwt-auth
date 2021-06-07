import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { User } from './user';

export class RefreshToken {
    @prop()
    token?: string;

    @prop()
    ipAddress?: string

    @prop({ expires: 1296000 })
    expiresAt: Date

    @prop({ ref: () => User })
    user: User
}

export const RefreshTokenModel = getModelForClass(RefreshToken, {
    schemaOptions: {
        toJSON: {
            versionKey: false
        }
    }
});
