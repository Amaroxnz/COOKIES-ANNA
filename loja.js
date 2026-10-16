const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const brl=n=>'R$'+String(+n).replace('.',',');
const FALLBACK=[['nutella','Nutella','Massa de baunilha com recheio de Nutella.',13,'🍫'],['oreo','Oreo','Massa black com recheio de Oreo, Nutella e brigadeiro de leite ninho.',12,'⚫'],['kinder','Kinder Bueno','Massa de baunilha com recheio de Kinder.',13,'🥛'],['redvelvet','Red Velvet','Massa de red velvet com recheio de brigadeiro de leite ninho.',12,'❤️'],['pistache','Pistache','Massa de baunilha com pedaços de pistache recheado de creme de pistache.',12,'🟢'],['brookie','Brookie','Nutella + cookie + brownie.',20,'🍰']].map(([id,name,description,price,emoji])=>({id,name,description,price,emoji,stock:99}));
const db=(window.supabase&&window.CFG&&!CFG.URL.startsWith('COLE'))?supabase.createClient(CFG.URL,CFG.KEY):null;
let PRODUCTS=[],rating=0;

function card(p){
  const out=p.stock<=0;
  const img=p.photo_url?`<img class="cookie-photo" src="${esc(p.photo_url)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="cookie-emoji">${esc(p.emoji)}</div>`;
  const badge=out?'<div class="badge">Esgotado</div>':p.stock<=5?`<div class="badge low">Últimas ${p.stock} unid.</div>`:'';
  return `<div class="cookie-card${out?' soldout':''}" data-id="${esc(p.id)}" data-name="${esc(p.name)}" data-price="${p.price}" data-stock="${p.stock}"${out?'':' onclick="toggleCookie(this)"'}>${img}<div class="cookie-info"><div class="cookie-name">${esc(p.name)}</div><div class="cookie-desc">${esc(p.description)}</div>${badge}<div class="qty-wrapper"><button class="qty-btn" onclick="changeQty(event,this,-1)">−</button><span class="qty-num">1</span><button class="qty-btn" onclick="changeQty(event,this,1)">+</button><span class="qty-label">unid.</span></div></div><div class="cookie-price">${brl(p.price)}</div></div>`;
}

async function init(){
  let list=FALLBACK;
  if(db){const {data,error}=await db.from('products').select('*').order('sort').order('name');if(!error&&data)list=data}
  PRODUCTS=list;
  $('menuGrid').innerHTML=list.map(card).join('')||'<p class="empty-cart">Cardápio em breve 🍪</p>';
  if(db){
    $('rvProduct').innerHTML='<option value="">Geral</option>'+list.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    $('reviewsSection').style.display='block';
    loadReviews();
  }
}

async function loadReviews(){
  const {data}=await db.from('reviews').select('*,products(name)').eq('approved',true).order('created_at',{ascending:false}).limit(30);
  const r=data||[];
  $('avg').textContent=r.length?`★ ${(r.reduce((s,x)=>s+x.rating,0)/r.length).toFixed(1).replace('.',',')} · ${r.length} avaliaç${r.length>1?'ões':'ão'}`:'Seja a primeira a avaliar! 🍪';
  $('reviewList').innerHTML=r.map(x=>`<div class="review"><div class="stars">${'★'.repeat(x.rating)}${'☆'.repeat(5-x.rating)}</div><b>${esc(x.name)}</b><div class="rv-meta">${x.products?.name?esc(x.products.name)+' · ':''}${new Date(x.created_at).toLocaleDateString('pt-BR')}</div><p style="margin-top:6px">${esc(x.comment)}</p></div>`).join('');
}

function pickStar(n){rating=n;document.querySelectorAll('.star-pick button').forEach((b,i)=>b.classList.toggle('on',i<n))}

async function sendReview(){
  const name=$('rvName').value.trim(),comment=$('rvText').value.trim();
  if(!name||!comment||!rating)return alert('Preencha seu nome, as estrelas e o comentário.');
  const {error}=await db.from('reviews').insert({name,rating,comment,product_id:$('rvProduct').value||null});
  if(error)return alert('Não foi possível enviar agora. Tente novamente.');
  $('rvName').value=$('rvText').value='';pickStar(0);
  $('rvMsg').textContent='Obrigada! Sua avaliação aparecerá aqui depois de aprovada. 💛';
}
init();
