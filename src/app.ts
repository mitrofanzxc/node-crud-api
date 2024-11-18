import { ServerResponse, IncomingMessage } from 'node:http';

import { Router } from './routers/main';
import { Database } from './services/db';

export class App {
    private router: Router;

    constructor(database: Database<any>) {
        this.router = new Router();
        this.router.build(database);
    }

    handleHttp(request: IncomingMessage, response: ServerResponse) {
        try {
            this.router.handleRequest(request, response);
        } catch (error) {
            request.emit('error', error);
        }
    }
}
