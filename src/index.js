const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const cljfmt = require("../dist/cljfmt.js");
const packageJson = require("../package.json");

const configByDir = new Map();

function hashNearestCljfmtEdn(startDir) {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, ".cljfmt.edn");
    if (fs.existsSync(candidate)) {
      return crypto
        .createHash("sha1")
        .update(fs.readFileSync(candidate))
        .digest("hex")
        .slice(0, 16);
    }
    const parent = path.dirname(dir);
    if (parent === dir) return "none";
    dir = parent;
  }
}

// TODO(prettier#17808): .cljfmt.edn is not tracked by Prettier's cache
// (--cache hashes only file content + Prettier options + plugin identity).
// We bake a content hash of the nearest .cljfmt.edn into the plugin's
// meta.version so once Prettier supports plugin-meta-based cache keys,
// config edits will invalidate the cache automatically. Until that ships,
// README documents the manual cache-wipe workaround.
const meta = {
  name: packageJson.name,
  version: `${packageJson.version}+${hashNearestCljfmtEdn(process.cwd())}`,
};

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
        throw new Error(`Invalid .cljfmt.edn at ${candidate}: ${err.message}`);
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

module.exports = { meta, languages, parsers, printers };
