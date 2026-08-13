import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

/**
 * Hook para gerenciar guest token - suporta TODOS os planos
 * 
 * Funcionalidade:
 * - Plano Básico: Usa token para identificar convidados anônimos
 * - Plano Profissional+: Usa customerId + token como backup
 * 
 * O token é armazenado no localStorage por mesa e persiste entre reloads
 */
export function useGuestToken(tableId: string | undefined, restaurantId: string | undefined, tableNumber?: string, urlRestaurantId?: string | null) {
  const { isAuthenticated, customer } = useCustomerAuth();
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Gerar token único e seguro
  const generateToken = (): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const randomStr2 = Math.random().toString(36).substring(2, 15);
    return `guest_${timestamp}_${randomStr}${randomStr2}`;
  };

  // Obter storage key único por mesa e restaurante
  const getStorageKey = () => {
    if (tableId && restaurantId) {
      return `guest-token-${restaurantId}-${tableId}`;
    }
    if (urlRestaurantId && tableNumber) {
      return `guest-token-${urlRestaurantId}-${tableNumber}`;
    }
    return null;
  };

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setGuestToken(null);
      setIsReady(true);
      return;
    }

    // Se cliente está autenticado (Plano Profissional+)
    if (isAuthenticated && customer) {
      // Ainda assim manter um token como backup
      let existingToken = localStorage.getItem(storageKey);
      if (!existingToken) {
        existingToken = generateToken();
        localStorage.setItem(storageKey, existingToken);
      }
      setGuestToken(existingToken);
      setIsReady(true);
      return;
    }

    // Se cliente NÃO está autenticado (Plano Básico ou visitante)
    let existingToken = localStorage.getItem(storageKey);
    
    if (!existingToken) {
      // Gerar novo token
      existingToken = generateToken();
      localStorage.setItem(storageKey, existingToken);
    }

    setGuestToken(existingToken);
    setIsReady(true);
  }, [tableId, restaurantId, tableNumber, urlRestaurantId, isAuthenticated, customer]);

  // Limpar token ao sair da mesa
  const clearToken = () => {
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
      setGuestToken(null);
    }
  };

  // Regenerar token (útil para múltiplas visitas)
  const regenerateToken = () => {
    const newToken = generateToken();
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.setItem(storageKey, newToken);
      setGuestToken(newToken);
    }
    return newToken;
  };

  return {
    guestToken,
    isReady,
    clearToken,
    regenerateToken,
  };
}
