import { knex } from 'knex';
import { loadSettingsFromEnvironment, settings } from '../src/app';
import fusers from './users/fixtures';
import farticles from './articles/fixtures';
import { createRepository, DbArticle } from '../src/articles/repository';

loadSettingsFromEnvironment('server/.test.env');

const client = knex({
    client: 'mysql2',
    connection: {
        host: settings.dbHost,
        user: settings.dbUsername,
        password: settings.dbPassword,
        database: settings.dbDatabaseName,
    },
});

const users = fusers();
const articles = farticles();

const repository = createRepository();

beforeAll(async () => {
    await articles.clear();
    await users.clear();
});
describe('find articles', () => {
    beforeEach(async () => {
        await users.feed();
        await articles.feed();
    });
    describe('should find all articles', () => {
        let subject: DbArticle[] = [];
        beforeEach(async () => {
            subject = await repository.listForAdmin();
        });
        it('should get 3 articles', () => {
            expect(subject).toHaveLength(3);
        });
    });
});
