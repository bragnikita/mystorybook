import _ from "lodash";
import { report } from "process";
import { createRepository, DbUser } from "./repository"



export type ApiUser = {
    id: string,
    username: string,
    displayName: string,
    email: string,
    avatar: string,
    isAdmin: boolean,
    isBlocked: boolean,
    createdAt: string,
}

export class AppUser {
    constructor(
        public isAdmin: boolean,
        public isAnonym: boolean,
        public username?: string) {
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
export async function create(user: ApiUser) {
    const repo = createRepository();
    await repo.add({
        username: user.username,
        avatar: user.avatar,
        is_admin: user.isAdmin ? 1 : 0,
        is_blocked: user.isBlocked ? 1 : 0,
        display_name: user.displayName,
        email: user.email,
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
