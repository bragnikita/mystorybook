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
export type DbArticleNoId = Omit<DbArticle, 'id'>;
export type DbArticleRequired = Omit<DbArticle, 'id' | 'created_at'>;

export type DbCategory = {
    id: number;
    name: string;
    tag: string;
    parent_category_id: number;
};

export function nextArticleId() {
    return generateRandomString(3);
}

export function createRepository() {
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
        return client<DbArticle & DbCategory>()
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

    return {
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
