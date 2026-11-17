"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs/promises");
const os=require("node:os");
const path=require("node:path");
const {createProfileStore}=require("../src/lib/profile.cjs");
test("encrypted credential never persisted in plaintext",async()=>{
  const folder=await fs.mkdtemp(path.join(os.tmpdir(),"maitv-desktop-vault-"));
  const crypt={
    isEncryptionAvailable:()=>true,
    encryptString:value=>Buffer.from("cipher:"+value.split("").reverse().join(""),"utf8"),
    decryptString:value=>{
      const raw=value.toString("utf8");if(!raw.startsWith("cipher:"))throw Error("bad cipher");
      return raw.slice(7).split("").reverse().join("");
    }
  };
  const s=createProfileStore(folder,crypt);
  try{
    const id=await s.ensureDeviceId();assert.ok(id.length>30);
    await s.savePair({host:"192.168.1.67",fingerprint:"a".repeat(64),token:"supersecretTVtoken"});
    const txt=await fs.readFile(path.join(folder,"profile.json"),"utf8");
    assert.ok(!txt.includes("supersecretTVtoken"));
    const cred=await s.paired();
    assert.equal(cred.host,"192.168.1.67");
    assert.equal(cred.token,"supersecretTVtoken");
    assert.equal((await s.publicState()).paired,true);
    await s.forget();
    assert.equal(await s.paired(),null);
    assert.equal((await s.publicState()).paired,false);
    assert.equal((await s.ensureDeviceId()),id);
  }finally{await fs.rm(folder,{recursive:true,force:true});}
});
