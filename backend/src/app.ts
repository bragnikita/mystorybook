import { existsSync, readFileSync } from "fs";
import { load } from "js-yaml";
import path from "path";

export type AppSettings = {
    dbHost: string,
    dbPassword: string,
    dbUsername: string,
    dbPort: number,
    dbDatabaseName: string,
    httpPort: number,
}

const settings: AppSettings = {
    dbHost: "",
    dbPassword: "",
    dbUsername: "",
    dbPort: 3306,
    dbDatabaseName: "",
    httpPort: 3000
}

export function loadSettingsFromEnvironment() {
    const envFile = path.resolve(process.cwd(), '.env')
    if (!existsSync(envFile)) {
        throw '.env file was not found in ' + envFile;
    }
    const yaml = load(readFileSync(envFile, { encoding: 'utf-8'}));
    Object.assign(settings, yaml);

    const password = process.env['DB_PASSWORD'];
    if (password) {
        settings.dbPassword = password;
    }
}

export {
    settings,
}