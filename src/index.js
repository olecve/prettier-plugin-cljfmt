const fs = require("node:fs");
const path = require("node:path");
const cljfmt = require("../dist/cljfmt.js");

const configByDir = new Map();

function findConfig(startDir) {
  const visited = [];
  let dir = startDir;
  while (true) {
    if (configByDir.has(dir)) {
      const result = configByDir.get(dir);
      for (const v of visited) configByDir.set(v, result);
      return result;
    }
    const candidate = path.join(dir, ".cljfmt.edn");
    if (fs.existsSync(candidate)) {
      const content = fs.readFileSync(candidate, "utf8");
      try {
        cljfmt.parseConfig(content);
      } catch (err) {
        throw new Error(
          `Invalid .cljfmt.edn at ${candidate}: ${err.message}`,
        );
      }
      configByDir.set(dir, content);
      for (const v of visited) configByDir.set(v, content);
      return content;
    }
    visited.push(dir);
    const parent = path.dirname(dir);
    if (parent === dir) {
      configByDir.set(dir, null);
      for (const v of visited) configByDir.set(v, null);
      return null;
    }
    dir = parent;
  }
}

const languages = [
  {
    name: "Clojure",
    parsers: ["clojure"],
    extensions: [".clj", ".cljs", ".cljc", ".edn"],
    vscodeLanguageIds: ["clojure", "clojurescript"],
    aliases: ["ClojureScript", "cljc", "EDN"],
  },
];

const parsers = {
  clojure: {
    parse: (text, options) => {
      const filepath = options && options.filepath;
      const config = filepath
        ? findConfig(path.dirname(path.resolve(filepath)))
        : null;
      return cljfmt.formatWithConfig(text, config);
    },
    astFormat: "clojure-source",
    locStart: () => 0,
    locEnd: () => 0,
  },
};

const printers = {
  "clojure-source": {
    print: (path) => path.node.replace(/\n*$/, "\n"),
  },
};

module.exports = { languages, parsers, printers };
