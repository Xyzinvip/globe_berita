// Globe Berita Dunia — server tanpa dependensi (Node 18+). Jalankan: node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,PUB=path.join(__dirname,'public');
const FF=process.env.FF_FEED_URL||'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const ALIAS={'United States of America':'United States','Dem. Rep. Congo':'Democratic Republic of the Congo','Dominican Rep.':'Dominican Republic','Central African Rep.':'Central African Republic','Bosnia and Herz.':'Bosnia and Herzegovina','S. Sudan':'South Sudan','W. Sahara':'Western Sahara','Eq. Guinea':'Equatorial Guinea','Solomon Is.':'Solomon Islands','Falkland Is.':'Falkland Islands','Fr. S. Antarctic Lands':'French Southern Territories','N. Cyprus':'Northern Cyprus','eSwatini':'Eswatini','Czechia':'Czech Republic'};
const cache=new Map();let last=0,chain=Promise.resolve();
// GDELT membatasi ±1 permintaan/5 detik: antrekan semua permintaan keluar
function throttled(fn){const p=chain.then(async()=>{const w=Math.max(0,last+5500-Date.now());if(w)await new Promise(r=>setTimeout(r,w));last=Date.now();return fn()});chain=p.catch(()=>{});return p}
async function cached(key,ttl,fn){const c=cache.get(key);if(c&&Date.now()-c.t<ttl)return{data:c.d};
 try{const d=await fn();cache.set(key,{t:Date.now(),d});return{data:d}}catch(e){if(c)return{data:c.d,stale:true};throw e}}
async function gdelt(name){
 for(const span of['1d','3d']){
  const u='https://api.gdeltproject.org/api/v2/doc/doc?query='+encodeURIComponent('"'+name+'"')+'&mode=ArtList&format=json&maxrecords=60&sort=DateDesc&timespan='+span;
  const r=await fetch(u,{signal:AbortSignal.timeout(20000)}),t=await r.text();let j;
  try{j=JSON.parse(t)}catch{throw new Error('GDELT: '+t.slice(0,100))}
  const a=(j.articles||[]).filter(x=>/^https?:\/\//.test(x.url)).map(x=>({title:x.title,url:x.url,domain:x.domain,seen:x.seendate}));
  if(a.length)return a}
 return[]}
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json;charset=utf-8'});res.end(JSON.stringify(obj))};
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://x');
 try{
  if(u.pathname==='/api/news'){
   let c=(u.searchParams.get('country')||'').trim();if(!c||c.length>60)return send(res,400,{error:'country'});
   const name=ALIAS[c]||c,r=await cached('n:'+name,10*60e3,()=>throttled(()=>gdelt(name)));
   return send(res,200,{articles:r.data,stale:!!r.stale})}
  if(u.pathname==='/api/calendar'){
   const r=await cached('cal',30*60e3,async()=>{const x=await fetch(FF,{signal:AbortSignal.timeout(15000)});if(!x.ok)throw new Error('FF '+x.status);return x.json()});
   return send(res,200,{events:r.data,stale:!!r.stale})}
  let p=path.normalize(decodeURIComponent(u.pathname)).replace(/^(\.\.[\/\\])+/,'');if(p.endsWith('/')||p==='.')p='/index.html';
  const f=path.join(PUB,p);if(!f.startsWith(PUB))return send(res,403,{});
  fs.readFile(f,(e,d)=>{if(e)return send(res,404,{error:'not found'});
   res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':p==='/sw.js'?'no-cache':'public,max-age=300'});res.end(d)})
 }catch(e){send(res,502,{error:String(e.message||e)})}
}).listen(PORT,()=>console.log('Globe Berita berjalan di http://localhost:'+PORT));
