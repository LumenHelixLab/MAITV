"use strict";
const {contextBridge,ipcRenderer}=require("electron");
const call=(channel,payload)=>ipcRenderer.invoke(channel,payload);
contextBridge.exposeInMainWorld("maitv",Object.freeze({
  state:()=>call("maitv:state"),
  discover:()=>call("maitv:discover"),
  pairStart:host=>call("maitv:pairStart",{host}),
  pairFinish:pin=>call("maitv:pairFinish",{pin}),
  status:()=>call("maitv:status"),
  launch:()=>call("maitv:launch"),
  launchSignIn:()=>call("maitv:launchSignIn"),
  launchSection:section=>call("maitv:launchSection",{section}),
  searchTV:query=>call("maitv:searchTV",{query}),
  key:key=>call("maitv:key",{key}),
  text:text=>call("maitv:text",{text}),
  forget:()=>call("maitv:forget"),
  openStremioPC:()=>call("maitv:openStremioPC"),
  alwaysOnTop:enabled=>call("maitv:alwaysOnTop",{enabled})
}));
