import { createServer } from 'node:http';
import { env } from 'node:process';
import dotenv from 'dotenv';

import { App } from 'app';
import { Database } from 'services/db';

import { HOST_PORT } from 'constants/common';

dotenv.config();

const database = new Database();
const app = new App(database);

const server = createServer((request, response) => {
    request.on('error', (error) => {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end(error.message);
    });

    app.handleHttp(request, response);
});

server.listen(env.HOST_PORT ?? HOST_PORT);

export { server };
