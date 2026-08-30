import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const supportedBumpTypes = new Set(["major", "minor", "patch"]);
const versionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/;

const rootDir = resolve(import.meta.dirname, "..");
const packagePaths = [
  resolve(rootDir, "package.json"),
  resolve(rootDir, "client", "package.json"),
  resolve(rootDir, "server", "package.json"),
].filter((path) => existsSync(path));

function parseVersion(version) {
  const match = versionPattern.exec(version);

  if (!match) {
    throw new Error(`Invalid project version: ${version}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function incrementVersion(version, bumpType) {
  const [major, minor, patch] = parseVersion(version);

  if (bumpType === "major") return `${major + 1}.0.0`;
  if (bumpType === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function detectBumpType(commitMessage) {
  if (/\[(?:skip[ -]version|no[ -]bump)\]/i.test(commitMessage)) return null;

  const subject = commitMessage.split(/\r?\n/, 1)[0];
  if (/^[a-z]+(?:\([a-z0-9-]+\))?!:/.test(subject)) return "major";
  if (/^BREAKING[ -]CHANGE:/m.test(commitMessage)) return "major";

  const type = /^([a-z]+)(?:\([a-z0-9-]+\))?:/.exec(subject)?.[1];
  if (type === "feat") return "minor";
  if (["fix", "perf", "revert"].includes(type)) return "patch";
  return null;
}

async function readPackageJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writePackageJson(filePath, data) {
  const temporaryPath = `${filePath}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`);
    await rename(temporaryPath, filePath);
  } finally {
    await unlink(temporaryPath).catch(() => {});
  }
}

async function checkVersions() {
  const rootPackage = await readPackageJson(packagePaths[0]);
  const rootVersion = rootPackage.version;
  parseVersion(rootVersion);

  for (const filePath of packagePaths.slice(1)) {
    const pkg = await readPackageJson(filePath);
    if (pkg.version !== rootVersion) {
      console.warn(
        `⚠️  Version mismatch in ${filePath}: expected ${rootVersion}, found ${pkg.version}`,
      );
    }
  }

  console.log(`Project version is valid: ${rootVersion}`);
}

async function updateVersions(bumpType) {
  const rootPackage = await readPackageJson(packagePaths[0]);
  const currentVersion = rootPackage.version;
  const nextVersion = incrementVersion(currentVersion, bumpType);

  for (const filePath of packagePaths) {
    const pkg = await readPackageJson(filePath);
    pkg.version = nextVersion;
    await writePackageJson(filePath, pkg);
  }

  console.log(`Project version: ${currentVersion} → ${nextVersion}`);
}

async function main() {
  const command = process.argv[2] ?? "patch";

  if (command === "check") {
    await checkVersions();
    return;
  }

  if (command === "detect") {
    const commitMessagePath = process.argv[3];
    if (!commitMessagePath) {
      throw new Error(
        "A commit message file is required for version detection",
      );
    }

    const commitMessage = await readFile(commitMessagePath, "utf8");
    console.log(detectBumpType(commitMessage) ?? "none");
    return;
  }

  if (!supportedBumpTypes.has(command)) {
    throw new Error(
      "Usage: pnpm version:increment [major|minor|patch] or pnpm version:check",
    );
  }

  await updateVersions(command);
}

await main();
