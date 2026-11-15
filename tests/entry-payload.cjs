const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {webcrypto} = require('node:crypto');
const {encrypt, decrypt, update} = require('../.github/scripts/entry-payload.cjs');
const source = fs.readFileSync('index.html','utf8');
const currentPassword = process.env.ENTRY_PASSWORD || 'locked';
const currentLength = /const PASSWORD_LENGTH = (\d+);/.exec(source)[1];
const payload = /const payload = '([^']+)'/.exec(source)[1];

test('existing launcher survives password and length changes using browser-compatible crypto', async () => {
    const original = decrypt(payload, currentPassword);
    const password = 'test-longer-password';
    const next = encrypt(original, password);
    assert.notEqual(next, encrypt(original, password));
    assert.throws(() => decrypt(next, password + '!'));
    const bytes = Buffer.from(next,'base64');
    const material = await webcrypto.subtle.importKey('raw',Buffer.from(password),'PBKDF2',false,['deriveKey']);
    const key = await webcrypto.subtle.deriveKey({name:'PBKDF2',salt:bytes.subarray(0,16),iterations:100000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
    const clear = await webcrypto.subtle.decrypt({name:'AES-GCM',iv:bytes.subarray(16,28)},key,bytes.subarray(28));
    assert.deepEqual(JSON.parse(Buffer.from(clear).toString()), original);
    const changed = update(source,next,password.length);
    assert.ok(changed.includes('const PASSWORD_LENGTH = 20;'));
    assert.ok(changed.includes('slice(-PASSWORD_LENGTH)'));
    assert.ok(!changed.includes(password));
    assert.equal(changed.replace(next,payload).replace('PASSWORD_LENGTH = 20','PASSWORD_LENGTH = ' + currentLength),source);
});

test('generator rejects unsupported passwords, malformed shells and changed entry markers', () => {
    const launcher=decrypt(payload,currentPassword);
    for(const password of ['', '🔒', 'line\nbreak']) assert.throws(()=>encrypt(launcher,password));
    assert.throws(()=>encrypt({...launcher,pages:['https://other.example','ugs.html']},'example'));
    assert.throws(()=>update('unknown file',payload,6));
    assert.throws(()=>decrypt(payload,currentPassword + '!'));
});
