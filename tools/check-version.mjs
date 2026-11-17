#!/usr/bin/env node
/**
 * Release contract: one SemVer for MAITV web lab, Windows and Android.
 * Android versionCode monotonic ordering: major*1,000,000 +
 * minor*10,000 + patch*100 + prerelease rank (stable rank 99).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const base = JSON.parse(read("package.json"));
const pc = JSON.parse(read("desktop/package.json"));
const lock = JSON.parse(read("desktop/package-lock.json"));
const android = read("android/app/build.gradle.kts");
const match = android.match(/versionName\s*=\s*"([^"]+)"/);
const codeMatch = android.match(/versionCode\s*=\s*(\d+)/);
const version = base.version;

function fail(message) {
  console.error("MAITV VERSION CONTRACT FAILED: " + message);
  process.exitCode = 1;
}
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc)\.([1-9]\d*))?$/;
const parsed = semver.exec(version);
if (!parsed) {
  fail("Use strict MAJOR.MINOR.PATCH, optionally -alpha.N, -beta.N or -rc.N");
} else {
  const major = Number(parsed[1]), minor = Number(parsed[2]), patch = Number(parsed[3]);
  const stage = parsed[4], ordinal = parsed[5] ? Number(parsed[5]) : 0;
  if (minor > 99 || patch > 99) fail("MINOR and PATCH must not exceed 99 for Android code ordering.");
  const rank = !stage ? 99 : stage === "alpha" ? ordinal : stage === "beta" ? 24 + ordinal : 49 + ordinal;
  if ((stage === "alpha" || stage === "beta") && ordinal > 24 || stage === "rc" && ordinal > 49)
    fail("Prerelease ordinal exceeds Android versionCode allocation.");
  const expectedCode = major * 1000000 + minor * 10000 + patch * 100 + rank;
  if (!Number.isSafeInteger(expectedCode) || expectedCode > 2100000000)
    fail("Android versionCode exceeds Google Play's limit.");
  if (Number(codeMatch?.[1]) !== expectedCode)
    fail("Android versionCode must be " + expectedCode + " for " + version);
  if (process.env.GITHUB_REF_TYPE === "tag" && process.env.GITHUB_REF_NAME !== "v" + version)
    fail("Git tag " + process.env.GITHUB_REF_NAME + " does not match v" + version);
  if (!stage && process.env.GITHUB_REF_TYPE === "tag") {
    const acceptance = JSON.parse(read("docs/release-acceptance.json"));
    for (const platform of ["web", "windows", "android"]) {
      if (acceptance.hardware[platform]?.passed !== true ||
          !acceptance.hardware[platform].date ||
          !acceptance.hardware[platform].evidence)
        fail("Stable release requires physical-device acceptance evidence for " + platform);
    }
  }
}
for (const [name, found] of [
  ["Windows desktop", pc.version],
  ["Desktop lock", lock.version],
  ["Desktop lock root", lock.packages?.[""]?.version],
  ["Android", match?.[1]]
]) {
  if (found !== version) fail(name + " version differs from web (" + version + "): " + found);
}
const changeLog = read("CHANGELOG.md");
if (!changeLog.includes("[" + version + "]")) fail("CHANGELOG.md needs an entry for " + version);
if (!process.exitCode) console.log("MAITV version contract OK: web, desktop and Android = " + version);
