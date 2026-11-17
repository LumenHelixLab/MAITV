"use strict";
const {privateIPv4} = require("./smartcast.cjs");

/* Opt-in mDNS browse; only candidate Cast devices are surfaced. */
async function discoverCastDevices(timeoutMs=6500) {
  if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>15000) throw new Error("Invalid discovery window.");
  const {Bonjour} = require("bonjour-service");
  const bonjour = new Bonjour();
  const found=new Map();
  let browser;
  try {
    browser=bonjour.find({type:"googlecast"},svc=>{
      if(found.size>=24) return;
      const address=(svc.addresses??[]).find(x=>privateIPv4(x));
      if(!address) return;
      const name=String(svc.name||"Cast device").slice(0,72).replace(/[<>]/g,"");
      found.set(address,{name,host:address});
    });
    await new Promise(resolve=>setTimeout(resolve,timeoutMs));
    return Array.from(found.values()).sort((a,b)=>a.name.localeCompare(b.name));
  }catch{throw new Error("Nearby-device discovery is unavailable. Enter the TV address manually.");}
  finally {
    try{browser?.stop();}catch{}
    try{bonjour.destroy();}catch{}
  }
}
module.exports={discoverCastDevices};
