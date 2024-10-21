import { createServer } from 'node:http';
import { env } from 'node:process';
import dotenv from 'dotenv';

import { DEFAULT_HOST_PORT } from './constants/common';

import { App } from './app';
import { Database } from './services/db';
import { StatusCode } from './controllers/interface';

dotenv.config();

const database = new Database();
const app = new App(database);

const server = createServer((request, response) => {
    request.on('error', (error) => {
        response.writeHead(StatusCode.INTERNAL_SERVER_ERROR, { 'Content-Type': 'text/plain' });
        response.end(error.message);
    });

    app.handleHttp(request, response);
});

server.listen(env.HOST_PORT ?? DEFAULT_HOST_PORT);

export { server };
