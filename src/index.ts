import 'dotenv/config';
import 'reflect-metadata';
import { Server } from './app/server';
import { Mongo } from './utils/mongo';

(async(): Promise<void> => {
    try {
        const server = new Server();
        const mongo = new Mongo();

        await mongo.connect();
        server.listen();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
