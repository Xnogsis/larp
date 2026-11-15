#!/usr/bin/env node
// Native Node crypto only; passwords are read without echo and never written to disk.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline/promises');
const {Writable} = require('node:stream');

function validate(launcher) {
    if (!launcher || typeof launcher.html !== 'string' || !launcher.html.includes('content-frame')
        || !Array.isArray(launcher.pages) || launcher.pages.length !== 2
        || new Set(launcher.pages).size !== 2
        || launcher.pages.some(page => !['gnmath.html', 'ugs.html'].includes(page))) {
        throw new Error('Launcher must contain shell HTML with content-frame and exactly the two catalog pages.');
    }
    return launcher;
}
function key(password, salt) { return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256'); }
function decrypt(payload, password) {
    const bytes = Buffer.from(payload, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(password, bytes.subarray(0, 16)), bytes.subarray(16, 28));
    decipher.setAuthTag(bytes.subarray(-16));
    return validate(JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28, -16)), decipher.final()]).toString('utf8')));
}
function encrypt(launcher, password) {
    if (!/^[\x20-\x7e]{1,128}$/.test(password)) throw new Error('Use 1–128 printable ASCII characters supported by the entry keyboard handler.');
    validate(launcher);
    const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key(password, salt), iv);
    return Buffer.concat([salt, iv, cipher.update(JSON.stringify(launcher), 'utf8'), cipher.final(), cipher.getAuthTag()]).toString('base64');
}
function update(source, payload, length) {
    if (!/const payload = '[A-Za-z0-9+/=]+';/.test(source) || !/const PASSWORD_LENGTH = \d+;/.test(source)) {
        throw new Error('Entry markers changed; no file was written.');
    }
    return source.replace(/const payload = '[A-Za-z0-9+/=]+';/, () => `const payload = '${payload}';`)
        .replace(/const PASSWORD_LENGTH = \d+;/, `const PASSWORD_LENGTH = ${length};`);
}
async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--help')) {
        console.log('node .github/scripts/entry-payload.cjs [--check] [--index PATH] [--launcher JSON_PATH]\nDefault: decrypt current launcher, prompt for new password twice, then update index.html.\n--check: verify current password/payload without writing. --launcher: replace decrypted shell/pages.');
        return;
    }
    let file = path.resolve(__dirname, '../../index.html'), launcherFile, check = false;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--check') check = true;
        else if (['--index', '--launcher'].includes(args[i]) && args[i + 1]) {
            if (args[i++] === '--index') file = path.resolve(args[i]); else launcherFile = args[i];
        } else throw new Error('Unknown or incomplete option. Use --help.');
    }
    if (!process.stdin.isTTY) throw new Error('Run in an interactive terminal so passwords are not passed through arguments or files.');
    const source = fs.readFileSync(file, 'utf8');
    const payload = /const payload = '([A-Za-z0-9+/=]+)';/.exec(source)?.[1];
    if (!payload) throw new Error('Entry payload not found.');
    const output = new Writable({write(chunk, encoding, callback) { callback(); }});
    const rl = readline.createInterface({input:process.stdin, output, terminal:true});
    async function secret(prompt) { process.stdout.write(prompt); const value = await rl.question(''); process.stdout.write('\n'); return value; }
    try {
        let launcher;
        try { launcher = decrypt(payload, await secret('Current password: ')); }
        catch (_) { throw new Error('Current password or encrypted payload is invalid; no file was written.'); }
        if (check) { console.log('Current launcher decrypted and validated; no changes.'); return; }
        if (launcherFile) launcher = validate(JSON.parse(fs.readFileSync(launcherFile, 'utf8')));
        const password = await secret('New password: ');
        if (password !== await secret('Confirm new password: ')) throw new Error('Passwords do not match; no file was written.');
        const next = encrypt(launcher, password);
        decrypt(next, password); // Verify before replacing anything.
        fs.writeFileSync(file, update(source, next, password.length));
        console.log('Updated encrypted launcher and keyboard length. Review diff and run entry tests with ENTRY_PASSWORD set to the new value.');
    } finally { rl.close(); }
}
module.exports = {encrypt, decrypt, update, validate};
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
