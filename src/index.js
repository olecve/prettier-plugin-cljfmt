const cljfmt = require("../dist/cljfmt.js");

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
    parse: (text) => cljfmt.format(text, null),
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
