// Unit tests for app.js — run with: node test.js
// No framework; plain asserts. Stubs document/localStorage to exercise real flows.
const fs=require('fs'),assert=require('assert');
const code=fs.readFileSync('app.js','utf8');
const ctl=()=>({value:"",addEventListener(t,f){this["h"+t]=f},dispatch(t,ev={}){const h=this["h"+t];if(h)h({preventDefault(){},...ev})},focus(){}});
const star=()=>{const o={attrs:{},cls:{},setAttribute(k,v){o.attrs[k]=String(v)},classList:{toggle(c,f){o.cls[c]=f}}};return o};
const el=()=>({
  value:"",textContent:"",innerHTML:"",id:"",dataset:{},children:[],open:false,closed:false,
  classList:{toggle(){}},setAttribute(){},
  addEventListener(t,f){this["h"+t]=f},
  dispatch(t,ev={}){const h=this["h"+t];if(h)h({preventDefault(){},target:ev.target||this,...ev})},
  close(){this.closed=true;this.dispatch("close")},
  showModal(){this.open=true},reset(){},focus(){}
});
const els={};
global.document={querySelector(s){
  if(!els[s]){
    els[s]=el();
    if(s==="#form"){for(const n of["name","brand","color","notes","rating"])els[s][n]=ctl();}
    if(s==="#stars"){els[s].children=Array.from({length:5},()=>star());}
  }
  return els[s];
}};
let saved=null,alertMsg="";
global.localStorage={getItem:()=>null,setItem:(k,v)=>{saved=v}};
global.confirm=()=>true;
global.alert=m=>{alertMsg=m};
const $=s=>document.querySelector(s);
const form=$("#form"),dlg=$("#dlg"),grid=$("#grid"),status=$("#status"),count=$("#count");
const search=$("#search"),starsEl=$("#stars"),hex=$("#hex"),dlgTitle=$("#dlgTitle");

// boot with stored data: valid records load and render; invalid records are filtered
global.localStorage.getItem=()=>JSON.stringify([
  {id:"a1",name:"Oxblood",brand:"Diamine",color:"#6d1828",notes:"Rich burgundy.",rating:3.5,createdAt:100},
  {id:"a2",name:"Kon-Peki",brand:"Iroshizuku",color:"#2ea8e0",notes:"",rating:5,createdAt:200},
  {id:5,name:"Bad id",brand:"B",color:"#000000",notes:"",rating:1,createdAt:50},      // non-string id -> dropped
  {name:"No id",brand:"B",color:"#000000",notes:"",rating:1,createdAt:50},            // missing id -> dropped
  {id:"a3",name:"Bad color",brand:"B",color:"red",notes:"",rating:1,createdAt:50}     // invalid color -> dropped
]);

