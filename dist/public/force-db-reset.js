// Script para forçar reset do IndexedDB

(async function forceReset() {
  try {
    const dbName = 'nabancada_offline';
    
    const databases = await indexedDB.databases();
    
    const exists = databases.some(db => db.name === dbName);
    
    if (exists) {
      
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      };
      
      deleteRequest.onerror = (e) => {
        console.error('❌ Erro ao deletar:', e);
      };
      
      deleteRequest.onblocked = () => {
        console.warn('⚠️ Operação bloqueada. Feche outras abas e recarregue.');
      };
    } else {
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();
