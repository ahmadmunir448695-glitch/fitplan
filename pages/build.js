// Builds the static GitHub Pages site into docs/: the app from public/, plus the plan code bundled for the browser.
// Run: npm run build:pages (after npm run build:css if you changed styles).
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const root = path.join(__dirname, "..");
const out = path.join(root, "docs");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, "public"), out, { recursive: true });
esbuild.buildSync({ entryPoints: [path.join(__dirname, "api-browser.js")], bundle: true, minify: true, format: "iife", platform: "browser", outfile: path.join(out, "api-browser.js") });
const indexPath = path.join(out, "index.html");
const html = fs.readFileSync(indexPath, "utf8");
if (!html.includes('<script src="moves.js"></script>')) throw new Error("index.html changed: can't find the moves.js script tag");
fs.writeFileSync(indexPath, html.replace('<script src="moves.js"></script>', '<script src="api-browser.js"></script>\n  <script src="moves.js"></script>'));
fs.writeFileSync(path.join(out, ".nojekyll"), ""); // serve files as-is
console.log("Built docs/ for GitHub Pages");
