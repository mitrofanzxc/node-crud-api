import { createServer, request as httpRequest, RequestOptions } from 'node:http';
import { availableParallelism } from 'node:os';
import cluster, { Worker } from 'node:cluster';
import dotenv from 'dotenv';

import { DEFAULT_CLUSTER_PORT } from './constants/common';

import { App } from './app';

import { Database } from './services/db';
import { StatusCode } from './controllers/interface';

dotenv.config();

if (cluster.isPrimary) {
    const CLUSTER_PORT =
        process.env.CLUSTER_PORT && isNaN(parseInt(process.env.CLUSTER_PORT))
            ? parseInt(process.env.CLUSTER_PORT)
            : DEFAULT_CLUSTER_PORT;

    const available_workers = availableParallelism() - 1;
    const database = new Database();

    console.log(`Cluster created`);

    for (let i = 0; i <= available_workers; i++) {
        const port = CLUSTER_PORT + 1 + i;
        const worker = cluster.fork({ HOST_PORT: port });

        console.log(`Worker run on the port: ${port}`);

        worker.send(database);

        worker.on('exit', (code) => {
            console.error(`Worker on the port ${port} existed with the code: ${code}`);

            cluster.fork({ HOST_PORT: port });
            worker.send(database);

            console.log(`Worker run on the port: ${port}`);
        });
    }

    cluster.on('message', (messagedWorker: Worker, workerDatabase: object) => {
        if (!workerDatabase || !workerDatabase.hasOwnProperty('data')) {
            return;
        }

        database.merge(workerDatabase as Database<any>);

        for (const worker_id in cluster.workers) {
            const worker = cluster.workers[worker_id];

            if (worker && worker !== messagedWorker) {
                worker.send(database);
            }
        }

        console.log(`Database updated from the worker`);
    });

    let worker_index: number;

    const clusterServer = createServer((request, response) => {
        worker_index = ((worker_index || 0) % available_workers) + 1;

        console.log(`Cluster get a httpRequest`);

        new Promise(() => {
            const WORKER_PORT = CLUSTER_PORT + worker_index;

            console.log(`Cluster creates a httpRequest to the port: ${WORKER_PORT}`);

            const requestToWorker = httpRequest(
                {
                    port: WORKER_PORT,
                    host: request.headers.host?.split(':')[0],
                    path: request.url,
                    method: request.method,
                    headers: request.headers,
                } as RequestOptions,
                (workerResponce) => {
                    console.log(`Cluster proxied a httpRequest to the port: ${WORKER_PORT}`);
                    response.writeHead(
                        workerResponce.statusCode ?? StatusCode.INTERNAL_SERVER_ERROR,
                        workerResponce.headers,
                    );
                    workerResponce.pipe(response);
                },
            );

            request.pipe(requestToWorker);

            response.on('finish', () => {
                console.log(`Cluster finished a httpRequest on the port: ${WORKER_PORT}`);
            });

            requestToWorker.on('error', () => {
                response.writeHead(StatusCode.INTERNAL_SERVER_ERROR, {
                    'Content-Type': 'text/plain',
                });
                response.end('Internal Server Error');
            });
        });
    });

    clusterServer.listen(CLUSTER_PORT, () => {
        console.log(`Cluster listening on the port: ${CLUSTER_PORT}`);
    });
} else {
    const HOST_PORT =
        process.env.HOST_PORT && isNaN(parseInt(process.env.HOST_PORT))
            ? parseInt(process.env.HOST_PORT)
            : DEFAULT_CLUSTER_PORT;

    const database = new Database();
    const app = new App(database);

    const server = createServer((request, response) => {
        request.on('error', () => {
            response.writeHead(StatusCode.INTERNAL_SERVER_ERROR);
        });
        app.handleHttp(request, response);
    });

    server.on('httpRequest', ({}, response) => {
        response.on('finish', () => {
            process.send ? process.send(database) : null;
        });
    });

    server.listen(process.env.HOST_PORT ?? DEFAULT_CLUSTER_PORT);

    console.log(`Worker listening on the port: ${HOST_PORT}`);

    process.on('message', (parentDatabase: Database<any>) => {
        database.merge(parentDatabase);

        console.log(`Worker database updated on the port: ${HOST_PORT}`);
    });
}
