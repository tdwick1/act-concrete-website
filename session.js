import crypto from 'node:crypto';

export const SESSION_MAX_AGE_SECONDS=14*24*60*60;

export function sessionKey(password,secret=''){
 if(!password)return null;
 return crypto.scryptSync(`${password}\0${secret}`,'act-concrete-admin-session-v1',32);
}

export function createSessionToken(key,now=Date.now()){
 if(!key)throw new Error('Admin sessions are not configured.');
 const expires=now+SESSION_MAX_AGE_SECONDS*1000;
 const payload=`${expires}.${crypto.randomBytes(24).toString('base64url')}`;
 const signature=crypto.createHmac('sha256',key).update(payload).digest('base64url');
 return `${payload}.${signature}`;
}

export function verifySessionToken(token,key,now=Date.now()){
 if(!key||typeof token!=='string'||token.length>200)return false;
 const match=/^(\d{13})\.([A-Za-z0-9_-]{32})\.([A-Za-z0-9_-]{43})$/.exec(token);
 if(!match)return false;
 const expires=Number(match[1]);
 if(expires<=now||expires>now+SESSION_MAX_AGE_SECONDS*1000)return false;
 const payload=`${match[1]}.${match[2]}`;
 const expected=Buffer.from(crypto.createHmac('sha256',key).update(payload).digest('base64url'));
 const received=Buffer.from(match[3]);
 return received.length===expected.length&&crypto.timingSafeEqual(received,expected);
}
