import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { registerUploadHandler } from '../shared/filestore/controller';
import { generateRandomString } from '../shared/utils';
import { registerSignIn as registerSignInHandler } from './authentication';
import * as domain from './domain';

async function getOne(request: FastifyRequest, _reply: FastifyReply) {
    const target = await domain.getOne(request.params['username']);
    return {
        data: target || null,
    };
}
async function getAll(_request: FastifyRequest, _reply: FastifyReply) {
    return {
        data: await domain.list(),
    };
}

async function create(request: FastifyRequest, _reply: FastifyReply) {
    return {
        data: await domain.create(request.body as domain.ApiUser),
    };
}

async function update(request: FastifyRequest, _reply: FastifyReply) {
    return {
        data: await domain.update(
            request.params['username'],
            request.body as Partial<domain.ApiUser>
        ),
    };
}

async function del(request: FastifyRequest, reply: FastifyReply) {
    await domain.del(request.params['username']);
    reply.code(200).send();
}

export default function (api: FastifyInstance, _opts, done) {
    api.delete('/:username', del);
    api.post('/', create);
    api.put('/:username', update);
    api.get('/:username', getOne);
    api.get('/', getAll);
    registerSignInHandler('/signIn', api);
    registerUploadHandler('/avatar', api, {
        namespace: 'users/avatars',
        renameFile: (req, upload) => {
            const forUser = upload.requestFields['username'] || 'user';
            return `${generateRandomString(5)}__${forUser}__avatar${
                upload.originalExt
            }`;
        },
        onFinished: async (f, o, fields) => {
            console.log('finished', f, o, fields);
        },
    });
    done();
}
