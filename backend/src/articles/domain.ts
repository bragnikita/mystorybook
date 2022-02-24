import { DateTime } from 'luxon';
import { ApiUser, AppUser, toApiUser } from '../users/domain';
import { createRepository, DbUser } from '../users/repository';
import {
    createArticlesRepository,
    createCategoriesRepository,
    DbArticle,
    DbCategory,
    DbJoinedArticle,
    nextArticleId,
} from './repository';

export type ApiArticle = {
    id: string;
    title: string;
    description: string;
    content: string;
    cover: string;
    isPublished: boolean;
    isDraft: boolean;
    ownerUsername: string;
    owner?: ApiUser;
    categoryId?: number;
    categoryName?: string;
    createdAt: string;
    updatedAt: string;
};

function dbBoolean(val: number | undefined | null) {
    return val === 1 ? true : false;
}
function toDbBoolean(val: boolean | undefined | null) {
    return val === null ? null : val === undefined ? undefined : val ? 1 : 0;
}

function createDbToApiMapper(
    article: DbArticle,
    linked: {
        category?: DbCategory;
        user?: DbUser;
    }
) {
    const username = linked.user
        ? linked.user.username
        : article.owner_username;
    const categoryName = linked.category ? linked.category.name : undefined;
    return (): ApiArticle => {
        return {
            id: article.id,
            content: article.content,
            cover: article.cover,
            title: article.title,
            description: article.description,
            createdAt: article.created_at,
            isDraft: dbBoolean(article.is_draft),
            isPublished: !dbBoolean(article.is_draft),
            ownerUsername: username,
            categoryName,
            categoryId: article.main_category_id,
            updatedAt: article.updated_at,
            owner: toApiUser(linked.user),
        };
    };
}

export function createDomainFacade(user: AppUser) {
    const repoArticles = createArticlesRepository();
    const repoCategories = createCategoriesRepository();
    const repoUsers = createRepository();

    const list = async () => {
        let coll: DbJoinedArticle[];
        if (user.isAdmin) {
            coll = await repoArticles.listJoinedAll();
        } else if (user.isUser) {
            coll = await repoArticles.listJoinedForUser(user.fields.username);
        } else {
            coll = await repoArticles.listJoinedPublished();
        }
        const users = await repoUsers.list();
        const apiObjects = coll.map((d) => {
            const user = users.find((u) => u.username === d.owner_username);
            const mapper = createDbToApiMapper(d, {
                category: d,
                user,
            });
            return mapper();
        });
        return apiObjects;
    };

    const create = async (article: Partial<ApiArticle>) => {
        const now = DateTime.now().toISO();
        const owner = user.isAdmin
            ? article.ownerUsername || user.username
            : user.username;
        const dbArticle: DbArticle = {
            id: article.id || nextArticleId(),
            content: article.content,
            cover: article.cover,
            description: article.description,
            title: article.title,
            is_draft: article.isDraft ? 1 : 0,
            main_category_id: article.categoryId,
            owner_username: owner,
            created_at: now,
            updated_at: now,
        };
        await repoArticles.create(dbArticle);
        return await getOne(dbArticle.id);
    };

    const update = async (id: string, article: Partial<ApiArticle>) => {
        const now = DateTime.now().toISO();

        const original = await repoArticles.getOne(id);
        if (!original) {
            throw 'not_found';
        }
        if (!user.isAdmin) {
            if (user.username !== original.owner_username) {
                throw 'access_denied';
            }
        }

        await repoArticles.update(id, {
            content: article.content,
            title: article.title,
            cover: article.cover,
            description: article.description,
            is_draft: toDbBoolean(article.isDraft),
            owner_username: user.isAdmin ? article.ownerUsername : undefined,
            main_category_id: article.categoryId,
            updated_at: now,
        });
    };

    const publish = async (id: string) => {
        return await update(id, { isDraft: false });
    };
    const unpublish = async (id: string) => {
        return await update(id, { isDraft: true });
    };
    const getOne = async (id: string) => {
        const db = await repoArticles.getOne(id);
        if (!user.isAdmin) {
            if (db.is_draft === 0 && db.owner_username !== user.username) {
                throw 'access_denied';
            }
        }
        return createDbToApiMapper(db, {})();
    };
    const del = async (id: string) => {
        const target = await repoArticles.getOne(id);
        if (!target) return;
        if (!user.isAdmin) {
            if (user.username !== target.owner_username) {
                throw 'access_denied';
            }
        }
        await repoArticles.del(id);
    };

    return {
        list,
        create,
        update,
        publish,
        unpublish,
        getOne,
        del,
    };
}
