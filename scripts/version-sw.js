import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';

const SW_SOURCE_PATH = resolve(process.cwd(), 'client/public/sw.js');
const SW_DEST_PATH = resolve(process.cwd(), 'dist/public/sw.js');
const VERSION_FILE = resolve(process.cwd(), 'dist/public/version.json');

const buildTimestamp = Date.now();
const buildVersion = `v${buildTimestamp}`;

console.log(`\n🔧 Gerando versão do build: ${buildVersion}`);

const distPublicDir = dirname(SW_DEST_PATH);
if (!existsSync(distPublicDir)) {
  mkdirSync(distPublicDir, { recursive: true });
}

let swContent = readFileSync(SW_SOURCE_PATH, 'utf-8');

swContent = swContent.replace(
  /const APP_VERSION = ['"][^'"]*['"]/,
  `const APP_VERSION = '${buildVersion}'`
);
swContent = swContent.replace(
  /const BUILD_TIME = .*?;/,
  `const BUILD_TIME = ${buildTimestamp};`
);
swContent = swContent.replace(
  /const CACHE_NAME = ['"]nabancada-[^'"]*['"]/,
  `const CACHE_NAME = 'nabancada-${buildVersion}'`
);
swContent = swContent.replace(
  /const DYNAMIC_CACHE = ['"]nabancada-dynamic-[^'"]*['"]/,
  `const DYNAMIC_CACHE = 'nabancada-dynamic-${buildVersion}'`
);
swContent = swContent.replace(
  /const API_CACHE = ['"]nabancada-api-[^'"]*['"]/,
  `const API_CACHE = 'nabancada-api-${buildVersion}'`
);

writeFileSync(SW_DEST_PATH, swContent);

const versionInfo = {
  version: buildVersion,
  buildTime: buildTimestamp,
  buildDate: new Date(buildTimestamp).toISOString()
};

writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));

console.log(`✅ Service Worker copiado para dist/public/sw.js com versão ${buildVersion}`);
console.log(`✅ Arquivo version.json criado em dist/public/version.json\n`);
