"use strict";
const https = require("node:https");
const tls = require("node:tls");
const crypto = require("node:crypto");

const STREMIO_WEB = "https://web.stremio.com/";
const STREMIO_SIGNIN = STREMIO_WEB + "#/intro";
const STREMIO_SECTIONS = Object.freeze({
  home: STREMIO_WEB + "#/",
  library: STREMIO_WEB + "#/library",
  addons: STREMIO_WEB + "#/addons",
  settings: STREMIO_WEB + "#/settings"
});
const KEYMAP = Object.freeze({
  UP: [3,8], DOWN:[3,0], LEFT:[3,1], RIGHT:[3,7], OK:[3,2],
  BACK:[4,0], HOME:[4,3], MENU:[4,8],
  VOL_UP:[5,1], VOL_DOWN:[5,0], MUTE:[5,4],
  PLAY:[2,3], PAUSE:[2,2], INPUT:[7,1]
});
const PATHS = new Set(["/pairing/start","/pairing/pair","/key_command/","/app/launch","/state/device/power_mode","/app/current"]);

function privateIPv4(host) {
  if (typeof host !== "string" || !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return false;
  const ip = host.split(".").map(Number);
  if (ip.some(v => !Number.isInteger(v) || v > 255 || v < 0) || ip[3] === 0 || ip[3] === 255) return false;
  return ip[0] === 10 || (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31) || (ip[0] === 192 && ip[1] === 168);
}

function asciiText(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 60 && /^[\x20-\x7e]+$/.test(value);
}
function stremioSearchUrl(query) {
  if(typeof query!=="string") throw new Error("Enter a search query.");
  const clean=query.trim();
  if(clean.length<1 || clean.length>80 || /[\u0000-\u001f\u007f]/.test(clean)) throw new Error("Search must be 1–80 printable characters.");
  try {return STREMIO_WEB+"#/search?search="+encodeURIComponent(clean);}
  catch {throw new Error("The query contains invalid Unicode characters.");}
}
function normalizePin(pin) {
  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) throw new Error("Enter the four-digit code shown on the TV.");
  return pin;
}
function getFingerprint(cert) {
  if (!cert || !Buffer.isBuffer(cert.raw) || cert.raw.length === 0) throw new Error("TV did not provide a certificate.");
  return crypto.createHash("sha256").update(cert.raw).digest("hex");
}

/*
 * A dedicated TLS agent prevents any AUTH bearer header from being written
 * to the connection until its peer certificate has been checked.
 * Windows SmartCast uses self-signed HTTPS; the bypass applies ONLY to this
 * private-IP socket and only for the initial on-screen PIN pairing.
 */
class TrustOnPairAgent extends https.Agent {
  constructor(expectedFingerprint, onFingerprint) {
    super({keepAlive:false, maxSockets:1});
    this.expected = expectedFingerprint ?? null;
    this.onFingerprint = onFingerprint;
  }
  createConnection(options, callback) {
    let done = false;
    const finish = (error, socket) => {
      if (done) return;
      done = true;
      callback(error ?? null, error ? undefined : socket);
    };
    const socket = tls.connect({ ...options, rejectUnauthorized: false, servername: undefined });
    socket.once("secureConnect", () => {
      try {
        const fp = getFingerprint(socket.getPeerCertificate(true));
        if (this.expected && fp !== this.expected) throw new Error("TV certificate changed. Re-pair after checking the device.");
        this.onFingerprint?.(fp);
        finish(null, socket);
      } catch (err) {
        socket.destroy();
        finish(err);
      }
    });
    socket.once("error", () => finish(new Error("Could not establish a secure local connection to the TV.")));
    socket.setTimeout(7500, () => {
      socket.destroy();
      finish(new Error("TV connection timed out."));
    });
    // Important: do not return the unverified socket to https.Agent.
    return undefined;
  }
}

