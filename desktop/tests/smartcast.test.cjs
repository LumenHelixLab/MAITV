"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {SmartCast,privateIPv4,asciiText,stremioSearchUrl,normalizePin,KEYMAP,STREMIO_WEB,requestTV}=require("../src/lib/smartcast.cjs");

test("reject non-private or malformed TV addresses",()=>{
  for(const ip of ["192.168.1.67","10.2.8.13","172.16.5.10","172.31.2.91"])assert.equal(privateIPv4(ip),true,ip);
  for(const ip of ["127.0.0.1","0.0.0.0","8.8.8.8","172.15.2.9","172.32.1.2",
    "192.168.1.0","192.168.1.255","192.168.1.256","evil.com","192.168.1.2:7345","","[::1]"])assert.equal(privateIPv4(ip),false,ip);
});
test("ASCII sender rejects unsupported and oversized input",()=>{
  assert.equal(asciiText("Hello 12:34"),true);
  assert.equal(asciiText(""),false);
  assert.equal(asciiText("café"),false);
  assert.equal(asciiText("a\nb"),false);
  assert.equal(asciiText("X".repeat(60)),true);
  assert.equal(asciiText("X".repeat(61)),false);
});
test("TV PIN only accepts exactly 4 digits",()=>{
  assert.equal(normalizePin("0042"),"0042");
  for(const v of ["abc4","123","12345"," 1234","1234 ",1234])assert.throws(()=>normalizePin(v));
});
test("official Stremio search route encodes the entire query and never accepts arbitrary origins",async()=>{
  assert.equal(stremioSearchUrl("The Matrix"),"https://web.stremio.com/#/search?search=The%20Matrix");
  assert.equal(stremioSearchUrl("TV & Film"),"https://web.stremio.com/#/search?search=TV%20%26%20Film");
  assert.equal(stremioSearchUrl(" café ").startsWith(STREMIO_WEB+"#/search?search="),true);
  assert.throws(()=>stremioSearchUrl(" "));
  assert.throws(()=>stremioSearchUrl("x".repeat(81)));
  assert.throws(()=>stremioSearchUrl("x\ny"));
  const calls=[];
  const client=new SmartCast(async req=>{calls.push(req);return {data:{}};});
  await client.launchSearch("192.168.1.67","bearer","f".repeat(64),"A / B");
  assert.equal(calls[0].body.VALUE.MESSAGE,"https://web.stremio.com/#/search?search=A%20%2F%20B");
});
test("fixed remote mapping and limited launch URL",async()=>{
  const calls=[];
  const client=new SmartCast(async req=>{calls.push(req);return {data:{STATUS:{RESULT:"SUCCESS"}},fingerprint:"f".repeat(64)};});
  await client.sendKey("192.168.1.67","bearer","f".repeat(64),"UP");
  assert.deepEqual(calls[0].body.KEYLIST,[{CODESET:3,CODE:8,ACTION:"KEYPRESS"}]);
  assert.equal(KEYMAP.MENU[0],4);
  assert.equal(KEYMAP.MENU[1],8);
  await client.launchStremio("192.168.1.67","bearer","f".repeat(64));
  assert.equal(calls[1].body.VALUE.MESSAGE,STREMIO_WEB);
  assert.equal(calls[1].body.VALUE.APP_ID,"17");
  await assert.rejects(()=>client.sendKey("192.168.1.67","bearer","f".repeat(64),"FORMAT_TV"));
});
test("pairing challenge and token only travel through private transport",async()=>{
  const calls=[];
  const client=new SmartCast(async req=>{
    calls.push(req);
    if(req.path==="/pairing/start")return {fingerprint:"a".repeat(64),data:{ITEM:{PAIRING_REQ_TOKEN:876,CHALLENGE_TYPE:1}}};
    if(req.path==="/pairing/pair")return {fingerprint:"a".repeat(64),data:{ITEM:{AUTH_TOKEN:"local-only-token"}}};
    throw new Error("unanticipated endpoint");
  });
  const challenge=await client.startPair("192.168.1.67","maitv-device");
  assert.deepEqual(challenge,{host:"192.168.1.67",fingerprint:"a".repeat(64),requestToken:876,type:1});
  const credential=await client.finishPair(challenge,"maitv-device","1234");
  assert.equal(credential,"local-only-token");
  assert.equal(calls[1].fingerprint,"a".repeat(64));
  assert.equal(calls[1].body.RESPONSE_VALUE,"1234");
});
test("text commands are sanitized and sent using fixed ASCII code set",async()=>{
  let seen;
  const client=new SmartCast(async x=>{seen=x;return {data:{}};});
  await client.sendText("192.168.1.67","bearer","b".repeat(64),"A b");
  assert.deepEqual(seen.body.KEYLIST,[
    {CODESET:0,CODE:65,ACTION:"KEYPRESS"},
    {CODESET:0,CODE:32,ACTION:"KEYPRESS"},
    {CODESET:0,CODE:98,ACTION:"KEYPRESS"}
  ]);
  await assert.rejects(()=>client.sendText("192.168.1.67","bearer","b".repeat(64),"x\n"));
});
test("actual transport never accepts public TV endpoint",async()=>{
  await assert.rejects(()=>requestTV({host:"1.1.1.1",path:"/app/launch",method:"PUT"}),/private/);
  await assert.rejects(()=>requestTV({host:"192.168.1.67",path:"/install",method:"PUT"}),/Unsupported/);
  await assert.rejects(()=>requestTV({host:"192.168.1.67",path:"/key_command/",method:"PUT",body:{}}),/Pair/);
  await assert.rejects(()=>requestTV({host:"192.168.1.67",path:"/app/launch",method:"PUT",token:"test",fingerprint:"incorrect"}),/pin/);
});
