import { Database } from 'services/db';
import { UserController } from './user';

import type { ControllerInterface, ControllerResponse, ControllerRoot } from './interface';

const controllers = [UserController];

class ControllersProvide {
    private controllers: {
        [key: ControllerRoot]: ControllerInterface<ControllerResponse>;
    } = {};
    async getControllers(database: Database<any>) {
        for (const Controller of controllers) {
            const controllerModel = new Controller(database);

            this.controllers[controllerModel.root] = controllerModel;
        }
        return this.controllers;
    }
}

const controllersProvider = new ControllersProvide();

export { controllersProvider };
