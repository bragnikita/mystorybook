import knex, { Knex } from 'knex';
import { settings } from '../app';

export type DbBoolean = 1 | 0

export type DbUser  = {
    username: string,
    display_name: string,
    email: string,
    avatar: string,
    is_admin: DbBoolean,
    is_blocked: DbBoolean,
    created_at: string,
    password_raw: string,
}


export function createRepository() {
    const client = knex({
        client: 'mysql2',
        connection: {
            host: settings.dbHost,
            user: settings.dbUsername,
            password: settings.dbPassword,
            database: settings.dbDatabaseName,
        }
    });
    const q = () => client('users');

    const list = async () => {
        return await q().select("*") as DbUser[];
    }

    const byUsername = async (username: string) => {
        return await q().select("*").where({ username }).first() as DbUser
    }

    const add = async (u: Omit<DbUser, 'created_at'>) => {
        await q().insert(u)
    }

    const update = async (username: string, u: Partial<DbUser>) => {
        await q().update(u).where({username})
    }

    const del = async (username: string) => {
        await q().where({username}).del()
    }

    return { list, byUsername, add, update, del }
}