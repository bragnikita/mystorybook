import { knex } from 'knex';
import { loadSettingsFromEnvironment, settings } from '../../src/app';
import fusers from '../users/fixtures';
import farticles from './fixtures';
import {
    createArticlesRepository,
    createCategoriesRepository,
    DbArticle,
} from '../../src/articles/repository';

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
const articlesTestFixtures = farticles();
const articles = articlesTestFixtures.articles;
const categories = articlesTestFixtures.categories;

const articlesRepository = createArticlesRepository();
const categoriesRepository = createCategoriesRepository();

beforeAll(async () => {
    await articles.clear();
    await users.clear();
    await categories.clear();
    await categories.feed();
});
describe('find articles', () => {
    beforeEach(async () => {
        await users.feed();
        await articles.feed();
    });
    describe('should find all articles', () => {
        let subject: DbArticle[] = [];
        beforeEach(async () => {
            subject = await articlesRepository.listForAdmin();
        });
        it('should get 3 articles', () => {
            expect(subject).toHaveLength(3);
        });
    });
});
describe('articles', () => {
    beforeEach(async () => {
        await articles.clear();
        await articles.feed();
    });
    describe('update article', () => {
        beforeEach(async () => {
            await articlesRepository.update('art-1', { title: 'Other title' });
        });
        it('title is updated', async () => {
            const updated = await articlesRepository.getOne('art-1');
            expect(updated.title).toEqual('Other title');
        });
        it('content is untouched', async () => {
            const updated = await articlesRepository.getOne('art-1');
            expect(updated.content).toEqual('content-1');
        });
    });

    describe('find by category', () => {
        let categoryId: number;
        beforeEach(async () => {
            const target = await categoriesRepository.getOneByName('cat1-1');
            await articlesRepository.update('art-1', {
                main_category_id: target.id,
            });
            categoryId = target.id;
        });

        it('should find art-1', async () => {
            const article = await articlesRepository.getByCategory(categoryId);
            expect(article).toBeTruthy();
        });
    });
});
