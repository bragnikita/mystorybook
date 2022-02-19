import fastify from "fastify";
import { loadSettingsFromEnvironment , settings } from "./app";
import users from './users/controller';

loadSettingsFromEnvironment();

const api = fastify({ logger: true });

api.get('/', async (request, reply) => {
    const param = request.query['param'];
    return { hello: 'world', param };
});

api.register(users, { prefix: '/users'});

const start = async () => {
    try {
        await api.listen(settings.httpPort);
    } catch (e) {
        api.log.error(e);
        process.exit(1);
    }
}
start();