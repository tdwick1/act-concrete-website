const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));

export function validEmail(value){
  return typeof value==='string' && value.length<=180 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

export function buildLeadEmails(lead,{from,ownerEmail,siteUrl}){
  const fields=[
    ['Name',lead.name],['Phone',lead.phone],['Email',lead.email],
    ['Property address',lead.address],['City',lead.city],['Service',lead.service],
    ['Approximate size',lead.size],['Preferred timeline',lead.timeline],
    ['Project budget',lead.budget],['Project details',lead.details],
    ['Project photo',lead.photo?'Attached to the private lead record':'None provided']
  ];
  const rows=fields.filter(([,value])=>value).map(([label,value])=>
    `<tr><th align="left" style="padding:8px 12px 8px 0;vertical-align:top;color:#445047">${escapeHtml(label)}</th><td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
  ).join('');
  const plain=fields.filter(([,value])=>value).map(([label,value])=>`${label}: ${value}`).join('\n');
  const base=siteUrl?.replace(/\/$/,'');
  const adminLink=base?`<p><a href="${escapeHtml(base)}/admin" style="color:#216b18">Open the lead dashboard</a></p>`:'';
  const owner={
    from,to:[ownerEmail],subject:`New ACT Concrete inquiry: ${lead.service}`,
    html:`<div style="font-family:Arial,sans-serif;max-width:640px;color:#101810"><h1 style="color:#258b19">New project inquiry</h1><p>A new lead was saved in the ACT Concrete dashboard.</p><table style="border-collapse:collapse">${rows}</table>${adminLink}</div>`,
    text:`New project inquiry\n\n${plain}${base?`\n\nOpen the lead dashboard: ${base}/admin`:''}`
  };
  if(lead.email)owner.reply_to=lead.email;
  const customer=lead.email?{
    from,to:[lead.email],subject:'ACT Concrete received your project inquiry',
    html:`<div style="font-family:Arial,sans-serif;max-width:640px;color:#101810"><h1 style="color:#258b19">Thanks for reaching out.</h1><p>We received your project inquiry. Here is a copy of the information you sent:</p><table style="border-collapse:collapse">${rows}</table><p>This is a copy of your request, not a price quote. ACT Concrete will review it and contact you about the next steps.</p><p>Need to talk sooner? Call <a href="tel:+13043772690">304-377-2690</a>.</p></div>`,
    text:`Thanks for reaching out to ACT Concrete. We received your project inquiry.\n\n${plain}\n\nThis is a copy of your request, not a price quote. ACT Concrete will review it and contact you about the next steps.\nNeed to talk sooner? Call 304-377-2690.`
  }:null;
  if(customer)customer.reply_to=ownerEmail;
  return {owner,customer};
}

export async function sendResendEmail(message,{apiKey,idempotencyKey,fetchImpl=fetch}){
  const response=await fetchImpl('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},
    body:JSON.stringify(message),
    signal:AbortSignal.timeout(10_000)
  });
  if(!response.ok){
    const body=await response.text();
    const error=new Error(`Resend HTTP ${response.status}: ${body.slice(0,500)}`);
    error.permanent=response.status>=400&&response.status<500&&response.status!==429;
    throw error;
  }
  return response.json();
}
