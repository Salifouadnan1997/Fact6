import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      yield* walk(p);
    } else {
      yield p;
    }
  }
}

function candidatesForImport(resolvedWithoutExt) {
  // resolvedWithoutExt is path.resolve(baseDir, importPath)
  // It may already include extension; we handle that in caller.
  const exts = [".ts", ".tsx", ".js", ".jsx"];
  const out = [];

  for (const ext of exts) out.push(resolvedWithoutExt + ext);
  for (const ext of exts) out.push(path.join(resolvedWithoutExt, "index" + ext));

  return out;
}

const importRegex = /from\s+['"](\.{1,2}\/[^'"]+)['"]/g;

const missing = [];

for (const file of walk(ROOT)) {
  if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
  const content = fs.readFileSync(file, "utf8");

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const spec = match[1]; // like ./x or ../y/z
    const baseDir = path.dirname(file);
    const resolved = path.resolve(baseDir, spec);

    // If import already has extension, just check exact file.
    if (path.extname(resolved)) {
      if (!fs.existsSync(resolved)) missing.push({ file, spec, expect: resolved });
      continue;
    }

    const cands = candidatesForImport(resolved);
    const ok = cands.some(p => fs.existsSync(p));
    if (!ok) missing.push({ file, spec, expect: cands[0] });
  }
}

missing.sort((a, b) => (a.file + a.spec).localeCompare(b.file + b.spec));

for (const m of missing.slice(0, 200)) {
  console.log(`MISSING: ${m.file} -> ${m.spec}`);
}

console.log(`\nTotal missing (top 200 shown): ${missing.length}`);
