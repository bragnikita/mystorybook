import knex from 'knex';
import { settings } from '../app';

export function getDatabase() {
    return knex({
        client: 'mysql2',
        connection: {
            host: settings.dbHost,
            user: settings.dbUsername,
            password: settings.dbPassword,
            database: settings.dbDatabaseName,
        },
    });
}
