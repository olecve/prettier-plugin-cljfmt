# prettier-plugin-cljfmt

A [Prettier](https://prettier.io/) plugin that formats Clojure (`.clj`), ClojureScript (`.cljs`), cljc (`.cljc`), and EDN (`.edn`) files.

Powered by [cljfmt](https://github.com/weavejester/cljfmt) compiled to JavaScript via [shadow-cljs](https://github.com/thheller/shadow-cljs). No JVM or Clojure toolchain required at install time.

## Install

```bash
npm install --save-dev prettier-plugin-cljfmt
```

## Usage

```bash
npx prettier --plugin prettier-plugin-cljfmt --write "src/**/*.{clj,cljs,cljc,edn}"
```

Or in `.prettierrc.json`:

```json
{ "plugins": ["prettier-plugin-cljfmt"] }
```

## Configuration

If a `.cljfmt.edn` file exists in the file's directory or any ancestor, it is picked up automatically. Otherwise, cljfmt defaults are used.

## Limitations

- Prettier's `printWidth`, `tabWidth`, and `useTabs` are ignored — cljfmt has its own rules.
- cljfmt does not reflow expressions across lines.

## Development

```bash
npm install
npm run build    # compiles cljfmt to dist/cljfmt.js (needs Java)
npm test
```

## License

MIT
