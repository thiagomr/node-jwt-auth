import express from 'express';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { logger } from '../utils/logger';

export class Server {
    app: express.Application;
    port: number;

    constructor() {
        useContainer(Container);

        this.app = createExpressServer({ controllers: [`${process.env.PWD}/**/*controller.js`] });
        this.port = 8000;
    }

    listen(): void {
        this.app.listen(this.port, () => logger.info(`server listen at ${this.port}`));
    }
}
