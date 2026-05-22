const test = require("node:test");
const assert = require("node:assert/strict");
const prettier = require("prettier");
const plugin = require("../src/index.js");

const fmt = (source, opts = {}) =>
  prettier.format(source, { parser: "clojure", plugins: [plugin], ...opts });

const fmtPath = (source, filepath) =>
  prettier.format(source, { filepath, plugins: [plugin] });

test("inserts missing whitespace before opening bracket", async () => {
  assert.equal(await fmt("(defn foo[x] x)"), "(defn foo [x] x)\n");
});

test("indents body forms", async () => {
  const input = "(defn foo [x]\n(println x))";
  const expected = "(defn foo [x]\n  (println x))\n";
  assert.equal(await fmt(input), expected);
});

test("adds trailing newline when missing", async () => {
  assert.equal(await fmt("(+ 1 2)"), "(+ 1 2)\n");
});

test("collapses multiple trailing newlines to one", async () => {
  assert.equal(await fmt("(+ 1 2)\n\n\n"), "(+ 1 2)\n");
});

test("is idempotent", async () => {
  const input = "(defn foo[x](println x)\n(+ 1 2))";
  const once = await fmt(input);
  const twice = await fmt(once);
  assert.equal(twice, once);
});

test("dispatches via .clj filepath", async () => {
  assert.equal(await fmtPath("(defn foo[x] x)", "x.clj"), "(defn foo [x] x)\n");
});

test("dispatches via .cljs filepath", async () => {
  assert.equal(await fmtPath("(defn foo[x] x)", "x.cljs"), "(defn foo [x] x)\n");
});

test("dispatches via .cljc filepath", async () => {
  assert.equal(await fmtPath("(defn foo[x] x)", "x.cljc"), "(defn foo [x] x)\n");
});

test("dispatches via .edn filepath", async () => {
  assert.equal(await fmtPath("{:a 1}", "x.edn"), "{:a 1}\n");
});
