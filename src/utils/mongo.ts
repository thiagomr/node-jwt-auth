import { MONGO_HOST } from '../config';
import mongoose from 'mongoose';

export class Mongo {
    private url: string

    constructor() {
        this.url = MONGO_HOST;

        mongoose.connection.on('connected', () => console.info(`mongo connected at ${this.url}`));
        mongoose.connection.on('disconnected', (e: Error) => console.info('mongo disconnected', e));
        mongoose.connection.on('error', (e: Error) => console.info('mongo error', e));
    }

    async connect(): Promise<void> {
        await mongoose.connect(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
}
