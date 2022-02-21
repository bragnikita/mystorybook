import { existsSync, readFileSync } from 'fs';
import { load } from 'js-yaml';
import _ from 'lodash';
import path from 'path';
import crypto from 'crypto';

export type AppSettings = {
    dbHost: string;
    dbPassword: string;
    dbUsername: string;
    dbPort: number;
    dbDatabaseName: string;
    httpPort: number;
    httpJwtSecret: string;
    storageBasePath: string;
};

const settings: AppSettings = {
    dbHost: '',
    dbPassword: '',
    dbUsername: '',
    dbPort: 3306,
    dbDatabaseName: '',
    httpPort: 3000,
    httpJwtSecret: crypto.randomBytes(20).toString('hex'),
    storageBasePath: path.join(process.cwd(), 'storage'),
};

export function loadSettingsFromEnvironment(pathToConfig?: string) {
    const envFile = pathToConfig || path.resolve(process.cwd(), '.env');
    console.log('Loading settings from', envFile);
    if (!existsSync(envFile)) {
        throw '.env file was not found in ' + envFile;
    }
    const yaml = load(readFileSync(envFile, { encoding: 'utf-8' }));
    Object.assign(settings, yaml);

    const password = process.env['DB_PASSWORD'];
    if (password) {
        settings.dbPassword = password;
    }
}

export { settings };
