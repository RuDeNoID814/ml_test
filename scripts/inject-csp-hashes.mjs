// Next.js (даже в статическом экспорте) сам добавляет в HTML несколько
// собственных инлайн-скриптов (внутренний механизм гидратации) — это не наш
// код, но строгий CSP (script-src 'self') заблокирует и их тоже.
//
// Для статики nonce не подходит (nonce должен быть новым на каждый запрос,
// а у статического сайта нет "запроса" на сервере — файлы просто лежат).
// Поэтому используем hash-подход: после каждой сборки читаем реальные
// инлайн-скрипты из готового out/*.html и вписываем их контрольные суммы
// (sha256) в CSP — так браузер доверяет именно этому конкретному содержимому,
// а не "всему инлайн-коду вообще".
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const OUT_DIR = 'out';
const HEADERS_FILE = join(OUT_DIR, '_headers');
const SCRIPT_TAG_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

function findHtmlFiles(dir) {
  let results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results = results.concat(findHtmlFiles(full));
    else if (extname(entry) === '.html') results.push(full);
  }
  return results;
}

const htmlFiles = findHtmlFiles(OUT_DIR);
const hashes = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(SCRIPT_TAG_RE)) {
    const content = match[1];
    if (!content.trim()) continue;
    const hash = createHash('sha256').update(content, 'utf8').digest('base64');
    hashes.add(`'sha256-${hash}'`);
  }
}

if (hashes.size === 0) {
  console.warn('inject-csp-hashes: инлайн-скриптов не найдено — CSP не менялся.');
  process.exit(0);
}

const headersContent = readFileSync(HEADERS_FILE, 'utf8');
const hashList = [...hashes].join(' ');
const updated = headersContent.replace(
  /script-src 'self'/,
  `script-src 'self' ${hashList}`,
);

if (updated === headersContent) {
  throw new Error(
    `inject-csp-hashes: не нашёл "script-src 'self'" в ${HEADERS_FILE} — проверь формат файла.`,
  );
}

writeFileSync(HEADERS_FILE, updated);
console.log(`inject-csp-hashes: добавлено ${hashes.size} хэшей инлайн-скриптов в ${HEADERS_FILE}`);
