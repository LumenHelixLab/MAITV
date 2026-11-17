"use strict";
const el=id=>document.getElementById(id);
let paired=false;
let host="";
let pendingPair=false;

const names={remote:"Remote dashboard",connect:"My television",search:"Search & apps",about:"About MAITV"};
function toast(message,problem=false){
  const holder=el("toasts");
  const t=document.createElement("div");
  t.className="toast"+(problem?" error":"");
  t.textContent=message;
  holder.appendChild(t);
  setTimeout(()=>t.remove(),5200);
}
function userError(error){
  const text=String(error?.message||"Operation could not be completed.");
  return text.replace(/^Error invoking remote method '[^']+': Error: /,"").slice(0,180);
}
function section(name) {
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("hidden",p.id!=="page-"+name));
  document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  el("section-name").textContent=names[name]??name;
}
function setPaired(value,ip){
  paired=Boolean(value);host=paired?ip:"";
  const pill=el("connection-pill");
  pill.classList.toggle("connected",paired);
  pill.innerHTML="";
  const dot=document.createElement("i");
  pill.appendChild(dot);
  pill.appendChild(document.createTextNode(paired?" PAIRED":" NOT PAIRED"));
  el("device-name").textContent=paired?"Vizio TV · "+host:"No television paired";
  el("device-description").textContent=paired?
    "Direct local connection saved securely. Check status for current power and app.":"Connect your Vizio to enable remote controls.";
  el("paired-name").textContent=paired?"Paired TV · "+host:"No paired TV";
  el("paired-detail").textContent=paired?"Saved only on this PC. Remote commands require the TV to be reachable.":"Pair a Vizio to enable secure local control.";
  el("forget-pair").disabled=!paired;
  el("hero-pair").textContent=paired?"Manage connection":"Connect TV";
}
async function reloadState() {
  try{
    const s=await window.maitv.state();
    setPaired(s.paired,s.host);
    if(s.paired){el("tv-ip").value=s.host;await refreshStatus(true);}
  }catch(err){toast(userError(err),true);}
}
async function refreshStatus(silent=false){
  if(!paired){if(!silent)toast("Pair your television first.",true);return;}
  const b=el("refresh-status");
  b.disabled=true;
  try{
    const s=await window.maitv.status();
    el("device-name").textContent=s.poweredOn?"Vizio TV · Online":"Vizio TV · Standby";
    el("device-description").textContent=host+"  /  "+s.app;
    if(!silent)toast(s.poweredOn?"TV connected. Current app: "+s.app:"TV reachable in standby.");
  }catch(err){
    el("device-name").textContent="TV not reachable";
    el("device-description").textContent="Check TV power, Wi-Fi, and current address.";
    if(!silent)toast(userError(err),true);
  }finally{b.disabled=false;}
}
async function command(key){
  if(!paired){toast("Connect your TV first.",true);section("connect");return;}
  const btns=document.querySelectorAll('[data-key="'+key+'"]');
  btns.forEach(b=>b.disabled=true);
  try{
    await window.maitv.key(key);
    const t=el("device-description");
    t.textContent="Sent "+key+" · "+host;
  }catch(err){toast(userError(err),true);}
  finally{btns.forEach(b=>b.disabled=false);}
}
async function launch(){
  if(!paired){section("connect");toast("Connect a Vizio before launching Stremio.",true);return;}
  for(const b of [el("open-stremio"),el("open-stremio-side")])b.disabled=true;
  try{
    const r=await window.maitv.launch();
    toast(r.label+". Confirm the screen on your television.");
    setTimeout(()=>refreshStatus(true),1100);
  }catch(err){toast(userError(err),true);}
  finally{for(const b of [el("open-stremio"),el("open-stremio-side")])b.disabled=false;}
}
async function sendText(field){
  if(!paired){toast("Connect your TV first.",true);return;}
  const value=field.value;
  if(value.length<1 || value.length>60 || /[^\x20-\x7e]/.test(value)){
    toast("Enter 1–60 printable ASCII characters.",true);
    return;
  }
  const buttons=[el("send-text"),el("send-search")];
  buttons.forEach(b=>b.disabled=true);
  try{
    const r=await window.maitv.text(value);
    toast(r.label+" This is experimental in Stremio Web.");
    el("remote-text").value=value;
    el("search-query").value=value;
  }catch(err){toast(userError(err),true);}
  finally{buttons.forEach(b=>b.disabled=false);}
}
async function searchOnTV(){
  if(!paired){section("connect");toast("Connect your TV first.",true);return;}
  const query=el("search-query").value.trim();
  if(query.length===0 || query.length>80){toast("Enter a search term of 1–80 characters.",true);return;}
  const button=el("send-search");
  button.disabled=true;
  try{
    const result=await window.maitv.searchTV(query);
    toast(result.label);
    setTimeout(()=>refreshStatus(true),1100);
  }catch(err){toast(userError(err),true);}
  finally{button.disabled=false;}
}
async function discover(){
  const btn=el("discover");
  btn.disabled=true;
  const box=el("found-devices");
  box.replaceChildren();
  const wait=document.createElement("p");
  wait.textContent="Searching for nearby Cast-capable devices (about 7 seconds)…";
  box.appendChild(wait);
  try{
    const devices=await window.maitv.discover();
    box.replaceChildren();
    if(!devices.length){
      const p=document.createElement("p");
      p.textContent="No compatible discovery responses. Enter your TV address manually.";
      box.appendChild(p);
      el("scan-instruction").textContent="No TV was detected; check that your PC and TV share the same local network, or enter its IPv4 address manually.";
      return;
    }
    el("scan-instruction").textContent="Click your Vizio in the results below to fill the IPv4 address. Other Cast devices may also appear.";
    for(const device of devices) {
      const b=document.createElement("button");
      b.className="device-choice";
      b.type="button";
      b.textContent=device.name+" · "+device.host;
      b.dataset.tooltip="Select "+device.name+" to copy "+device.host+" into the TV IPv4 field. Check that this is your Vizio before pairing.";
      b.setAttribute("aria-pressed","false");
      b.onclick=()=>{
        el("tv-ip").value=device.host;
        box.querySelectorAll(".device-choice").forEach(choice=>{
          const selected=choice===b;
          choice.classList.toggle("selected",selected);
          choice.setAttribute("aria-pressed",String(selected));
        });
        el("scan-instruction").textContent="Selected "+device.name+" ("+device.host+"). Confirm the TV, then select Start Pairing.";
        toast("Selected "+device.name+". Its IPv4 address has been filled in.");
      };
      box.appendChild(b);
    }
  }catch(err){
    box.replaceChildren();
    const p=document.createElement("p");
    p.textContent="Discovery unavailable; use the TV IP address shown in Settings.";
    box.appendChild(p);
    toast(userError(err),true);
  }finally{btn.disabled=false;}
}
async function startPair(){
  const ip=el("tv-ip").value.trim();
  const b=el("start-pair");
  b.disabled=true;
  try{
    const s=await window.maitv.pairStart(ip);
    pendingPair=true;
    el("pin-prompt").textContent="A pairing code should now appear on the TV. Enter those four digits here within three minutes.";
    el("finish-pair").disabled=false;
    el("tv-pin").focus();
    toast("Pairing requested. Confirm the code displayed on your TV.");
  }catch(err){toast(userError(err),true);}
  finally{b.disabled=false;}
}
async function finishPair(){
  if(!pendingPair){toast("Start pairing first.",true);return;}
  const pin=el("tv-pin").value.trim();
  const b=el("finish-pair");
  b.disabled=true;
  try{
    const s=await window.maitv.pairFinish(pin);
    pendingPair=false;
    el("tv-pin").value="";
    setPaired(s.paired,s.host);
    section("remote");
    toast("Vizio paired securely. Remote ready.");
    await refreshStatus(true);
  }catch(err){toast(userError(err),true);b.disabled=false;}
}
async function forget(){
  if(!paired)return;
  if(!confirm("Forget this paired TV on this PC? You can pair again later."))return;
  try{
    const s=await window.maitv.forget();
    pendingPair=false;
    setPaired(false,"");
    section("connect");
    toast("Saved TV pairing removed from Windows.");
  }catch(err){toast(userError(err),true);}
}
async function openPC(){
  try{await window.maitv.openStremioPC();toast("Opened Stremio Web in your PC browser.");}
  catch(err){toast(userError(err),true);}
}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>section(b.dataset.tab));
document.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>command(b.dataset.key));
el("open-stremio").onclick=launch;
el("open-stremio-side").onclick=launch;
el("hero-pair").onclick=()=>section("connect");
el("open-stremio-pc").onclick=openPC;
el("open-pc-search").onclick=openPC;
el("discover").onclick=discover;
el("start-pair").onclick=startPair;
el("finish-pair").onclick=finishPair;
el("refresh-status").onclick=()=>refreshStatus();
el("send-text").onclick=()=>sendText(el("remote-text"));
el("send-search").onclick=searchOnTV;
el("forget-pair").onclick=forget;
el("topmost").onchange=async(e)=>{
  try{await window.maitv.alwaysOnTop(e.target.checked);}
  catch(err){toast(userError(err),true);e.target.checked=!e.target.checked;}
};
el("remote-text").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();sendText(el("remote-text"));}});
el("search-query").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();searchOnTV();}});
document.addEventListener("keydown",e=>{
  if(!paired||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;
  if(e.target.closest("input, textarea, select, [contenteditable]"))return;
  const map={ArrowUp:"UP",ArrowDown:"DOWN",ArrowLeft:"LEFT",ArrowRight:"RIGHT",Enter:"OK",Escape:"BACK"};
  const key=map[e.key];
  if(key){e.preventDefault();command(key);}
});
reloadState();
