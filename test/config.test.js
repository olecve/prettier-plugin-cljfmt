const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const prettier = require("prettier");
const plugin = require("../src/index.js");

const mktmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "prettier-clj-"));

const fmtPath = (source, filepath) =>
  prettier.format(source, { filepath, plugins: [plugin] });

test("applies .cljfmt.edn from the same directory as the file", async () => {
  const dir = mktmp();
  fs.writeFileSync(
    path.join(dir, ".cljfmt.edn"),
    "{:remove-multiple-non-indenting-spaces? true}",
  );
  const filepath = path.join(dir, "a.clj");
  assert.equal(await fmtPath("(println    x)", filepath), "(println x)\n");
});

test("applies .cljfmt.edn from a parent directory", async () => {
  const root = mktmp();
  const nested = path.join(root, "src", "deep");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(
    path.join(root, ".cljfmt.edn"),
    "{:sort-ns-references? true}",
  );
  const filepath = path.join(nested, "ns.clj");
  const input = "(ns foo (:require [z.b] [a.a]))";
  const expected = "(ns foo (:require [a.a] [z.b]))\n";
  assert.equal(await fmtPath(input, filepath), expected);
});

test("falls back to cljfmt defaults when no .cljfmt.edn exists", async () => {
  const dir = mktmp();
  const filepath = path.join(dir, "a.clj");
  assert.equal(await fmtPath("(println    x)", filepath), "(println    x)\n");
});

test("applies custom :indents rule from .cljfmt.edn", async () => {
  const dir = mktmp();
  fs.writeFileSync(
    path.join(dir, ".cljfmt.edn"),
    "{:indents {my-when [[:block 1]]}}",
  );
  const filepath = path.join(dir, "a.clj");
  const input = "(my-when foo\nbar)";
  const expected = "(my-when foo\n  bar)\n";
  assert.equal(await fmtPath(input, filepath), expected);
});

test("throws with file path when .cljfmt.edn has invalid EDN", async () => {
  const dir = mktmp();
  const configPath = path.join(dir, ".cljfmt.edn");
  fs.writeFileSync(configPath, "{:indents");
  const filepath = path.join(dir, "a.clj");
  await assert.rejects(fmtPath("(+ 1 2)", filepath), (err) => {
    assert.match(err.message, /Invalid \.cljfmt\.edn/);
    assert.ok(err.message.includes(configPath));
    return true;
  });
});

test("throws with file path when .cljfmt.edn is not a map", async () => {
  const dir = mktmp();
  const configPath = path.join(dir, ".cljfmt.edn");
  fs.writeFileSync(configPath, "[:not :a :map]");
  const filepath = path.join(dir, "a.clj");
  await assert.rejects(fmtPath("(+ 1 2)", filepath), (err) => {
    assert.match(err.message, /Invalid \.cljfmt\.edn/);
    assert.match(err.message, /top-level map/);
    return true;
  });
});

test("treats whitespace-only .cljfmt.edn as no config", async () => {
  const dir = mktmp();
  fs.writeFileSync(path.join(dir, ".cljfmt.edn"), "  \n  ");
  const filepath = path.join(dir, "a.clj");
  assert.equal(await fmtPath("(println    x)", filepath), "(println    x)\n");
});

test("e2e: prettier CLI --write respects .cljfmt.edn", () => {
  const dir = mktmp();
  fs.writeFileSync(
    path.join(dir, ".cljfmt.edn"),
    "{:remove-multiple-non-indenting-spaces? true}",
  );
  const filepath = path.join(dir, "fixture.clj");
  fs.writeFileSync(filepath, "(println    x)\n");
  const prettierBin = require.resolve("prettier/bin/prettier.cjs");
  const pluginPath = path.resolve(__dirname, "..", "src", "index.js");
  execFileSync("node", [
    prettierBin,
    "--plugin",
    pluginPath,
    "--write",
    filepath,
  ]);
  assert.equal(fs.readFileSync(filepath, "utf8"), "(println x)\n");
});
