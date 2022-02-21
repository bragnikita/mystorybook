import { FastifyInstance } from "fastify";
import jwt from 'fastify-jwt';
import { settings } from "../app";
import { generateRandomString } from "../shared/utils";
import { AppUser, authorizeByPassword } from "./domain";

export function createAnonymousUser(id = generateRandomString()) {
    return new AppUser({ id, isAdmin: false, isBlocked: false });
}

export function setupJwtAuthentication(api: FastifyInstance) {
    api.register(jwt, {
        secret: settings.httpJwtSecret,
        trusted: (request, decodedToken) => {
            return AppUser.fromTokenPayload(decodedToken['user']);
        },
        messages: {
            noAuthorizationInHeaderMessage: 'no_header',
            authorizationTokenExpiredMessage: 'expired',
            authorizationTokenInvalid: 'invalid',
            authorizationTokenUntrusted: 'untrusted'
        }
    });
    api.addHook("onRequest", async (req, reply) => {
        try {
            await req.jwtVerify();
        } catch (e) {
            const code = e.message;
            if (code === 'no_header') {
                req.user = createAnonymousUser();
            } else {
                reply.statusCode = 401
                reply.send({ message: 'Invalid token' })
            }
        }
    });
}

export function registerSignIn(path: string, api: FastifyInstance) {

    api.post(path, async (req, reply) => {
        const login = req.body['login'];
        const password = req.body['password'];
        const { isBlocked, tokenPayload, isWrongCredentials, isUserNotFound }
            = await authorizeByPassword(login, password);
        const response = {
            result: 'ok',
            token: ''
        };
        if (isBlocked) {
            response.result = 'blocked';
        }
        if (isWrongCredentials) {
            response.result = 'wrong_credentials'
        }
        if (isUserNotFound) {
            response.result = 'not_found'
        }
        if (tokenPayload) {
            response.token = api.jwt.sign({ user: tokenPayload });
        }

        if (response.result !== 'ok') {
            reply.statusCode = 401;
        }
        reply.send(response);
    });

}