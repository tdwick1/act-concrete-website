import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { buildLeadEmails, sendResendEmail, validEmail } from './mailer.js';

const root=process.cwd(), publicDir=path.join(root,'public'), dataDir=path.resolve(process.env.ACT_DATA_DIR||path.join(root,'data')), projectMediaDir=path.join(dataDir,'project-media');
fs.mkdirSync(dataDir,{recursive:true});
fs.mkdirSync(projectMediaDir,{recursive:true});
const db=new DatabaseSync(path.join(dataDir,'act.db'));
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, address TEXT, city TEXT, service TEXT NOT NULL, size TEXT, timeline TEXT, budget TEXT, details TEXT, photo TEXT, status TEXT NOT NULL DEFAULT 'New');
CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, created_at TEXT NOT NULL, body TEXT NOT NULL, FOREIGN KEY(lead_id) REFERENCES leads(id));
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, before_image TEXT NOT NULL, after_image TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS email_jobs (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL, sent_at TEXT, last_error TEXT);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
if(!db.prepare("SELECT value FROM settings WHERE key='gallery_seeded'").get()){
 const seed=db.prepare('INSERT INTO projects (id,created_at,title,category,description,before_image,after_image) VALUES (?,?,?,?,?,?,?)');
 const addedAt=Date.now();
 seed.run('walkway-original',new Date(addedAt).toISOString(),'A path with purpose','Walkways','A concrete walkway project shown during layout and after the pour.','/images/walkway-prep.webp','/images/walkway-finished.webp');
 seed.run('slab-original',new Date(addedAt-1000).toISOString(),'A clean foundation for the space','Slabs','A garage slab project shown during reinforcement and after finishing.','/images/slab-prep.webp','/images/slab-finished.webp');
 db.prepare("INSERT INTO settings (key,value) VALUES ('gallery_seeded','1')").run();
}
const sessions=new Map(), attempts=new Map(), password=process.env.ACT_ADMIN_PASSWORD||'';
const mailConfig={apiKey:process.env.RESEND_API_KEY||'',from:process.env.RESEND_FROM_EMAIL||'',ownerEmail:process.env.ACT_LEAD_EMAIL||'',siteUrl:process.env.SITE_URL||''};
const senderAddress=/<([^<>]+)>$/.exec(mailConfig.from)?.[1]||mailConfig.from;
const emailConfigured=Boolean(mailConfig.apiKey&&validEmail(mailConfig.ownerEmail)&&validEmail(senderAddress));
let emailWorkerRunning=false;
async function processEmailQueue(){
 if(!emailConfigured||emailWorkerRunning)return;
 emailWorkerRunning=true;
 try{
  const jobs=db.prepare("SELECT id,payload,attempts FROM email_jobs WHERE status='pending' AND next_attempt_at<=? ORDER BY next_attempt_at LIMIT 20").all(new Date().toISOString());
  for(const job of jobs){
   try{
    await sendResendEmail(JSON.parse(job.payload),{apiKey:mailConfig.apiKey,idempotencyKey:job.id});
    db.prepare("UPDATE email_jobs SET status='sent',sent_at=?,last_error=NULL WHERE id=?").run(new Date().toISOString(),job.id);
   }catch(error){
    const attempt=job.attempts+1,permanent=error.permanent||attempt>=6;
    const delay=Math.min(60_000*5**(attempt-1),6*60*60_000);
    db.prepare('UPDATE email_jobs SET status=?,attempts=?,next_attempt_at=?,last_error=? WHERE id=?').run(permanent?'failed':'pending',attempt,new Date(Date.now()+delay).toISOString(),String(error.message||error).slice(0,500),job.id);
    console.error(`Email job ${job.id} failed:`,error.message||error);
   }
  }
 }finally{emailWorkerRunning=false;}
}
setInterval(processEmailQueue,30_000).unref();
if(emailConfigured)setImmediate(processEmailQueue);
else console.warn('Lead email is disabled. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and ACT_LEAD_EMAIL to enable it.');
const statuses=new Set(['New','Contacted','Estimate Scheduled','Estimate Sent','Won','Lost']);
const services=new Set(['Sidewalk / Walkway','Concrete Slab','Other Concrete Work']);
const projectCategories=new Set(['Walkways','Slabs','Driveways','Patios','Other Concrete Work']);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.xml':'application/xml','.txt':'text/plain'};
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
function read(req,limit=5_000_000){return new Promise((resolve,reject)=>{let raw='';req.on('data',c=>{raw+=c;if(raw.length>limit){reject(new Error('Request too large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject);});}
function authenticated(req){const token=/(?:^|; )act_session=([^;]+)/.exec(req.headers.cookie||'')?.[1];const expires=token&&sessions.get(token);return Boolean(expires&&expires>Date.now());}
function clean(v,max=2000){return String(v??'').trim().slice(0,max);}
function authorized(req,res){if(!authenticated(req)){json(res,401,{error:'Admin sign-in required.'});return false;}return true;}
function projectRows(){return db.prepare('SELECT id,created_at,title,category,description,before_image,after_image FROM projects ORDER BY created_at DESC, rowid DESC').all();}
function decodeProjectImage(data){
 const m=typeof data==='string'&&/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(data);
 if(!m)throw new Error('Upload a JPG, PNG, or WebP image.');
 const buffer=Buffer.from(m[2],'base64');if(buffer.length<100||buffer.length>5_000_000)throw new Error('Each image must be under 5 MB.');
 const type=m[1],valid=type==='jpeg'?buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff:type==='png'?buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP';
 if(!valid)throw new Error('The uploaded file does not match its image type.');
 return {buffer,ext:type==='jpeg'?'jpg':type};
}
function writeProjectImage(image){const filename=`${crypto.randomUUID()}.${image.ext}`;fs.writeFileSync(path.join(projectMediaDir,filename),image.buffer,{flag:'wx'});return `/project-media/${filename}`;}
function removeProjectImage(url){if(!url?.startsWith('/project-media/'))return;const filename=url.slice('/project-media/'.length);if(/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename))fs.rmSync(path.join(projectMediaDir,filename),{force:true});}
const server=http.createServer(async(req,res)=>{try{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/config')return json(res,200,{adminConfigured:!!password,adminAuthenticated:authenticated(req),emailConfigured});
 if(pathname==='/api/projects'&&req.method==='GET')return json(res,200,{projects:projectRows()});
 if(pathname.startsWith('/project-media/')){
  const filename=pathname.slice('/project-media/'.length);
  if(!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename)){res.writeHead(404);return res.end('Not found');}
  return fs.readFile(path.join(projectMediaDir,filename),(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(filename)],'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'});res.end(data);});
 }
 if(pathname==='/api/leads'&&req.method==='POST'){
  const b=await read(req),name=clean(b.name,120),phone=clean(b.phone,60),service=clean(b.service,100);
  if(b.website)return json(res,201,{ok:true});
  if(!name||!phone||!services.has(service))return json(res,400,{error:'Please enter your name, phone, and a valid project type.'});
  const email=String(b.email??'').trim();
  if(email&&!validEmail(email))return json(res,400,{error:'Please enter a valid email address or leave that field blank.'});
  if(b.photo&&(typeof b.photo!=='string'||!/^data:image\/(jpeg|png|webp);base64,/.test(b.photo)||b.photo.length>4_100_000))return json(res,400,{error:'Please upload a JPG, PNG, or WebP photo under 3 MB.'});
  const lead={id:crypto.randomUUID(),created_at:new Date().toISOString(),name,phone,email,address:clean(b.address,180),city:clean(b.city,100),service,size:clean(b.size,80),timeline:clean(b.timeline,80),budget:clean(b.budget,80),details:clean(b.details,4000),photo:b.photo||''};
  db.exec('BEGIN');
  try{
   db.prepare('INSERT INTO leads (id,created_at,name,phone,email,address,city,service,size,timeline,budget,details,photo,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(lead.id,lead.created_at,lead.name,lead.phone,lead.email,lead.address,lead.city,lead.service,lead.size,lead.timeline,lead.budget,lead.details,lead.photo,'New');
   if(emailConfigured){
    const messages=buildLeadEmails(lead,mailConfig);
    for(const [kind,payload] of Object.entries(messages))if(payload)db.prepare('INSERT INTO email_jobs (id,lead_id,kind,payload,next_attempt_at) VALUES (?,?,?,?,?)').run(crypto.randomUUID(),lead.id,kind,JSON.stringify(payload),lead.created_at);
   }
   db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error;}
  if(emailConfigured)setImmediate(processEmailQueue);
  return json(res,201,{ok:true});
 }
 if(pathname==='/api/admin/login'&&req.method==='POST'){
  if(!password)return json(res,503,{error:'Set ACT_ADMIN_PASSWORD on the server to enable the dashboard.'});
  const ip=req.socket.remoteAddress||'unknown',previous=attempts.get(ip)||{count:0,until:0};if(previous.until>Date.now())return json(res,429,{error:'Too many attempts. Please try again later.'});
  const b=await read(req),a=Buffer.from(String(b.password||'')),c=Buffer.from(password);
  if(a.length!==c.length||!crypto.timingSafeEqual(a,c)){const count=previous.count+1;attempts.set(ip,{count:count>=5?0:count,until:count>=5?Date.now()+15*60_000:0});return json(res,401,{error:'Incorrect password.'});}
  attempts.delete(ip);
  const token=crypto.randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*60*60*1000);
  res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':`act_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${req.socket.encrypted?'; Secure':''}`});return res.end('{"ok":true}');
 }
 if(pathname==='/api/admin/logout'&&req.method==='POST'){const token=/(?:^|; )act_session=([^;]+)/.exec(req.headers.cookie||'')?.[1];sessions.delete(token);res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':'act_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});return res.end('{"ok":true}');}
 if(pathname.startsWith('/api/admin/')){
  if(!authorized(req,res))return;
  if(pathname==='/api/admin/projects'&&req.method==='GET')return json(res,200,{projects:projectRows()});
  if(pathname==='/api/admin/projects'&&req.method==='POST'){
   const b=await read(req,16_000_000),title=clean(b.title,120),category=clean(b.category,80),description=clean(b.description,1000);
   if(!title||!projectCategories.has(category)||!b.beforeImage||!b.afterImage)return json(res,400,{error:'Add a title, category, before photo, and after photo.'});
   let before,after;try{before=decodeProjectImage(b.beforeImage);after=decodeProjectImage(b.afterImage)}catch(e){return json(res,400,{error:e.message});}
   const beforeUrl=writeProjectImage(before),afterUrl=writeProjectImage(after);
   try{db.prepare('INSERT INTO projects (id,created_at,title,category,description,before_image,after_image) VALUES (?,?,?,?,?,?,?)').run(crypto.randomUUID(),new Date().toISOString(),title,category,description,beforeUrl,afterUrl)}catch(e){removeProjectImage(beforeUrl);removeProjectImage(afterUrl);throw e;}
   return json(res,201,{ok:true});
  }
  const projectMatch=/^\/api\/admin\/projects\/([a-z0-9-]+)$/.exec(pathname);
  if(projectMatch){const id=projectMatch[1],current=db.prepare('SELECT * FROM projects WHERE id=?').get(id);if(!current)return json(res,404,{error:'Project not found.'});
   if(req.method==='PATCH'){
    const b=await read(req,16_000_000),title=clean(b.title,120),category=clean(b.category,80),description=clean(b.description,1000);
    if(!title||!projectCategories.has(category))return json(res,400,{error:'Add a title and valid category.'});
    let before,after;try{if(b.beforeImage)before=decodeProjectImage(b.beforeImage);if(b.afterImage)after=decodeProjectImage(b.afterImage)}catch(e){return json(res,400,{error:e.message});}
    const beforeUrl=before?writeProjectImage(before):current.before_image,afterUrl=after?writeProjectImage(after):current.after_image;
    try{db.prepare('UPDATE projects SET title=?,category=?,description=?,before_image=?,after_image=? WHERE id=?').run(title,category,description,beforeUrl,afterUrl,id)}catch(e){if(before)removeProjectImage(beforeUrl);if(after)removeProjectImage(afterUrl);throw e;}
    if(before)removeProjectImage(current.before_image);if(after)removeProjectImage(current.after_image);
    return json(res,200,{ok:true});
   }
   if(req.method==='DELETE'){db.prepare('DELETE FROM projects WHERE id=?').run(id);removeProjectImage(current.before_image);removeProjectImage(current.after_image);return json(res,200,{ok:true});}
  }
  if(pathname==='/api/admin/leads'&&req.method==='GET')return json(res,200,{leads:db.prepare("SELECT id,created_at,name,phone,email,address,city,service,size,timeline,budget,details,status,CASE WHEN photo IS NOT NULL AND photo != '' THEN 1 ELSE 0 END AS has_photo FROM leads ORDER BY created_at DESC").all()});
  if(pathname==='/api/admin/export'&&req.method==='GET'){
   const rows=db.prepare('SELECT created_at,name,phone,email,address,city,service,size,timeline,budget,details,status FROM leads ORDER BY created_at DESC').all(),fields=['created_at','name','phone','email','address','city','service','size','timeline','budget','details','status'];
   const csv=[fields.join(','),...rows.map(row=>fields.map(f=>'"'+String(row[f]??'').replaceAll('"','""')+'"').join(','))].join('\r\n');res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="act-leads.csv"','Cache-Control':'no-store'});return res.end(csv);
  }
  const match=/^\/api\/admin\/leads\/([a-f0-9-]+)(?:\/(notes|photo))?$/.exec(pathname);
  if(match){const[,id,part]=match,lead=db.prepare('SELECT * FROM leads WHERE id=?').get(id);if(!lead)return json(res,404,{error:'Lead not found.'});
   if(part==='photo'&&req.method==='GET'){if(!lead.photo)return json(res,404,{error:'No photo.'});const m=/^data:image\/(jpeg|png|webp);base64,(.*)$/.exec(lead.photo);if(!m)return json(res,404,{error:'Invalid photo.'});res.writeHead(200,{'Content-Type':`image/${m[1]}`,'Cache-Control':'no-store'});return res.end(Buffer.from(m[2],'base64'));}
   if(part==='notes'&&req.method==='POST'){const b=await read(req),body=clean(b.body,2000);if(!body)return json(res,400,{error:'Note cannot be empty.'});db.prepare('INSERT INTO notes VALUES (?,?,?,?)').run(crypto.randomUUID(),id,new Date().toISOString(),body);return json(res,201,{ok:true});}
   if(!part&&req.method==='GET')return json(res,200,{lead:{...lead,photo:undefined},notes:db.prepare('SELECT id,created_at,body FROM notes WHERE lead_id=? ORDER BY created_at DESC').all(id)});
   if(!part&&req.method==='PATCH'){const b=await read(req);if(!statuses.has(b.status))return json(res,400,{error:'Invalid status.'});db.prepare('UPDATE leads SET status=? WHERE id=?').run(b.status,id);return json(res,200,{ok:true});}
   if(!part&&req.method==='DELETE'){db.prepare('DELETE FROM notes WHERE lead_id=?').run(id);db.prepare('DELETE FROM leads WHERE id=?').run(id);return json(res,200,{ok:true});}
  }
  return json(res,404,{error:'Not found.'});
 }
 if(pathname.startsWith('/api/'))return json(res,404,{error:'Not found.'});
 if(pathname==='/sitemap.xml'){
  const base=(process.env.SITE_URL||`http://${req.headers.host||'localhost:3000'}`).replace(/\/$/,'');const pages=['/','/services','/services/walkways','/services/slabs','/projects','/about','/reviews','/contact'];
  const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${base}${p}</loc></url>`).join('')}</urlset>`;res.writeHead(200,{'Content-Type':'application/xml; charset=utf-8'});return res.end(xml);
 }
 let file=path.join(publicDir,decodeURIComponent(pathname));if(pathname==='/'||!path.extname(pathname))file=path.join(root,'index.html');
 if(!file.startsWith(publicDir+path.sep)&&file!==path.join(root,'index.html')){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);});
}catch(e){console.error(e);if(!res.headersSent)json(res,500,{error:'Unable to complete the request.'});}});
const port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';server.listen(port,host,()=>console.log(`ACT Concrete website: http://localhost:${port}`));
