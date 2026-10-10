import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, SESSION_MAX_AGE_SECONDS, sessionKey, verifySessionToken } from '../session.js';

test('admin login cookie remains valid with a fresh server key until it expires',()=>{
 const now=Date.now(),key=sessionKey('a-long-admin-password');
 const token=createSessionToken(key,now);
 assert.equal(verifySessionToken(token,sessionKey('a-long-admin-password'),now+1000),true);
 assert.equal(verifySessionToken(token,key,now+SESSION_MAX_AGE_SECONDS*1000),false);
 assert.equal(verifySessionToken(token,sessionKey('a-different-password'),now+1000),false);
 assert.equal(verifySessionToken(token,sessionKey('a-long-admin-password','rotated'),now+1000),false);
});

test('tampered and malformed admin cookies are rejected',()=>{
 const key=sessionKey('a-long-admin-password'),token=createSessionToken(key);
 assert.equal(verifySessionToken(token.slice(0,-1)+(token.endsWith('A')?'B':'A'),key),false);
 assert.equal(verifySessionToken('bad-cookie',key),false);
 assert.equal(verifySessionToken(token,null),false);
 assert.equal(sessionKey(''),null);
});
