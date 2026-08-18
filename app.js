const KEY='ink_journal';
const $=s=>document.querySelector(s);
const grid=$('#grid'),status=$('#status'),count=$('#count');
const dlg=$('#dlg'),form=$('#form'),dlgTitle=$('#dlgTitle'),submit=$('#submit');
const search=$('#search'),starsEl=$('#stars'),hex=$('#hex'),custom=$('#custom'),shadeEl=$('#shade'),presets=$('#presets'),preview=$('#preview');
let inks=load(),editingId=null;

function load(){
  try{
    const arr=JSON.parse(localStorage.getItem(KEY)||'[]');
    return Array.isArray(arr)?arr.filter(i=>i&&typeof i.name==='string'&&typeof i.brand==='string'&&typeof i.id==='string'&&i.id&&/^#[0-9a-f]{6}$/i.test(i.color)):[];
  }catch(e){return []}
}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(inks))}
  catch(e){alert('Could not save — storage is full or blocked.')}
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const starStr=r=>'★'.repeat(r)+'☆'.repeat(5-r);
const uid=()=>crypto.randomUUID();
let base='#6d1828';
const mix=(h,t,to)=>'#'+[1,3,5].map(i=>{const v=parseInt(h.slice(i,i+2),16);return Math.round(v+(to-v)*t).toString(16).padStart(2,'0')}).join('');
function applyShade(){
  const v=+shadeEl.value,t=Math.abs(v-50)/50;
  form.color.value=v<50?mix(base,t,0):v>50?mix(base,t,255):base;
  hex.textContent=form.color.value;
  preview.style.background=form.color.value;
}

function render(){
  const q=search.value.trim().toLowerCase();
  const list=inks.filter(i=>!q||i.name.toLowerCase().includes(q)||i.brand.toLowerCase().includes(q))
                 .sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  grid.innerHTML=list.map(c=>{
    const r=Math.min(5,Math.max(0,Math.round(+c.rating)||0));
    return `<article class="card">
      <div class="swatch" style="background:${esc(c.color)}" role="img" aria-label="Ink color ${esc(c.color)}"></div>
      <div class="card-body">
        <p class="brand">${esc(c.brand)}</p>
        <h2 class="name">${esc(c.name)}</h2>
        <p class="rating" aria-label="${r} out of 5">${starStr(r)}</p>
        ${c.notes?`<p class="note">${esc(c.notes)}</p>`:''}
        <div class="actions">
          <button class="btn" data-act="edit" data-id="${esc(c.id)}">Edit</button>
          <button class="btn danger" data-act="del" data-id="${esc(c.id)}">Delete</button>
        </div>
      </div>
    </article>`;
  }).join('');
  count.textContent=inks.length?(q?`${list.length} of ${inks.length} inks`:`${inks.length} ink${inks.length===1?'':'s'}`):'';
  if(!inks.length){
    status.innerHTML='<div class="empty-visual" aria-hidden="true"><span class="empty-swatch"></span><span class="empty-swatch"></span><span class="empty-swatch"></span></div><h2>Your ink shelf is empty.</h2><p>Add your first bottle or sample to start the journal.</p><button class="btn primary" id="emptyAdd" type="button">Add ink</button>';
  }else if(!list.length){
    status.innerHTML='<h2>No inks match this search.</h2><p>Try another ink name or brand.</p>';
  }else{
    status.innerHTML='';
  }
}

function setRating(r){
  form.rating.value=r=Math.min(5,Math.max(1,Math.round(+r)||3));
  [...starsEl.children].forEach((b,i)=>(b.classList.toggle('on',i<r),b.setAttribute('aria-pressed',i<r)));
}
function openForm(id){
  editingId=id||null;
  form.reset();
  const ink=id?inks.find(i=>i.id===id):null;
  dlgTitle.textContent=ink?'Edit ink':'Add ink';
  submit.textContent=ink?'Save changes':'Save ink';
  base=ink?ink.color:'#6d1828';
  custom.value=base;
  shadeEl.value=50;
  applyShade();
  if(ink){
    form.name.value=ink.name;
    form.brand.value=ink.brand;
    form.notes.value=ink.notes||'';
    setRating(ink.rating);
  }else{
    setRating(3);
  }
  dlg.showModal();
  form.name.focus();
}

form.addEventListener('submit',e=>{
  e.preventDefault();
  const name=form.name.value.trim(),brand=form.brand.value.trim();
  if(!name||!brand)return;
  const data={name,brand,color:/^#[0-9a-f]{6}$/i.test(form.color.value)?form.color.value:'#6d1828',notes:form.notes.value.trim(),rating:+form.rating.value||3};
  if(editingId){
    const ink=inks.find(i=>i.id===editingId);
    if(ink)Object.assign(ink,data);
  }else{
    inks.push({id:uid(),...data,createdAt:Date.now()});
  }
  save();
  dlg.close();
  render();
});
$('#addBtn').addEventListener('click',()=>openForm());
search.addEventListener('input',render);
starsEl.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(b)setRating(+b.value);
});
presets.addEventListener('click',e=>{
  const b=e.target.closest('button[data-c]');
  if(!b)return;
  base=b.dataset.c;
  custom.value=base;
  applyShade();
  [...presets.children].forEach(x=>x.classList.toggle('on',x===b));
});
custom.addEventListener('input',()=>{base=custom.value;applyShade();});
shadeEl.addEventListener('input',applyShade);
$('#cancel').addEventListener('click',()=>dlg.close());
dlg.addEventListener('close',()=>{editingId=null});
grid.addEventListener('click',e=>{
  const b=e.target.closest('button[data-act]');
  if(!b)return;
  const ink=inks.find(i=>i.id===b.dataset.id);
  if(!ink)return;
  if(b.dataset.act==='edit')openForm(ink.id);
  else if(confirm(`Delete "${ink.name}"?`)){
    inks=inks.filter(i=>i.id!==ink.id);
    save();
    render();
  }
});
status.addEventListener('click',e=>{
  if(e.target.id==='emptyAdd')openForm();
});
render();