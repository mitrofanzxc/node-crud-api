import { v4 as uuid, validate } from 'uuid';

import { DatabaseErrorID } from '../constants/error';

export type UUID = ReturnType<typeof uuid>;

export class Database<Type> {
    protected data: { [key: UUID]: Type };

    constructor(data?: { [key: UUID]: Type }) {
        this.data = data || {};
    }

    public add(row: Type): Type {
        const id: UUID = uuid();
        const model = { ...row, id } as Type;

        this.data[id] = model;

        return model;
    }

    public delete(id: UUID): boolean {
        this.checkId(id);

        return this.data?.[id] ? delete this.data?.[id] : false;
    }

    public update(id: UUID, row: Type): boolean {
        this.checkId(id);

        return this.data?.[id]
            ? true && (this.data[id] = { ...row, id } as Type) !== undefined
            : false;
    }

    public get(id: UUID): Type | undefined {
        this.checkId(id);

        return this.data?.[id];
    }

    public all(): Type[] {
        return Object.values(this.data);
    }

    public merge(database: Database<Type>) {
        this.data = database.data;
    }

    private checkId(id: string) {
        if (!validate(id)) {
            throw new DatabaseErrorID();
        }
    }
}
