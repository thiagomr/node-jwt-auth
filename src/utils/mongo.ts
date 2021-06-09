import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { MONGO_HOST } from '../config';

export class Mongo {
    private url: string

    constructor() {
        this.url = MONGO_HOST;

        mongoose.connection.on('connected', () => logger.info(`mongo connected at ${this.url}`));
        mongoose.connection.on('disconnected', (e: Error) => logger.info('mongo disconnected', e));
        mongoose.connection.on('error', (e: Error) => logger.info('mongo error', e));
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
