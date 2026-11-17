"use strict";
const {app,BrowserWindow,ipcMain,safeStorage,shell} = require("electron");
const path=require("node:path");
const {SmartCast,privateIPv4} = require("./lib/smartcast.cjs");
const {createProfileStore} = require("./lib/profile.cjs");
const {discoverCastDevices} = require("./lib/discovery.cjs");

const api=new SmartCast();
let window=null;
let profile=null;
let challenge=null;
let busy=false;

app.setName("MAITV Desktop");
if(!app.requestSingleInstanceLock()) app.quit();
else app.on("second-instance",()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});

function secureCall(callback){
  return async(event,...args)=>{
    if(!window || event.sender!==window.webContents || !event.senderFrame?.url?.startsWith("file://")) {
      throw new Error("Untrusted application request.");
    }
    try{return await callback(...args);}
    catch(err){
      // Only our own errors surface. Never echo HTTP request headers,
      // certificates, Stremio provider data or bearer credentials.
      const safe=err?.message??"Operation failed.";
      throw new Error(safe.length>180 ? "Operation failed." : safe);
    }
  };
}
async function getPaired(){const record=await profile.paired();if(!record)throw new Error("Pair with the TV first.");return record;}
async function pairedAction(fn){
  const record=await getPaired();
  return await fn(record);
}
function startIpc(){
  ipcMain.handle("maitv:state",secureCall(async()=>profile.publicState()));
  ipcMain.handle("maitv:discover",secureCall(async()=>discoverCastDevices()));
  ipcMain.handle("maitv:pairStart",secureCall(async ({host})=>{
    if(busy)throw new Error("A pairing request is already in progress.");
    if(!privateIPv4(host)) throw new Error("Use a private IPv4 address shown in the TV's network settings.");
    busy=true;
    try {
      const deviceId=await profile.ensureDeviceId();
      challenge=await api.startPair(host,deviceId);
      challenge.startedAt=Date.now();
      return {challengeReady:true,host};
    }finally{busy=false;}
  }));
  ipcMain.handle("maitv:pairFinish",secureCall(async ({pin})=>{
    if(!challenge || Date.now()-challenge.startedAt>180000){challenge=null;throw new Error("Pairing expired. Start pairing again.");}
    const deviceId=await profile.ensureDeviceId();
    const token=await api.finishPair(challenge,deviceId,pin);
    await profile.savePair({host:challenge.host,fingerprint:challenge.fingerprint,token});
    challenge=null;
    return await profile.publicState();
  }));
  ipcMain.handle("maitv:status",secureCall(async()=>pairedAction(r=>api.status(r.host,r.token,r.fingerprint))));
  ipcMain.handle("maitv:launch",secureCall(async()=>pairedAction(r=>api.launchStremio(r.host,r.token,r.fingerprint))));
  ipcMain.handle("maitv:searchTV",secureCall(async({query})=>pairedAction(r=>api.launchSearch(r.host,r.token,r.fingerprint,query))));
  ipcMain.handle("maitv:key",secureCall(async({key})=>pairedAction(r=>api.sendKey(r.host,r.token,r.fingerprint,key))));
  ipcMain.handle("maitv:text",secureCall(async({text})=>pairedAction(r=>api.sendText(r.host,r.token,r.fingerprint,text))));
  ipcMain.handle("maitv:forget",secureCall(async()=>{
    challenge=null;
    await profile.forget();
    return profile.publicState();
  }));
  ipcMain.handle("maitv:openStremioPC",secureCall(async()=>{
    await shell.openExternal("https://web.stremio.com/");
    return {ok:true};
  }));
  ipcMain.handle("maitv:alwaysOnTop",secureCall(async({enabled})=>{
    window.setAlwaysOnTop(enabled===true);
    return {enabled:window.isAlwaysOnTop()};
  }));
}
function createWindow(){
  window=new BrowserWindow({
    title:"MAITV Desktop",
    width:1180,height:800,minWidth:790,minHeight:660,
    show:false,
    backgroundColor:"#071025",
    icon:path.join(__dirname,"../assets/lumen-helix-logo.png"),
    webPreferences:{
      preload:path.join(__dirname,"preload.cjs"),
      contextIsolation:true,
      sandbox:true,
      nodeIntegration:false,
      webSecurity:true,
      devTools:!app.isPackaged
    }
  });
  window.setMenuBarVisibility(false);
  window.webContents.setWindowOpenHandler(()=>({action:"deny"}));
  window.webContents.on("will-navigate",(event,url)=>{
    if(!url.startsWith("file://"))event.preventDefault();
  });
  window.once("ready-to-show",()=>window.show());
  if(!app.isPackaged && process.env.MAITV_CAPTURE_PREVIEW){
    window.webContents.once("did-finish-load",async()=>{
      try{
        await new Promise(resolve=>setTimeout(resolve,900));
        const image=await window.webContents.capturePage();
        await require("node:fs/promises").writeFile(process.env.MAITV_CAPTURE_PREVIEW,image.toPNG());
        console.log("MAITV_PREVIEW_CAPTURED");
      }catch{console.log("MAITV_PREVIEW_FAILED");}
      app.quit();
    });
  }
  window.loadFile(path.join(__dirname,"ui","index.html"));
  window.on("closed",()=>{window=null;});
}
app.whenReady().then(()=>{
  profile=createProfileStore(path.join(app.getPath("userData"),"private-profile"),safeStorage);
  startIpc();
  createWindow();
  app.on("activate",()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});
});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});
