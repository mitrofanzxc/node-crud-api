import ControllerInterface, { ControllerRoot, ControllerResponse } from './controller.interface';

import { Database } from 'services/db';

import UserController from './user';

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
