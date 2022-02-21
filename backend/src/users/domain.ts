import _ from "lodash";
import { report } from "process";
import { stringify } from "querystring";
import { createRepository, DbUser } from "./repository"



export type ApiUser = {
    id: string,
    username: string,
    displayName: string,
    email: string,
    avatar: string,
    isAdmin: boolean,
    isBlocked: boolean,
    password?: string,
    createdAt: string,
}

export type UserTokenPayload = {
    id: string,
    username?: string,
    isBlocked: boolean,
    isAdmin: boolean,
    roles: string[],
    permissions: string[],
}

export class AppUser {

    roles: string[] = []
    permissions: string[] = []
    
    constructor(public fields :{
        id: string,
        username?: string,
        isAdmin: boolean,        
        isBlocked: boolean,
    }) {
    }
    
    get isAnonym() {
        return !!this.fields.username;
    }

    static fromTokenPayload(tokenPayload: UserTokenPayload) {
        const appUser = new AppUser(_.omit(tokenPayload, 'roles', 'permissions'));
        appUser.roles = tokenPayload.roles;
        appUser.permissions = tokenPayload.permissions;
        return appUser;
    }

    toTokenPayload(): UserTokenPayload {
        return {
            ...this.fields,
            roles: this.roles,
            permissions: this.permissions,
        }
    }
}



function toApiUser(d: DbUser): ApiUser {
    if (!d) return null;
    return {
        id: d.username,
        username: d.username,
        avatar: d.avatar,
        email: d.email,
        createdAt: d.created_at,
        displayName: d.display_name,
        isAdmin: !!d.is_admin,
        isBlocked: !!d.is_blocked,
    }
}

function toDbUser(a: Partial<ApiUser>): Partial<DbUser> {
    return {

    }
}

export async function list() {
    const repo = createRepository();
    const users = await repo.list();
    return users.map(toApiUser);
}
export async function getOne(username: string) {
    return toApiUser(await createRepository().byUsername(username))
}
export async function create(
    user: ApiUser) {
    const repo = createRepository();
    await repo.add({
        username: user.username,
        avatar: user.avatar,
        is_admin: user.isAdmin ? 1 : 0,
        is_blocked: user.isBlocked ? 1 : 0,
        display_name: user.displayName,
        email: user.email,
        password_raw: user.password,
    });
    return toApiUser(await repo.byUsername(user.username));
}
export async function update(username: string, patch: Partial<ApiUser>) {
    const repo = createRepository();
    await repo.update(username, {
        avatar: patch.avatar,
        display_name: patch.displayName,
        email: patch.email,
        is_admin: _.isUndefined(patch.isAdmin) ? undefined : (patch.isAdmin ? 1 : 0),
        is_blocked: _.isUndefined(patch.isBlocked) ? undefined : (patch.isBlocked ? 1 : 0),
    });
    return toApiUser(await repo.byUsername(username));
}
export async function del(username:string) {
    await createRepository().del(username);
}

export async function authorizeByPassword(username: string, password: string): Promise<{
    isBlocked?: boolean,
    isWrongCredentials?: boolean,
    isUserNotFound?: boolean,
    tokenPayload?: UserTokenPayload
}> {
    const repo = createRepository();
    const dbUser = await repo.byUsername(username);
    if (!dbUser) {
        return { isUserNotFound: true }
    }
    if (dbUser.password_raw !== password) {
        return { isWrongCredentials: true }
    }
    if (dbUser.is_blocked === 1) {
        return { isBlocked: true }
    }

    const apiUser = toApiUser(dbUser);
    const payload: UserTokenPayload = {
        ..._.pick(apiUser, 'id', 'username', 'isAdmin', 'isBlocked'),
        roles: [],
        permissions: []
    }
    return {
        tokenPayload: payload,
    }
}