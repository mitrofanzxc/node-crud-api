import { Database } from '../services/db';

import type { ControllerInterface, ControllerResponse, ControllerRoot } from './interface';
import { RequestMethodMapper, StatusCode } from './interface';

import type { UserInterface } from '../models/user';
import { createUserModel } from '../models/user';

export class UserController implements ControllerInterface<ControllerResponse> {
    root: ControllerRoot = '/api/users';
    protected database: Database<UserInterface>;

    constructor(database: Database<any>) {
        this.database = database as Database<UserInterface>;
    }

    public proceed(
        method: keyof typeof RequestMethodMapper,
        params: string[],
        data: object,
    ): ControllerResponse {
        const operation = RequestMethodMapper[method];
        const handler = this[operation];

        if (handler) {
            try {
                return handler.bind(this)(data, params);
            } catch (error) {
                return {
                    code: StatusCode.BAD_REQUEST,
                    message:
                        error instanceof Error
                            ? error.message
                            : error instanceof String
                              ? error
                              : (error as string),
                } as ControllerResponse;
            }
        }

        return {
            code: StatusCode.INTERNAL_SERVER_ERROR,
            message: "Controller handler can't resolve the request",
        } as ControllerResponse;
    }

    private _handleGet({}, params: string[] = []): ControllerResponse {
        const user_id = params[0];
        const responce = {
            code: StatusCode.OK,
        } as ControllerResponse;

        if (!user_id) {
            responce.result = this.database.all();
        } else {
            const userData = this.database.get(user_id);

            if (!userData) {
                responce.code = StatusCode.NOT_FOUND;
                responce.message = "User with this ID doesn't exist";
            } else {
                responce.result = userData;
            }
        }

        return responce;
    }

    private _handlePost(data: object): ControllerResponse {
        const model = createUserModel(data);
        const result = this.database.add(model);
        return {
            code: StatusCode.CREATED,
            message: 'User sucessfully added',
            result,
        } as ControllerResponse;
    }

    private _handlePut(data: object, params: string[]): ControllerResponse {
        const user_id = params[0] as string;
        const userData = this.database.get(user_id);

        if (!userData) {
            return {
                code: StatusCode.NOT_FOUND,
                message: "User with this ID doesn't exist",
            } as ControllerResponse;
        }

        const userModel = createUserModel({ ...userData, ...data });

        this.database.update(user_id, userModel);

        return {
            code: StatusCode.OK,
            message: 'User sucessfully updated',
            result: userModel,
        } as ControllerResponse;
    }

    private _handleDelete({}, params: string[]): ControllerResponse {
        const user_id = params[0] as string;

        const userData = this.database.get(user_id);
        if (!userData) {
            return {
                code: StatusCode.NOT_FOUND,
                message: "User with this ID doesn't exist",
            } as ControllerResponse;
        } else {
            this.database.delete(user_id);
        }
        return {
            code: StatusCode.NO_CONTENT,
            message: 'User sucessfully deleted',
        } as ControllerResponse;
    }
}