async function requestTV({ host, path, method = "GET", body = null, token = "", fingerprint = null }) {
  if (!privateIPv4(host)) throw new Error("Enter a private Wi-Fi IPv4 address for the TV.");
  if (!PATHS.has(path) || !["GET","PUT"].includes(method)) throw new Error("Unsupported TV operation.");
  if (!path.startsWith("/pairing/") && (!token || !fingerprint)) throw new Error("Pair your television first.");
  if (fingerprint !== null && !/^[a-f0-9]{64}$/.test(fingerprint)) throw new Error("Invalid TV certificate pin.");
  const data = body === null ? "" : JSON.stringify(body);
  if (Buffer.byteLength(data) > 8192) throw new Error("TV request exceeds limit.");
  return await new Promise((resolve,reject)=>{
    let settled = false;
    let observed = null;
    const fail = err => { if(!settled){settled=true;reject(err);} };
    const agent = new TrustOnPairAgent(fingerprint, fp=>observed=fp);
    const req = https.request({
      hostname:host, port:7345, path, method, agent,
      timeout:8500,
      headers:{
        Accept:"application/json",
        ...(method === "PUT" ? {"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)} : {}),
        ...(token ? {AUTH:token} : {})
      }
    }, res=>{
      let bytes=0;
      const chunks=[];
      res.on("data", chunk=>{
        bytes+=chunk.length;
        if(bytes>65536){req.destroy();fail(new Error("TV response exceeded safety limit."));return;}
        chunks.push(chunk);
      });
      res.on("end", ()=>{
        if(settled) return;
        if(res.statusCode<200 || res.statusCode>299) return fail(new Error("TV request rejected ("+res.statusCode+")."));
        try{
          if(!observed) throw new Error("TV certificate was not verified.");
          const obj=JSON.parse(Buffer.concat(chunks).toString("utf8"));
          if(obj?.STATUS?.RESULT && String(obj.STATUS.RESULT).toUpperCase()!=="SUCCESS")
            throw new Error("TV rejected this command.");
          settled=true;resolve({data:obj,fingerprint:observed});
        }catch(e){fail(e instanceof SyntaxError ? new Error("TV returned invalid response.") : e);}
      });
      res.on("error",()=>fail(new Error("TV response interrupted.")));
    });
    req.on("timeout", ()=>{req.destroy();fail(new Error("TV did not respond in time."));});
    req.on("error", e=>fail(e?.message?.startsWith("TV certificate changed")?e:new Error("TV connection failed. Check Wi-Fi and the TV's IP address.")));
    req.end(data);
  });
}

class SmartCast {
  constructor(transport=requestTV){this.send=transport;}
  async startPair(host, deviceId){
    const {data,fingerprint}=await this.send({
      host, method:"PUT",path:"/pairing/start",
      body:{DEVICE_NAME:"MAITV Desktop",DEVICE_ID:deviceId}
    });
    const item=data?.ITEM;
    if(!item || !Number.isInteger(Number(item.PAIRING_REQ_TOKEN))) throw new Error("TV did not provide a pairing challenge.");
    return {host,fingerprint,requestToken:Number(item.PAIRING_REQ_TOKEN),type:Number(item.CHALLENGE_TYPE??1)};
  }
  async finishPair(challenge,deviceId,pin){
    normalizePin(pin);
    const {data}=await this.send({
      host:challenge.host,method:"PUT",path:"/pairing/pair",fingerprint:challenge.fingerprint,
      body:{DEVICE_ID:deviceId,DEVICE_NAME:"MAITV Desktop",CHALLENGE_TYPE:challenge.type,
        PAIRING_REQ_TOKEN:challenge.requestToken,RESPONSE_VALUE:pin}
    });
    const token=data?.ITEM?.AUTH_TOKEN;
    if(typeof token!=="string" || token.length<4) throw new Error("Pairing failed or was not authorized.");
    return token;
  }
  async launchStremio(host,token,fingerprint){
    await this.send({host,token,fingerprint,method:"PUT",path:"/app/launch",
      body:{VALUE:{NAME_SPACE:4,APP_ID:"17",MESSAGE:STREMIO_WEB}}});
    return {ok:true,label:"Stremio Web launch sent"};
  }
  async launchSection(host,token,fingerprint,section){
    if(!Object.prototype.hasOwnProperty.call(STREMIO_SECTIONS,section))
      throw new Error("Unknown Stremio page.");
    await this.send({host,token,fingerprint,method:"PUT",path:"/app/launch",
      body:{VALUE:{NAME_SPACE:4,APP_ID:"17",MESSAGE:STREMIO_SECTIONS[section]}}});
    return {ok:true,label:"Stremio "+section+" page requested. Check the television."};
  }
  async launchSignIn(host,token,fingerprint){
    await this.send({host,token,fingerprint,method:"PUT",path:"/app/launch",
      body:{VALUE:{NAME_SPACE:4,APP_ID:"17",MESSAGE:STREMIO_SIGNIN}}});
    return {ok:true,label:"Stremio sign-in route sent. Confirm the sign-in screen on TV."};
  }
  async launchSearch(host,token,fingerprint,query){
    const url=stremioSearchUrl(query);
    await this.send({host,token,fingerprint,method:"PUT",path:"/app/launch",
      body:{VALUE:{NAME_SPACE:4,APP_ID:"17",MESSAGE:url}}});
    return {ok:true,label:"Stremio search route launched. Confirm results on your TV."};
  }
  async sendKey(host,token,fingerprint,key){
    const map=KEYMAP[key];
    if(!map) throw new Error("Unsupported remote key.");
    await this.send({host,token,fingerprint,method:"PUT",path:"/key_command/",
      body:{KEYLIST:[{CODESET:map[0],CODE:map[1],ACTION:"KEYPRESS"}]}});
    return {ok:true,label:key+" command sent"};
  }
  async sendText(host,token,fingerprint,text){
    if(!asciiText(text)) throw new Error("Enter 1–60 printable ASCII characters.");
    await this.send({host,token,fingerprint,method:"PUT",path:"/key_command/",
      body:{KEYLIST:Array.from(text).map(c=>({CODESET:0,CODE:c.charCodeAt(0),ACTION:"KEYPRESS"}))}});
    return {ok:true,label:"Text command sent. Confirm it appeared in the TV field."};
  }
  async status(host,token,fingerprint){
    const power=await this.send({host,token,fingerprint,path:"/state/device/power_mode"});
    const app=await this.send({host,token,fingerprint,path:"/app/current"});
    const poweredOn=power.data?.ITEMS?.find(x=>x.CNAME==="power_mode")?.VALUE===1;
    const current=app.data?.ITEMS?.[0]??app.data?.ITEM??{};
    return {
      connected:true,poweredOn,
      app:String(current.APP_ID)==="17"&&String(current.MESSAGE??"").startsWith(STREMIO_WEB)?"Stremio Web":"Vizio / other app"
    };
  }
}

module.exports={STREMIO_WEB,STREMIO_SIGNIN,STREMIO_SECTIONS,KEYMAP,privateIPv4,asciiText,stremioSearchUrl,normalizePin,requestTV,SmartCast,TrustOnPairAgent};
