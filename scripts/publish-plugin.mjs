// Publishes this repo as a Claude Code plugin into a marketplace repo: copies every tracked file
// to <marketplace>/plugins/<name>/ (replacing what is there), and adds or updates the plugin's
// entry in <marketplace>/.claude-plugin/marketplace.json. Name, version and description come
// from .claude-plugin/plugin.json; a version the marketplace already has is refused, because
// Claude Code only fetches a plugin again when its version changes. Commit the result in the
// marketplace repo.
//
// Usage: node scripts/publish-plugin.mjs <marketplace repo folder>
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const JSON_INDENT = 2;

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

function marketplaceFile(folder) {
  if (!folder) fail('Usage: node scripts/publish-plugin.mjs <marketplace repo folder>');
  const file = join(resolve(folder), '.claude-plugin', 'marketplace.json');
  if (!existsSync(file)) fail(`No marketplace at ${folder}: ${file} doesn't exist.`);
  return file;
}

function copyPlugin(target) {
  rmSync(target, { recursive: true, force: true });
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  for (const file of files) {
    mkdirSync(dirname(join(target, file)), { recursive: true });
    cpSync(file, join(target, file));
  }
  return files.length;
}

function setEntry(file, plugin) {
  const marketplace = readJson(file);
  const entry = { name: plugin.name, source: `./plugins/${plugin.name}`, description: plugin.description, version: plugin.version };
  const plugins = marketplace.plugins ?? [];
  const updated = plugins.some((existing) => existing.name === plugin.name)
    ? plugins.map((existing) => (existing.name === plugin.name ? entry : existing))
    : [...plugins, entry];
  writeFileSync(file, `${JSON.stringify({ ...marketplace, plugins: updated }, null, JSON_INDENT)}\n`);
}

const file = marketplaceFile(process.argv[2]);
process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const plugin = readJson('.claude-plugin/plugin.json');
const published = (readJson(file).plugins ?? []).find((existing) => existing.name === plugin.name);
if (published?.version === plugin.version) {
  fail(`${plugin.name} ${plugin.version} is already in the marketplace: raise "version" in .claude-plugin/plugin.json.`);
}

const count = copyPlugin(join(dirname(dirname(file)), 'plugins', plugin.name));
setEntry(file, plugin);
console.log(`Published ${plugin.name} ${plugin.version} (${count} files). Commit it in the marketplace repo.`);
