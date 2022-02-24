import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
    registerStorageAccess,
    registerUploadHandler,
} from '../shared/filestore/controller';
import { generateRandomString } from '../shared/utils';
import { createDomainFacade } from './domain';

async function list(request: FastifyRequest, reply: FastifyReply) {
    const domain = createDomainFacade(request.user);
    return { data: await domain.list() };
}

async function create(request: FastifyRequest, reply: FastifyReply) {
    const domain = createDomainFacade(request.user);
    return { data: await domain.create(request.body) };
}

async function getOne(request: FastifyRequest, reply: FastifyReply) {
    const domain = createDomainFacade(request.user);
    return { data: await domain.getOne(request.params['id']) };
}

async function del(request: FastifyRequest, reply: FastifyReply) {
    await createDomainFacade(request.user).del(request.params['id']);
    reply.send();
}

async function publish(request: FastifyRequest, reply: FastifyReply) {
    await createDomainFacade(request.user).publish(request.params['id']);
    reply.send();
}

async function unpublish(request: FastifyRequest, reply: FastifyReply) {
    await createDomainFacade(request.user).unpublish(request.params['id']);
    reply.send();
}

async function update(request: FastifyRequest, reply: FastifyReply) {
    const domain = createDomainFacade(request.user);
    await domain.update(request.params['id'], request.body);
    reply.send();
}

export default function (api: FastifyInstance, _opts, done) {
    api.get('/', list);
    api.post('/', create);
    api.put('/:id', update);
    api.post('/:id/publish', publish);
    api.post('/:id/unpublish', unpublish);
    api.delete('/:id', del);
    api.get('/:id', getOne);
    registerUploadHandler('/:id/attachments', api, {
        namespace: 'articles',
        renameFile: (req, upload) => {
            const id = req.params['id'];
            const filename = upload.originalFileName;
            const prefix = generateRandomString(3);
            return `${id}__${prefix}__${filename}`;
        },
    });
    done();
}
