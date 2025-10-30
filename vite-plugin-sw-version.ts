import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';

export function swVersionPlugin(): Plugin {
  let buildVersion: string;
  let buildTimestamp: number;

  return {
    name: 'sw-version-plugin',
    apply: 'build',
    
    buildStart() {
      buildTimestamp = Date.now();
      buildVersion = `v${buildTimestamp}`;
      
      console.log(`\n🔧 Gerando versão do build: ${buildVersion}`);
      
      const SW_PATH = resolve(process.cwd(), 'client/public/sw.js');
      let swContent = readFileSync(SW_PATH, 'utf-8');

      swContent = swContent.replace(
        /const CACHE_NAME = ['"]nabancada-[^'"]+['"]/,
        `const CACHE_NAME = 'nabancada-${buildVersion}'`
      );
      swContent = swContent.replace(
        /const DYNAMIC_CACHE = ['"]nabancada-dynamic-[^'"]+['"]/,
        `const DYNAMIC_CACHE = 'nabancada-dynamic-${buildVersion}'`
      );
      swContent = swContent.replace(
        /const API_CACHE = ['"]nabancada-api-[^'"]+['"]/,
        `const API_CACHE = 'nabancada-api-${buildVersion}'`
      );

      const versionMarker = `const APP_VERSION = '${buildVersion}';\nconst BUILD_TIME = ${buildTimestamp};\n\n`;
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
      console.log(`✅ Service Worker atualizado com versão ${buildVersion}\n`);
    },

    closeBundle() {
      const VERSION_FILE = resolve(process.cwd(), 'dist/public/version.json');
      const versionInfo = {
        version: buildVersion,
        buildTime: buildTimestamp,
        buildDate: new Date(buildTimestamp).toISOString()
      };

      try {
        mkdirSync(resolve(process.cwd(), 'dist/public'), { recursive: true });
        writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));
        console.log(`✅ Arquivo version.json criado com versão ${buildVersion}\n`);
      } catch (error) {
        console.error('Erro ao criar version.json:', error);
      }
    }
  };
}
