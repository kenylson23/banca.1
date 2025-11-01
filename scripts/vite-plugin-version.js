import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function versionPlugin() {
  let config;
  
  return {
    name: 'vite-plugin-version',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      if (config.command === 'build') {
        const buildTimestamp = Date.now();
        const buildVersion = `v${buildTimestamp}`;
        
        console.log(`\n🔧 Gerando versão do build: ${buildVersion}`);
        
        const swSourcePath = resolve(process.cwd(), 'client/public/sw.js');
        const swDestPath = resolve(process.cwd(), 'dist/public/sw.js');
        const versionFilePath = resolve(process.cwd(), 'dist/public/version.json');
        
        let swContent = readFileSync(swSourcePath, 'utf-8');
        
        swContent = swContent.replace(
          /const APP_VERSION = ['"][^'"]*['"]/,
          `const APP_VERSION = '${buildVersion}'`
        );
        swContent = swContent.replace(
          /const BUILD_TIME = \d+/,
          `const BUILD_TIME = ${buildTimestamp}`
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
        
        const distPublicDir = dirname(swDestPath);
        if (!existsSync(distPublicDir)) {
          mkdirSync(distPublicDir, { recursive: true });
        }
        
        writeFileSync(swDestPath, swContent);
        
        const versionInfo = {
          version: buildVersion,
          buildTime: buildTimestamp,
          buildDate: new Date(buildTimestamp).toISOString()
        };
        
        writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));
        
        console.log(`✅ Service Worker atualizado com versão ${buildVersion}`);
        console.log(`✅ Arquivo version.json criado em dist/public/version.json\n`);
      }
    }
  };
}
