import knex from 'knex';
import { settings } from '../app';
import { generateRandomString } from '../shared/utils';

export type DbArticle = {
    id: string;
    title: string;
    cover: string;
    description: string;
    content: string;
    created_at: string;
    updated_at: string;
    is_draft: number;
    owner_username: string;
    main_category_id?: number;
};

export type DbCategory = {
    id: number;
    name: string;
    tag: string;
    parent_category_id?: number;
};

export type DbJoinedArticle = DbArticle & DbCategory;

export function nextArticleId() {
    return generateRandomString(3);
}

export function createArticlesRepository() {
    const client = knex({
        client: 'mysql2',
        connection: {
            host: settings.dbHost,
            user: settings.dbUsername,
            password: settings.dbPassword,
            database: settings.dbDatabaseName,
        },
    });

    const a = () => client<DbArticle>('articles');

    const listForAdmin = async () => {
        return a().select('*');
    };
    const listForUser = async (username: string) => {
        return a().select('*').where('owner_username', username);
    };

    const makeJoinedWithCategory = () => {
        return client<DbJoinedArticle>()
            .select('articles.*', 'categories.*')
            .from('articles')
            .leftJoin(
                'categories',
                'articles.main_category_id',
                'categories.id'
            );
    };

    const listJoinedAll = async () => {
        return await makeJoinedWithCategory();
    };
    const listJoinedPublished = async () => {
        return await makeJoinedWithCategory().where('articles.is_draft', 0);
    };
    const listJoinedForUser = async (username: string) => {
        return await makeJoinedWithCategory().where(
            'article.owner_username',
            username
        );
    };

    const getJoined = async (id: number, forUsername?: string) => {
        const filter = { id };
        if (forUsername) {
            filter['article.owner_username'] = forUsername;
        }
        return await makeJoinedWithCategory().where(filter);
    };

    const create = async (article: DbArticle) => {
        await a().insert(article);
    };
    const update = async (
        id: string,
        patch: Partial<Omit<DbArticle, 'id'>>
    ) => {
        const updatedRows = await a().where({ id }).update(patch);
    };
    const del = async (id: string) => {
        await a().where({ id }).del();
    };
    const getOne = async (id: string) => {
        return await a().where({ id }).first();
    };
    const getByCategory = async (categoryId: number) => {
        return a().where({ main_category_id: categoryId });
    };

    return {
        getOne,
        getByCategory,
        listJoinedAll,
        listJoinedPublished,
        listJoinedForUser,
        listForAdmin,
        listForUser,
        getJoined,
        create,
        update,
        del,
    };
}

export function createCategoriesRepository() {
    const client = knex({
        client: 'mysql2',
        connection: {
            host: settings.dbHost,
            user: settings.dbUsername,
            password: settings.dbPassword,
            database: settings.dbDatabaseName,
        },
    });

    const cat = () => client<DbCategory>('categories');

    const create = async <T extends Omit<DbCategory, 'id'>>(c: T) => {
        return await cat().insert(c).returning('id');
    };
    const update = async <T extends Partial<DbCategory>>(
        id: number,
        patch: T
    ) => {
        await cat().where({ id }).update(patch);
    };
    const del = async (id: number) => {
        await cat().where({ id }).del();
    };
    const list = async () => {
        return cat().select('*');
    };
    const getOne = async (id: number) => {
        return cat().where({ id }).first();
    };
    const getOneByName = async (name: string) => {
        return cat().where({ name }).first();
    };

    return {
        create,
        update,
        del,
        list,
        getOne,
        getOneByName,
    };
}
