import sinon from 'sinon';
import { AppUser } from '../users/domain';
import { createDomainFacade } from './domain';
import * as articlesRepo from './repository';

const defaultUser: AppUser['fields'] = {
    id: 'user',
    username: 'user',
    isAdmin: false,
    isBlocked: false,
};

describe('create article', () => {
    it('should call repository create method', async () => {
        const repoStub = sinon.stub(articlesRepo, 'createArticlesRepository');
        const createMethodStub = sinon.stub().resolves();
        const getOneMethodStub = sinon.stub().resolves({});
        repoStub.returns({
            create: createMethodStub,
            getOne: getOneMethodStub,
        } as never);

        const domain = createDomainFacade(new AppUser(defaultUser));
        await domain.create({
            content: 'content',
            cover: 'cover',
            categoryId: 1,
            isDraft: false,
            title: 'title',
        });

        expect(createMethodStub.called).toBeTruthy();
        sinon.assert.calledWith(
            createMethodStub,
            sinon.match({
                content: 'content',
                cover: 'cover',
                is_draft: 0,
                title: 'title',
            } as articlesRepo.DbArticle)
        );
    });
});
