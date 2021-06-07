import express from 'express';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

export class Server {
    app: express.Application;
    port: number;

    constructor() {
        useContainer(Container);

        this.app = createExpressServer({ controllers: [`${process.env.PWD}/**/*controller.ts`] });
        this.port = 8000;
    }

    listen(): void {
        this.app.listen(this.port, () => console.log(`server listen at ${this.port}`));
    }
}
