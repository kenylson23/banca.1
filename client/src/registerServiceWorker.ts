let updateToast: any = null;

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
