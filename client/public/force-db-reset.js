// Script para forçar reset do IndexedDB
console.log('🔧 Iniciando reset forçado do IndexedDB...');

(async function forceReset() {
  try {
    const dbName = 'nabancada_offline';
    
    console.log('📋 Verificando databases...');
    const databases = await indexedDB.databases();
    console.log('Databases encontrados:', databases.map(db => db.name));
    
    const exists = databases.some(db => db.name === dbName);
    
    if (exists) {
      console.log('🗑️ Deletando database antigo...');
      
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      
      deleteRequest.onsuccess = () => {
        console.log('✅ Database deletado com sucesso!');
        console.log('🔄 Recarregando página em 1 segundo...');
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
      console.log('✅ Database não existe. Nada a fazer!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();
