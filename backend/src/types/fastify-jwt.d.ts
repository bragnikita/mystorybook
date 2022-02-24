import 'fastify-jwt';
import { AppUser } from '../users/domain';

declare module 'fastify-jwt' {
    interface FastifyJWT {
        payload: AppUser['fields'];
        user: AppUser;
    }
}
