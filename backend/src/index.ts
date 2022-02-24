import fastify from 'fastify';
import { loadSettingsFromEnvironment, settings } from './app';
import users from './users/controller';
import mri from 'mri';
import cors from 'fastify-cors';
import articles from './articles/controller';
import jwt from 'fastify-jwt';
import { setupJwtAuthentication } from './users/authentication';
import fastifyMultipart from 'fastify-multipart';
import { registerStorageAccess } from './shared/filestore/controller';

const opts = mri(process.argv.slice(2));
loadSettingsFromEnvironment(opts.config);

const api = fastify({ logger: true });
api.register(cors, {
    origin: true,
});
setupJwtAuthentication(api);
registerStorageAccess('/public', api);
api.get('/', async (request, reply) => {
    const param = request.query['param'];
    return { hello: 'world', param };
});
api.register(users, { prefix: '/users' });
api.register(articles, { prefix: '/articles' });

const start = async () => {
    try {
        await api.listen(settings.httpPort);
    } catch (e) {
        api.log.error(e);
        process.exit(1);
    }
};
start();
