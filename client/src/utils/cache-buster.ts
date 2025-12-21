/**
 * Cache Buster - Força recarga sem cache em desenvolvimento
 */

// Timestamp do build
const BUILD_TIME = Date.now();

// Adiciona timestamp às requisições
export function addCacheBuster(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${BUILD_TIME}`;
}

// Verifica se precisa fazer hard reload
// Nota: Em desenvolvimento, o Vite HMR já cuida das atualizações automaticamente
export function checkForUpdates() {
  // Desabilitado: O Vite HMR já faz isso melhor
  // Mantemos a função para compatibilidade mas não faz nada
}

// Força reload sem cache
export function forceReload() {
  window.location.reload();
}

// Limpa todo o cache do aplicativo
export async function clearAllCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
  
  // Limpa localStorage relacionado ao cache
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_') || key.startsWith('version_')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Cache limpo completamente!');
}

// Adiciona botão de debug no canto inferior direito (apenas dev)
export function addDebugPanel() {
  if (!import.meta.env.DEV) return;
  
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    background: #1a1a1a;
    color: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: monospace;
    font-size: 12px;
  `;
  
  panel.innerHTML = `
    <div style="margin-bottom: 8px; font-weight: bold;">🔧 Dev Tools</div>
    <button id="clear-cache-btn" style="
      width: 100%;
      padding: 6px 12px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 4px;
      font-weight: bold;
    ">🗑️ Limpar Cache</button>
    <button id="force-reload-btn" style="
      width: 100%;
      padding: 6px 12px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">🔄 Forçar Reload</button>
    <div style="margin-top: 8px; font-size: 10px; opacity: 0.7;">
      Build: ${new Date(BUILD_TIME).toLocaleTimeString()}
    </div>
  `;
  
  document.body.appendChild(panel);
  
  document.getElementById('clear-cache-btn')?.addEventListener('click', async () => {
    await clearAllCache();
    forceReload();
  });
  
  document.getElementById('force-reload-btn')?.addEventListener('click', () => {
    forceReload();
  });
}
