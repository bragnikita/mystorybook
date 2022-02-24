import knex from 'knex';
import { DateTime } from 'luxon';
import { settings } from '../../src/app';
import { DbArticle, DbCategory } from '../../src/articles/repository';
import { getDatabase } from '../../src/shared/database';

export default function () {
    const client = getDatabase();
    const articles = () => client<DbArticle>('articles');
    const categories = () => client<DbCategory>('categories');

    const articlesSamples = generateArticles();
    const categoriesSamples = generateCategories();
    return {
        categories: {
            clear: async () => categories().del(),
            samples: categoriesSamples,
            feed: async () => {
                await categories().insert(categoriesSamples);
                const root = await categories().where('name', 'cat1').first();
                await categories()
                    .where('name', 'cat1-1')
                    .update({ parent_category_id: root.id });
                await categories()
                    .where('name', 'cat1-2')
                    .update({ parent_category_id: root.id });
                categoriesSamples.splice(0, categoriesSamples.length);
                categoriesSamples.push(...(await categories().select('*')));
            },
        },
        articles: {
            clear: async () => articles().del(),
            samples: articlesSamples,
            feed: async () => {
                for await (const s of articlesSamples) {
                    await articles().insert(s);
                }
            },
        },
    };
}

function generateArticles(): DbArticle[] {
    const subj = (num: string | number): DbArticle => {
        return {
            id: 'art-' + num,
            content: 'content-' + num,
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

function generateCategories(): DbCategory[] {
    const subj = (name: string): DbCategory => {
        return {
            id: 0,
            name,
            tag: 'tag-' + name,
        };
    };

    return [subj('cat1'), subj('cat2'), subj('cat1-1'), subj('cat1-2')];
}
