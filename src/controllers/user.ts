import ControllerInterface, {
    ControllerRoot,
    ControllerResponse,
    RequestMethodMapper,
} from './controller.interface';

import type { UserInterface } from 'models/user';
import { createUserModel } from 'models/user';
import { Database } from 'services/db';

export default class UserController implements ControllerInterface<ControllerResponse> {
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
                    code: 400,
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
            code: 500,
            message: "Controller handler can't resolve the request",
        } as ControllerResponse;
    }

    private _handleGet({}, params: string[] = []): ControllerResponse {
        const user_id = params[0];
        const responce = {
            code: 200,
        } as ControllerResponse;

        if (!user_id) {
            responce.result = this.database.all();
        } else {
            const userData = this.database.get(user_id);
            if (!userData) {
                responce.code = 404;
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
            code: 201,
            message: 'User sucessfully added',
            result,
        } as ControllerResponse;
    }

    private _handlePut(data: object, params: string[]): ControllerResponse {
        const user_id = params[0] as string;

        const userData = this.database.get(user_id);
        if (!userData) {
            return {
                code: 404,
                message: "User with this ID doesn't exist",
            } as ControllerResponse;
        }

        const userModel = createUserModel({ ...userData, ...data });
        this.database.update(user_id, userModel);

        return {
            code: 200,
            message: 'User sucessfully updated',
            result: userModel,
        } as ControllerResponse;
    }

    private _handleDelete({}, params: string[]): ControllerResponse {
        const user_id = params[0] as string;

        const userData = this.database.get(user_id);
        if (!userData) {
            return {
                code: 404,
                message: "User with this ID doesn't exist",
            } as ControllerResponse;
        } else {
            this.database.delete(user_id);
        }
        return {
            code: 204,
            message: 'User sucessfully deleted',
        } as ControllerResponse;
    }
}
