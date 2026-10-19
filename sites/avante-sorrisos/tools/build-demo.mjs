// Gera demo/index.html: uma única página com CSS e JS embutidos, faixa de demonstração e noindex.
// Uso: node sites/avante-sorrisos/tools/build-demo.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = join(base, 'site');
const demoFile = join(base, 'demo', 'index.html');

const [html, css, js] = await Promise.all(
  ['index.html', 'css/styles.css', 'js/main.js'].map((file) => readFile(join(siteDir, file), 'utf8')),
);

const demoCss = `
.demo-ribbon { position: fixed; left: 0; right: 0; bottom: 0; z-index: 100; padding: 0.55rem 1rem; background: #f5b301; color: #0b2540; font: 600 0.85rem/1.4 system-ui, sans-serif; text-align: center; }
.whatsapp-float { bottom: 3.4rem; }
`;

const replaceOnce = (source, search, replacement) => {
  if (source.split(search).length !== 2) throw new Error(`Trecho deve aparecer uma vez: ${search}`);
  return source.replace(search, () => replacement);
};

let demo = html;
demo = replaceOnce(demo, '</head>', '  <meta name="robots" content="noindex">\n</head>');
demo = replaceOnce(demo, '<link rel="stylesheet" href="css/styles.css">', `<style>\n${css}${demoCss}</style>`);
demo = replaceOnce(demo, '<script src="js/main.js"></script>', `<script>\n${js}</script>`);
demo = replaceOnce(
  demo,
  '<body>',
  '<body>\n  <div class="demo-ribbon" role="note">Demonstração de layout com conteúdo baseado em dados públicos do Google.</div>',
);

await mkdir(dirname(demoFile), { recursive: true });
await writeFile(demoFile, demo);
console.log(`Demonstração gerada: ${demoFile} (${demo.length} caracteres)`);
