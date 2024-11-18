import { IncomingMessage, ServerResponse } from 'node:http';

import {
    StatusCode,
    type ControllerInterface,
    type ControllerResponse,
    type ControllerRoot,
} from '../controllers/interface';
import { controllersProvider } from '../controllers/provider';

import { Database } from '../services/db';

export class Router {
    protected controllers: {
        [key: ControllerRoot]: ControllerInterface<any>;
    } = {};

    async build(database: Database<any>) {
        this.controllers = await controllersProvider.getControllers(database);
    }

    handleRequest(request: IncomingMessage, response: ServerResponse): void {
        let data: string = '';

        response.setHeader('Content-Type', 'application/json');

        request.on('data', (chunk) => {
            data += chunk.toString();
        });

        request.on('end', () => {
            try {
                this.proceed(request, response, data);
            } catch (error) {
                request.emit('error', error);
            }
        });
    }

    protected proceed(request: IncomingMessage, response: ServerResponse, data: string) {
        let result: ControllerResponse | null = null;

        if (request.method) {
            for (const [root, controller] of Object.entries(this.controllers)) {
                if (request.url && `${request.url}/`.startsWith(`${root}/`)) {
                    const regex = new RegExp(`^${root}(\/)?`);
                    const params = request.url
                        .replace(regex, '')
                        .split('/')
                        .filter((val) => val && val !== '');

                    result = controller.proceed(
                        request.method,
                        params,
                        data ? JSON.parse(data) : {},
                    );
                }
            }
        }

        if (!result) {
            result = {
                code: StatusCode.NOT_FOUND,
                message: 'Controller hanlder not found',
            } as ControllerResponse;
        }

        response.statusCode = result.code;
        response.write(
            JSON.stringify({
                result: result.result,
                message: result.message,
            }),
        );

        response.end();
    }
}
