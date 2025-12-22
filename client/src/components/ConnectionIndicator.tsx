/**
 * Connection Indicator - Shows online/offline status
 * 
 * Visual feedback for users about connection status and pending sync operations.
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { syncEngine } from '@/lib/sync-engine';
import { offlineDB } from '@/lib/offline-db';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOps, setPendingOps] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to sync events
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncComplete = () => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
      updatePendingOps();
    };
    const handleSyncError = () => setIsSyncing(false);

    syncEngine.on('sync_start', handleSyncStart);
    syncEngine.on('sync_complete', handleSyncComplete);
    syncEngine.on('sync_error', handleSyncError);
    syncEngine.on('online', handleOnline);
    syncEngine.on('offline', handleOffline);

    // Update pending operations count
    const updatePendingOps = async () => {
      const stats = await offlineDB.getSyncStats();
      setPendingOps(stats.pending);
      if (stats.lastSync) {
        const date = new Date(stats.lastSync);
        setLastSync(date.toLocaleTimeString('pt-BR'));
      }
    };

    updatePendingOps();
    const interval = setInterval(updatePendingOps, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncEngine.off('sync_start', handleSyncStart);
      syncEngine.off('sync_complete', handleSyncComplete);
      syncEngine.off('sync_error', handleSyncError);
      syncEngine.off('online', handleOnline);
      syncEngine.off('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleForceSync = async () => {
    if (!isSyncing && isOnline) {
      await syncEngine.forceSyncNow();
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (isSyncing) return 'bg-yellow-500';
    if (pendingOps > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Sincronizando...';
    if (pendingOps > 0) return `${pendingOps} pendente${pendingOps > 1 ? 's' : ''}`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (pendingOps > 0) return <AlertCircle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`fixed top-4 right-4 z-50 ${getStatusColor()} text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl`}
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium hidden sm:inline">
                {getStatusText()}
              </span>
            </div>

            {showDetails && (
              <div className="mt-2 pt-2 border-t border-white/20 text-xs space-y-1">
                {lastSync && (
                  <div>Última sync: {lastSync}</div>
                )}
                {isOnline && !isSyncing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleForceSync();
                    }}
                    className="w-full mt-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sincronizar Agora
                  </Button>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs space-y-1">
            <div className="font-semibold">
              {isOnline ? '✅ Conectado' : '🔴 Sem conexão'}
            </div>
            {pendingOps > 0 && (
              <div>
                {pendingOps} operação{pendingOps > 1 ? 'ões' : ''} aguardando sincronização
              </div>
            )}
            {lastSync && (
              <div className="text-muted-foreground">
                Última sync: {lastSync}
              </div>
            )}
            {!isOnline && (
              <div className="text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠️ Modo offline ativo. Dados serão sincronizados quando a conexão for restaurada.
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact version for mobile/small screens
 */
export function ConnectionIndicatorCompact() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOps, setPendingOps] = useState(0);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const updatePendingOps = async () => {
      const stats = await offlineDB.getSyncStats();
      setPendingOps(stats.pending);
    };

    updatePendingOps();
    const interval = setInterval(updatePendingOps, 10000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingOps === 0) {
    return null; // Don't show when everything is OK
  }

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${
      isOnline ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
    }`}>
      {isOnline ? <AlertCircle className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      <span className="text-xs">
        {isOnline ? `${pendingOps} pendente${pendingOps > 1 ? 's' : ''}` : 'Offline'}
      </span>
    </div>
  );
}
