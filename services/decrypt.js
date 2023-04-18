import Cryptr from 'cryptr';

export default (encrypted) => {
    let buff = Buffer.alloc(25, process.env.ENCRYPTION_KEY, 'base64');
    const cryptr = new Cryptr(buff.toString('ascii'));

    return cryptr.decrypt(encrypted);
}