import { ModelErrorFields } from 'constants/error';

import { FieldsMap, hasRequiredFields } from './../utils/objects';

import type { ModelInterface } from './model';

export interface UserInterface extends ModelInterface {
    username: string;
    age: number;
    hobbies: string[];
}

const requiredFields: FieldsMap = {
    username: {
        required: true,
        type: 'string',
    },
    age: {
        required: true,
        type: 'number',
    },
    hobbies: {
        required: false,
        type: 'array',
        child: <FieldsMap>{
            '*': {
                required: true,
                type: 'string',
            },
        },
    },
};

export const createUserModel = (object: UserInterface): UserInterface => {
    if (hasRequiredFields<UserInterface>(object, requiredFields)) {
        throw new ModelErrorFields();
    }

    const newObject = object as UserInterface;

    newObject.hobbies = newObject.hobbies ?? [];

    return newObject;
};
