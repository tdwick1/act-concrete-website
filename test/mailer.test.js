import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLeadEmails, sendResendEmail, validEmail } from '../mailer.js';

test('owner alert and customer copy include the inquiry without executing customer HTML',()=>{
 const lead={name:'Ada <script>alert(1)</script>',phone:'304-555-0100',email:'ada@example.com',service:'Concrete Slab',details:'Garage <b>floor</b>',photo:'data:image/png;base64,abc'};
 const {owner,customer}=buildLeadEmails(lead,{from:'ACT Concrete <estimates@act.example>',ownerEmail:'owner@act.example',siteUrl:'https://act.example'});
 assert.deepEqual(owner.to,['owner@act.example']);
 assert.deepEqual(customer.to,['ada@example.com']);
 assert.equal(owner.reply_to,'ada@example.com');
 assert.match(owner.html,/&lt;script&gt;/);
 assert.doesNotMatch(owner.html,/<script>/);
 assert.match(customer.text,/This is a copy of your request, not a price quote/);
 assert.match(customer.text,/Garage <b>floor<\/b>/);
 assert.doesNotMatch(customer.text,/data:image/);
 assert.match(owner.html,/https:\/\/act.example\/admin/);
});

test('optional customer email and Resend idempotency',async()=>{
 assert.equal(validEmail('person@example.com'),true);
 assert.equal(validEmail('bad\n@example.com'),false);
 const {customer}=buildLeadEmails({name:'A',phone:'123',email:'',service:'Concrete Slab'}, {from:'a@example.com',ownerEmail:'owner@example.com'});
 assert.equal(customer,null);
 let request;
 await sendResendEmail({from:'a@example.com',to:['b@example.com'],subject:'Test',text:'Hello'}, {
  apiKey:'test-key',idempotencyKey:'job-123',fetchImpl:async(url,options)=>{request={url,options};return {ok:true,json:async()=>({id:'email-1'})};}
 });
 assert.equal(request.url,'https://api.resend.com/emails');
 assert.equal(request.options.headers['Idempotency-Key'],'job-123');
 assert.equal(request.options.headers.Authorization,'Bearer test-key');
});
