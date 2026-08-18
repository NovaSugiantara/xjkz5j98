// Unit tests for app.js — run with: node test.js
// No framework; plain asserts. Stubs document/localStorage to exercise real flows.
const fs=require('fs'),assert=require('assert');
const code=fs.readFileSync('app.js','utf8');
const ctl=()=>({value:"",addEventListener(t,f){this["h"+t]=f},dispatch(t,ev={}){const h=this["h"+t];if(h)h({preventDefault(){},...ev})},focus(){}});
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
    if(s==="#stars"){els[s].children=Array.from({length:5},()=>({classList:{toggle(){}},setAttribute(){}}));}
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

eval(code+String.raw`

// pure helpers
assert.strictEqual(esc("<b>&\"'x"),"&lt;b&gt;&amp;&quot;&#39;x");
assert.strictEqual(starStr(3),"★★★☆☆");
assert.strictEqual(starStr(5),"★★★★★");
const u1=uid(),u2=uid();
assert.strictEqual(typeof u1,"string");
assert.notStrictEqual(u1,u2);

// load: malformed storage never crashes, bad records filtered
localStorage.getItem=()=>"garbage";
assert.deepStrictEqual(load(),[]);
localStorage.getItem=()=>"{\"a\":1}";
assert.deepStrictEqual(load(),[]);
localStorage.getItem=()=>JSON.stringify([null,{id:"1",name:"N",brand:"B"}]);
assert.strictEqual(load().length,1);
localStorage.getItem=()=>JSON.stringify([{id:"1",name:5,brand:"B"},{id:"2",name:"X",brand:"Y",color:"#000",notes:"",rating:3,createdAt:1}]);
assert.strictEqual(load().length,1);
localStorage.getItem=()=>null;

// add: trim, persist, dialog closes
form.name.value="  Oxblood  ";
form.brand.value="Diamine";
form.color.value="#6d1828";
form.notes.value="Rich burgundy";
form.rating.value="5";
form.dispatch("submit");
assert.strictEqual(inks.length,1);
assert.strictEqual(inks[0].name,"Oxblood");
assert.strictEqual(inks[0].rating,5);
assert.strictEqual(dlg.closed,true);
assert.strictEqual(JSON.parse(saved)[0].name,"Oxblood");
inks[0].createdAt=1;

// whitespace-only required fields blocked by JS guard (native pattern covers browser path)
form.name.value="   ";
form.brand.value="Diamine";
form.color.value="#000";
form.notes.value="";
form.rating.value="3";
form.dispatch("submit");
assert.strictEqual(inks.length,1);

// render: newest-first, XSS-safe
inks.push({id:"u2",name:"Kon-Peki",brand:"Iroshizuku",color:"#2ea8e0",notes:"",rating:3,createdAt:2});
inks.push({id:"u3",name:"<script>alert(1)</script>",brand:"Evil",color:"#f00",notes:"",rating:2,createdAt:3});
render();
assert(grid.innerHTML.indexOf("Kon-Peki")<grid.innerHTML.indexOf("Oxblood"));
assert(!grid.innerHTML.includes("<script>alert(1)</script>"));
assert(grid.innerHTML.includes("&lt;script&gt;"));

// edit keeps identity, no duplicate
const id=inks[0].id;
openForm(id);
assert.strictEqual(form.name.value,"Oxblood");
assert.strictEqual(dlgTitle.textContent,"Edit ink");
form.name.value="Oxblood 2";
form.notes.value="";
form.rating.value="4";
form.dispatch("submit");
assert.strictEqual(inks.length,3);
assert.strictEqual(inks[0].id,id);
assert.strictEqual(inks[0].name,"Oxblood 2");
assert.strictEqual(inks[0].rating,4);

// malformed rating clamps on edit open; ESC/cancel resets edit state
inks.push({id:"m9",name:"Nine",brand:"B",color:"#fff",notes:"",rating:9,createdAt:4});
openForm("m9");
assert.strictEqual(form.rating.value,5);
dlg.dispatch("close");
assert.strictEqual(editingId,null);

// delete: cancel keeps, confirm removes
global.confirm=()=>false;
grid.dispatch("click",{target:{closest:s=>s==="button[data-act]"?{dataset:{act:"del",id:"m9"}}:null}});
assert.strictEqual(inks.length,4);
global.confirm=()=>true;
grid.dispatch("click",{target:{closest:s=>s==="button[data-act]"?{dataset:{act:"del",id:"m9"}}:null}});
assert.strictEqual(inks.length,3);
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

// rating via star click keeps hidden input in sync
form.rating.value="";
starsEl.dispatch("click",{target:{closest:s=>s==="button"?{value:"5"}:null}});
assert.strictEqual(form.rating.value,5);

// hex readout follows color input
form.color.value="#123456";
form.color.dispatch("input");
assert.strictEqual(hex.textContent,"#123456");

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
form.color.value="#000";
form.notes.value="";
form.rating.value="3";
form.dispatch("submit");
assert(alertMsg.includes("storage"));

console.log("all checks passed");
`);
