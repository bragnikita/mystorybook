import crypto from 'crypto';

export function generateRandomString(bytesLen = 20) {
    return crypto.randomBytes(bytesLen).toString('hex');
}
