export type ControllerRoot = `/${string}`;

export type ControllerResponse = {
    result: Object;
    code: 200 | 201 | 204 | 400 | 404 | 500;
    message?: string;
};

export const enum RequestMethodMapper {
    GET = '_handleGet',
    POST = '_handlePost',
    PUT = '_handlePut',
    DELETE = '_handleDelete',
}

export interface ControllerInterface<Type> {
    root: ControllerRoot;
    proceed(method: string, params?: string[], data?: Object): Type;
}
