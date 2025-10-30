import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const SW_PATH = resolve(process.cwd(), 'client/public/sw.js');
const VERSION_FILE = resolve(process.cwd(), 'dist/public/version.json');

const buildTimestamp = Date.now();
const buildVersion = `v${buildTimestamp}`;

console.log(`\n🔧 Gerando versão do build: ${buildVersion}`);

let swContent = readFileSync(SW_PATH, 'utf-8');

swContent = swContent.replace(
  /const CACHE_NAME = ['"]nabancada-v\d+['"]/,
  `const CACHE_NAME = 'nabancada-${buildVersion}'`
);
swContent = swContent.replace(
  /const DYNAMIC_CACHE = ['"]nabancada-dynamic-v\d+['"]/,
  `const DYNAMIC_CACHE = 'nabancada-dynamic-${buildVersion}'`
);
swContent = swContent.replace(
  /const API_CACHE = ['"]nabancada-api-v\d+['"]/,
  `const API_CACHE = 'nabancada-api-${buildVersion}'`
);

const versionMarker = `\nconst APP_VERSION = '${buildVersion}';\nconst BUILD_TIME = ${buildTimestamp};\n`;
if (!swContent.includes('const APP_VERSION')) {
  swContent = versionMarker + swContent;
} else {
  swContent = swContent.replace(
    /const APP_VERSION = ['"][^'"]+['"];/,
    `const APP_VERSION = '${buildVersion}';`
  );
  swContent = swContent.replace(
    /const BUILD_TIME = \d+;/,
    `const BUILD_TIME = ${buildTimestamp};`
  );
}

writeFileSync(SW_PATH, swContent);

const versionInfo = {
  version: buildVersion,
  buildTime: buildTimestamp,
  buildDate: new Date(buildTimestamp).toISOString()
};

writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));

console.log(`✅ Service Worker atualizado com versão ${buildVersion}`);
console.log(`✅ Arquivo version.json criado\n`);
