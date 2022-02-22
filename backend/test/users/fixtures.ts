import knex from 'knex';
import { settings } from '../../src/app';
import { DbUser } from '../../src/users/repository';

type DbUserRequired = Omit<DbUser, 'created_at'>;

export default function () {
    const client = knex({
        client: 'mysql2',
        connection: {
            host: settings.dbHost,
            user: settings.dbUsername,
            password: settings.dbPassword,
            database: settings.dbDatabaseName,
        },
    });
    const table = () => client('users');

    const users = generateUsers();
    return {
        clear: async () => table().del(),
        feed: async () => {
            for await (const u of users) {
                await table().insert(u);
            }
        },
        ivan: users[0],
        alex: users[1],
    };
}

function generateUsers(): DbUserRequired[] {
    return [
        {
            username: 'ivan',
            display_name: 'Ivan',
            avatar: '',
            email: 'ivan@gmail.com',
            is_admin: 1,
            is_blocked: 0,
            password_raw: '1234',
        },
        {
            username: 'alex',
            display_name: 'Alex',
            avatar: '',
            email: 'alex@gmail.com',
            is_admin: 0,
            is_blocked: 0,
            password_raw: '1234',
        },
    ];
}
