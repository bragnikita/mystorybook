import fastify from "fastify";
import { loadSettingsFromEnvironment, settings } from "./app";
import users from './users/controller';
import mri from 'mri';
import cors from 'fastify-cors';
import jwt from 'fastify-jwt';
import { setupJwtAuthentication } from "./users/authentication";

const opts = mri(process.argv.slice(2));
loadSettingsFromEnvironment(opts.config);

const api = fastify({ logger: true });
api.register(cors, {
    origin: true,
});
setupJwtAuthentication(api);
api.get('/', async (request, reply) => {
    const param = request.query['param'];
    return { hello: 'world', param };
});
api.register(users, { prefix: '/users' });

const start = async () => {
    try {
        await api.listen(settings.httpPort);
    } catch (e) {
        api.log.error(e);
        process.exit(1);
    }
}
start();