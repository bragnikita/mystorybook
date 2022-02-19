import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as domain from './domain';

async function getOne(request: FastifyRequest, reply: FastifyReply) {
    const target = await domain.getOne(request.params['username']);
    return {
        data: target || null,
    }
}
async function getAll(request: FastifyRequest, reply: FastifyReply) {
    return {
        data: await domain.list(),
    }
}

async function create(request: FastifyRequest, reply: FastifyReply) {
    return {
        data: await domain.create(request.body as domain.ApiUser),
    }
}

async function update(request: FastifyRequest, reply: FastifyReply) {
    return {
        data: await domain.update(request.params['username'],
            request.body as Partial<domain.ApiUser>),
    }
}


async function del(request: FastifyRequest, reply: FastifyReply) {
    await domain.del(request.params['username']);
    reply.code(200).send()
}


export default function (api: FastifyInstance, opts, done) {
    api.delete('/:username', del);
    api.post('/', create);
    api.put('/:username', update);
    api.get('/:username', getOne);
    api.get('/', getAll);
    done();
}