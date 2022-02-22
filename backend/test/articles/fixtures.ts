import knex from 'knex';
import { settings } from '../../src/app';
import { DateTime } from 'luxon';
import {
    DbArticle,
    DbArticleNoId,
    DbArticleRequired,
    nextArticleId,
} from '../../src/articles/repository';

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
    const articles = () => client<DbArticle>('articles');

    const samples = generateArticles();
    return {
        clear: async () => articles().del(),
        samples,
        feed: async () => {
            for await (const s of samples) {                
                await articles().insert(s);
            }
        },
    };
}

function generateArticles(): DbArticle[] {
    const subj = (num: string | number): DbArticle => {
        return {
            id: nextArticleId(),
            content: 'content' + num,
            cover: '',
            description: 'description' + num,
            is_draft: 0,
            owner_username: 'ivan',
            title: 'title ' + num,
            created_at: DateTime.now().toISO(),
            updated_at: DateTime.now().toISO(),
        };
    };

    return [
        { ...subj(0) },
        { ...subj(1), is_draft: 1 },
        { ...subj(2), is_draft: 1, owner_username: 'alex' },
    ];
}
