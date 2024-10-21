import request from 'supertest';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';

import { server } from 'server';
import { Database } from 'services/db';
import { UserController } from 'controllers/user';
import { StatusCode } from 'controllers/interface';

dotenv.config();

const validBody = {
    username: 'User Name',
    age: 20,
    hobbies: ['hobbie'],
};

const invalidBodies = [
    {
        username: '',
        age: 20,
        hobbies: ['hobbie'],
    },
    {
        username: 'User Name',
        age: 'string',
        hobbies: ['hobbie'],
    },
    {
        username: 'User Name',
        age: 20,
        hobbies: [100],
    },
];

jest.mock('services/db');

const userController = new UserController(new Database());
const controller_root = userController.root;

jest.unmock('services/db');

describe('Valid Requests', () => {
    test('Get all records with a GET api/users request (an empty array is expected)', async () => {
        const response = await request(server).get(controller_root);

        expect(response.status).toEqual(StatusCode.OK);
        expect(response.body).toEqual({ result: [] });
    });

    test('Get not existed user (404 status and the message expected)', async () => {
        const valid_id = uuid();
        const response = await request(server).get(controller_root + '/' + valid_id);

        expect(response.status).toEqual(StatusCode.NOT_FOUND);
        expect(response.body).toHaveProperty('message');
    });

    test('Add new valid user (201 status and the result expected)', async () => {
        const response = await request(server).post(controller_root).send(validBody);

        expect(response.status).toEqual(StatusCode.CREATED);
        expect(response.body).toHaveProperty('result.id');
    });

    test('Get existed user (200 status and the result expected)', async () => {
        const createUserResponce = await request(server).post(controller_root).send(validBody);

        expect(createUserResponce.body).toHaveProperty('result.id');

        const user_id = createUserResponce.body.result.id;

        const getUserResponce = await request(server).get(controller_root + '/' + user_id);

        expect(getUserResponce.status).toEqual(StatusCode.OK);
        expect(getUserResponce.body).toHaveProperty('result.id');
    });

    test('Delete existed user (204 status expected)', async () => {
        const createUserResponce = await request(server).post(controller_root).send(validBody);

        expect(createUserResponce.body).toHaveProperty('result.id');
        const user_id = createUserResponce.body.result.id;

        const getUserResponce = await request(server).delete(controller_root + '/' + user_id);

        expect(getUserResponce.status).toEqual(StatusCode.NO_CONTENT);
    });

    test('Update existed user (200 status and the result expected)', async () => {
        const createUserResponce = await request(server).post(controller_root).send(validBody);

        expect(createUserResponce.body).toHaveProperty('result.id');

        const user_id = createUserResponce.body.result.id;

        validBody.username = 'New Name';

        const putUserResponce = await request(server)
            .put(controller_root + '/' + user_id)
            .send(validBody);

        expect(putUserResponce.status).toEqual(StatusCode.OK);
        expect(putUserResponce.body).toHaveProperty('result');
        expect(putUserResponce.body.result).toMatchObject({
            ...validBody,
            id: user_id,
        });
    });
});

describe('Invalid Requests', () => {
    test('Get invalid user ID (400 status and the message expected)', async () => {
        const invalid_id = uuid() + '__';
        const response = await request(server).get(controller_root + '/' + invalid_id);

        expect(response.status).toEqual(StatusCode.BAD_REQUEST);
        expect(response.body).toHaveProperty('message');
    });

    test('Requests to non-existing endpoints', async () => {
        const createUserResponce = await request(server).get('/no/' + controller_root);

        expect(createUserResponce.status).toEqual(StatusCode.NOT_FOUND);
        expect(createUserResponce.body).toHaveProperty('message');
    });

    test('Add new user with invalid JSON (500 status expected)', async () => {
        const response = await request(server).post(controller_root).send('{someBrokenJson"');

        expect(response.status).toEqual(StatusCode.INTERNAL_SERVER_ERROR);
    });
});

describe('Required fields', () => {
    test.each(invalidBodies)(
        'Add user with incorect fields - {username: "$username", age: "$age", hobbies: "$hobbies",  (400 status expected)',
        async (body) => {
            const response = await request(server).post(controller_root).send(body);

            expect(response.status).toEqual(StatusCode.BAD_REQUEST);
        },
    );

    test.each(invalidBodies)(
        'Update user with incorect fields - {username: "$username", age: "$age", hobbies: "$hobbies",  (400 status and message expected)',
        async (body) => {
            const createUserResponce = await request(server).post(controller_root).send(validBody);

            expect(createUserResponce.body).toHaveProperty('result.id');

            const user_id = createUserResponce.body.result.id;

            const updateBody = { ...body, user_id };

            const putUserResponce = await request(server)
                .put(controller_root + '/' + user_id)
                .send(updateBody);

            expect(putUserResponce.status).toEqual(StatusCode.BAD_REQUEST);
            expect(putUserResponce.body).toHaveProperty('message');
        },
    );
});

server.close();