eval(code+String.raw`

// boot assertions: filtered, rendered, newest first, float rating clamped
assert.strictEqual(inks.length,2);
assert(grid.innerHTML.includes("Oxblood"));
assert(grid.innerHTML.includes("Kon-Peki"));
assert(grid.innerHTML.indexOf("Kon-Peki")<grid.innerHTML.indexOf("Oxblood"));
assert(grid.innerHTML.includes("aria-label=\"4 out of 5\""));
assert.strictEqual(count.textContent,"2 inks");
assert.strictEqual(status.innerHTML,"");

// pure helpers
assert.strictEqual(esc("<b>&\"'x"),"&lt;b&gt;&amp;&quot;&#39;x");
assert.strictEqual(esc("a\"b"),"a&quot;b");
assert.strictEqual(starStr(3),"★★★☆☆");
const u1=uid(),u2=uid();
assert.notStrictEqual(u1,u2);

// load: malformed storage never crashes
localStorage.getItem=()=>"garbage";
assert.deepStrictEqual(load(),[]);
localStorage.getItem=()=>"{\"a\":1}";
assert.deepStrictEqual(load(),[]);
localStorage.getItem=()=>JSON.stringify([null,{id:"1",name:"N",brand:"B",color:"#000000"}]);
assert.strictEqual(load().length,1);
localStorage.getItem=()=>JSON.stringify([{id:"1",name:5,brand:"B",color:"#000000"},{id:"2",name:"X",brand:"Y",color:"#000000",notes:"",rating:3,createdAt:1}]);
assert.strictEqual(load().length,1);
localStorage.getItem=()=>null;

// add: trim, persist, dialog closes
form.name.value="  Oxblood  ";
form.brand.value="Diamine";
form.color.value="#6d1828";
form.notes.value="Rich burgundy";
form.rating.value="5";
form.dispatch("submit");
assert.strictEqual(inks.length,3);
assert.strictEqual(inks[2].name,"Oxblood");
assert.strictEqual(inks[2].rating,5);
assert.strictEqual(dlg.closed,true);
assert.strictEqual(JSON.parse(saved).length,3);
assert.strictEqual(JSON.parse(saved)[2].name,"Oxblood");

// whitespace-only required fields blocked by JS guard (native pattern covers browser path)
form.name.value="   ";
form.brand.value="Diamine";
form.color.value="#000000";
form.notes.value="";
form.rating.value="3";
form.dispatch("submit");
assert.strictEqual(inks.length,3);

// render: XSS-safe even for a hostile id
inks.push({id:"u\"3\"",name:"<script>alert(1)</script>",brand:"Evil",color:"#ff0000",notes:"",rating:2,createdAt:3});
render();
assert(!grid.innerHTML.includes("<script>alert(1)</script>"));
assert(grid.innerHTML.includes("&lt;script&gt;"));
assert(!grid.innerHTML.includes("data-id=\"u\""));
assert(grid.innerHTML.includes("data-id=\"u&quot;3&quot;\""));

// edit keeps identity, no duplicate
const id=inks[0].id;
openForm(id);
assert.strictEqual(form.name.value,"Oxblood");
assert.strictEqual(dlgTitle.textContent,"Edit ink");
form.name.value="Oxblood 2";
form.notes.value="";
form.rating.value="4";
form.dispatch("submit");
assert.strictEqual(inks.length,4);
assert.strictEqual(inks[0].id,id);
assert.strictEqual(inks[0].name,"Oxblood 2");
assert.strictEqual(inks[0].rating,4);

// malformed rating clamps on edit open (integer, range)
inks.push({id:"m9",name:"Nine",brand:"B",color:"#ffffff",notes:"",rating:9,createdAt:4});
inks.push({id:"m35",name:"Float",brand:"B",color:"#ffffff",notes:"",rating:3.5,createdAt:5});
openForm("m9");
assert.strictEqual(form.rating.value,5);
openForm("m35");
assert.strictEqual(form.rating.value,4);
dlg.dispatch("close");
assert.strictEqual(editingId,null);

// delete: cancel keeps, confirm removes
global.confirm=()=>false;
grid.dispatch("click",{target:{closest:s=>s==="button[data-act]"?{dataset:{act:"del",id:"m9"}}:null}});
assert.strictEqual(inks.length,6);
global.confirm=()=>true;
grid.dispatch("click",{target:{closest:s=>s==="button[data-act]"?{dataset:{act:"del",id:"m9"}}:null}});
assert.strictEqual(inks.length,5);
assert.strictEqual(inks.find(i=>i.id==="m9"),undefined);

// search: name or brand, case-insensitive
search.value="kon";
search.dispatch("input");
assert(grid.innerHTML.includes("Kon-Peki"));
assert(!grid.innerHTML.includes("Oxblood 2"));
search.value="EVIL";
search.dispatch("input");
assert(grid.innerHTML.includes("&lt;script&gt;"));
search.value="";
search.dispatch("input");
assert(grid.innerHTML.includes("Oxblood 2"));

// no-results state
search.value="zzz";
search.dispatch("input");
assert(status.innerHTML.includes("No inks match"));
search.value="";

// rating via star click syncs hidden input, aria-pressed, and on-state
starsEl.dispatch("click",{target:{closest:s=>s==="button"?{value:"2"}:null}});
assert.strictEqual(form.rating.value,2);
assert.strictEqual(starsEl.children[0].attrs["aria-pressed"],"true");
assert.strictEqual(starsEl.children[1].attrs["aria-pressed"],"true");
assert.strictEqual(starsEl.children[2].attrs["aria-pressed"],"false");
assert.strictEqual(starsEl.children[0].cls["on"],true);
assert.strictEqual(starsEl.children[2].cls["on"],false);
starsEl.dispatch("click",{target:{closest:s=>s==="button"?{value:"5"}:null}});
assert.strictEqual(form.rating.value,5);
assert.strictEqual(starsEl.children[4].attrs["aria-pressed"],"true");

// color coercion: invalid color value falls back to default on save
openForm(inks.find(i=>i.name==="Kon-Peki").id);
form.color.value="zzz";
form.notes.value="";
form.dispatch("submit");
assert.strictEqual(inks.find(i=>i.name==="Kon-Peki").color,"#6d1828");

// hex readout follows color input
form.color.value="#123456";
form.color.dispatch("input");
assert.strictEqual(hex.textContent,"#123456");

// render tolerates a record without createdAt (treated oldest, no crash)
inks.push({id:"nc",name:"NoDate",brand:"B",color:"#000000",notes:"",rating:1});
render();
assert(grid.innerHTML.includes("NoDate"));

// empty state + empty-state add button
inks=[];
render();
assert(status.innerHTML.includes("Your ink shelf is empty"));
assert.strictEqual(count.textContent,"");
status.dispatch("click",{target:{id:"emptyAdd"}});
assert.strictEqual(dlg.open,true);
assert.strictEqual(dlgTitle.textContent,"Add ink");

// save failure is surfaced, not silent
localStorage.setItem=()=>{throw new Error("full")};
form.name.value="X";
form.brand.value="Y";
form.color.value="#000000";
form.notes.value="";
form.rating.value="3";
form.dispatch("submit");
assert(alertMsg.includes("storage"));

console.log("all checks passed");
`);
