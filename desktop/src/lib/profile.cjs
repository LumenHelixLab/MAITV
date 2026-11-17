"use strict";
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const {privateIPv4} = require("./smartcast.cjs");

/**
 * All sensitive values are protected with Electron safeStorage on Windows.
 * The renderer receives only {host, paired}, never AUTH or decrypt methods.
 */
function createProfileStore(directory, encryption) {
  const file = path.join(directory, "profile.json");
  async function read() {
    try {
      const obj = JSON.parse(await fs.readFile(file, "utf8"));
      if (typeof obj?.deviceId !== "string" || !/^[0-9a-f-]{36}$/.test(obj.deviceId)) return null;
      return obj;
    } catch (err) {
      if (err.code === "ENOENT") return null;
      throw new Error("Saved MAITV settings could not be read.");
    }
  }
  async function write(obj) {
    await fs.mkdir(directory, {recursive:true,mode:0o700});
    const temp = file + ".tmp";
    await fs.writeFile(temp, JSON.stringify(obj, null, 2), {encoding:"utf8",mode:0o600});
    await fs.rename(temp, file);
  }
  async function ensureDeviceId() {
    let obj = await read();
    if (obj?.deviceId) return obj.deviceId;
    const deviceId = crypto.randomUUID();
    await write({deviceId});
    return deviceId;
  }
  async function savePair({host,fingerprint,token}) {
    if (!privateIPv4(host) || !/^[a-f0-9]{64}$/.test(fingerprint) || typeof token!=="string" || token.length<4)
      throw new Error("Invalid TV pairing data.");
    if (!encryption.isEncryptionAvailable()) throw new Error("Windows secure credential storage is unavailable.");
    const old = await read();
    const deviceId = old?.deviceId ?? crypto.randomUUID();
    const encrypted = encryption.encryptString(token).toString("base64");
    await write({deviceId,host,fingerprint,credential:encrypted});
  }
  async function paired() {
    const obj = await read();
    if (!obj?.host || !obj?.fingerprint || !obj?.credential) return null;
    if (!privateIPv4(obj.host) || !/^[a-f0-9]{64}$/.test(obj.fingerprint)) throw new Error("Saved device settings need repair.");
    if (!encryption.isEncryptionAvailable()) throw new Error("Windows secure credential storage is unavailable.");
    try {
      return {host:obj.host,fingerprint:obj.fingerprint,
        token:encryption.decryptString(Buffer.from(obj.credential,"base64"))};
    } catch {throw new Error("Windows could not unlock saved pairing. Re-pair this television.");}
  }
  async function publicState() {
    const obj=await read();
    return {host:obj?.host||"",paired:Boolean(obj?.credential)};
  }
  async function forget() {
    const id=(await read())?.deviceId??crypto.randomUUID();
    await write({deviceId:id});
  }
  return {read,ensureDeviceId,savePair,paired,publicState,forget};
}
module.exports={createProfileStore};
