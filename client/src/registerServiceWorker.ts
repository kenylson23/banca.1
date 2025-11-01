let updateToast: any = null;
let currentVersion: string | null = null;

async function checkVersion() {
  try {
    const response = await fetch('/version.json', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      const versionData = await response.json();
      const serverVersion = versionData.version;
      
      if (currentVersion === null) {
        currentVersion = serverVersion;
        console.log('Versão inicial do app:', currentVersion);
      } else if (currentVersion !== serverVersion) {
        console.log('Nova versão detectada!', {
          antiga: currentVersion,
          nova: serverVersion
        });
        
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            try {
              await registration.update();
              
              if (registration.waiting) {
                currentVersion = serverVersion;
                showUpdateNotification(registration.waiting);
              } else if (registration.installing) {
                registration.installing.addEventListener('statechange', function onStateChange() {
                  if (this.state === 'installed') {
                    currentVersion = serverVersion;
                    this.removeEventListener('statechange', onStateChange);
                  }
                });
              }
            } catch (error) {
              console.log('Erro ao atualizar Service Worker, tentará novamente:', error);
            }
          }
        } else {
          currentVersion = serverVersion;
          window.location.reload();
        }
        
        return true;
      }
    }
  } catch (error) {
    console.log('Erro ao verificar versão:', error);
  }
  return false;
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nova versão do app disponível!');
              showUpdateNotification(newWorker);
            }
          });
        }
      });

      await checkVersion();

      setInterval(() => {
        checkVersion();
      }, 30000);

      setInterval(() => {
        registration.update().catch((err) => {
          console.log('Erro ao verificar atualização:', err);
        });
      }, 60000);

      console.log('Service Worker registrado com sucesso:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  } else {
    console.log('Service Worker não é suportado neste navegador');
  }
}

function showUpdateNotification(newWorker: ServiceWorker) {
  const event = new CustomEvent('app-update-available', {
    detail: { serviceWorker: newWorker }
  });
  window.dispatchEvent(event);
}

export function activateUpdate(serviceWorker: ServiceWorker) {
  serviceWorker.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

let deferredPrompt: any = null;

export function initPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA pode ser instalado');
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA foi instalado com sucesso');
    deferredPrompt = null;
  });
}

export async function showInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar o PWA`);
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
}

export function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}
