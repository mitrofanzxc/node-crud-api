export type ControllerRoot = `/${string}`;

export const enum StatusCode {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export type ControllerResponse = {
    result: object;
    code: StatusCode;
    message?: string;
};

export enum RequestMethodMapper {
    GET = '_handleGet',
    POST = '_handlePost',
    PUT = '_handlePut',
    DELETE = '_handleDelete',
}

export interface ControllerInterface<Type> {
    root: ControllerRoot;
    proceed(method: string, params?: string[], data?: object): Type;
}
