import { FastifyInstance, FastifyRequest } from 'fastify';
import multipart from 'fastify-multipart';
import staticFileAccess from 'fastify-static';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import _ from 'lodash';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { settings } from '../../app';
import { generateRandomString } from '../utils';

type RequestFields = { [k: string]: string };
type FileUploadRequest = {
    fieldName: string;
    originalFileName: string;
    requestFields: RequestFields;
    mimeType: string;
    originalExt: string;
};
type Renamer = (request: FastifyRequest, upload: FileUploadRequest) => string;
type UploadedFile = {
    relativePath: string;
    filename: string;
    versions: { [k: string]: string };
};

export type UploadEndpointProps = {
    namespace?: string;
    renameFile?: Renamer;
    maxFileSize?: number;
    onFinished?: (
        file: UploadedFile,
        originalFileName: string,
        fields: RequestFields
    ) => Promise<void> | void;
};

export function registerStorageAccess(urlPath: string, api: FastifyInstance) {
    api.register(staticFileAccess, {
        root: storageRootPath(),
        prefix: urlPath || '/',
    });
}

export function registerUploadHandler(
    urlPath: string,
    api: FastifyInstance,
    rawOpts: UploadEndpointProps = {}
) {
    const opts: UploadEndpointProps = {
        maxFileSize: 10 * 1024 * 1024,
        namespace: 'musc',
        renameFile: defaultRenamingStrategy,
        ...rawOpts,
    };

    api.register(multipart, {
        limits: {
            files: 1,
            fileSize: 10 * 1024 * 1024,
        },
    });
    api.post(urlPath, async function (req, reply) {
        const data = await req.file();

        const fieldsMap = {};
        Object.keys(data.fields).forEach((k) => {
            const fv = data.fields[k];
            const f = _.isArrayLike(fv) ? fv[0] : fv;
            if (!f.file) {
                fieldsMap[f.fieldname] = f['value'];
            }
        });
        const targetFileName = opts.renameFile(req, {
            mimeType: data.mimetype,
            originalFileName: data.filename,
            requestFields: fieldsMap,
            fieldName: data.fieldname,
            originalExt: path.extname(data.filename),
        });

        const pump = promisify(pipeline);
        const storagePath = createStoragePath(targetFileName, opts.namespace);
        await pump(data.file, await createStorageOutputStream(storagePath));

        if (opts.onFinished) {
            await Promise.resolve(
                opts.onFinished(
                    {
                        filename: targetFileName,
                        relativePath: storagePath,
                        versions: {},
                    },
                    data.filename,
                    fieldsMap
                )
            );
        }

        reply.send();
    });
}

const defaultRenamingStrategy: Renamer = (req, upload) => {
    return `${generateRandomString(5)}__${upload.originalFileName}`;
};
const createStoragePath = (filename: string, namespace: string) => {
    return path.join(namespace, filename);
};
const storageRootPath = () => {
    if (path.isAbsolute(settings.storageBasePath)) {
        return settings.storageBasePath;
    }
    return path.join(process.cwd(), settings.storageBasePath);
};
const createStorageOutputStream = async (filePathInStorage: string) => {
    const base = storageRootPath();
    const targetPath = path.join(base, filePathInStorage);
    await mkdir(path.dirname(targetPath), { recursive: true });
    return createWriteStream(targetPath);
};
