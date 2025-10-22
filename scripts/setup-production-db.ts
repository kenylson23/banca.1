import '../load-env';
import { ensureTablesExist } from '../server/initDb';

async function setupProductionDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados de produção...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERRO: DATABASE_URL não está configurada!');
    console.error('Por favor, configure a variável de ambiente DATABASE_URL com a connection string do PostgreSQL.\n');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL configurada');
  console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}\n`);

  try {
    console.log('📦 Criando tabelas e estrutura do banco de dados...');
    await ensureTablesExist();
    
    console.log('\n✅ Banco de dados configurado com sucesso!');
    console.log('\n📋 Informações importantes:');
    console.log('   - Todas as tabelas foram criadas');
    console.log('   - Enums do PostgreSQL configurados');
    console.log('   - Super Admin criado (se não existia)');
    console.log('\n🔑 Credenciais do Super Admin:');
    console.log('   Email: superadmin@nabancada.com');
    console.log('   Senha: SuperAdmin123!');
    console.log('\n⚠️  IMPORTANTE: Altere a senha do super admin após o primeiro login!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao configurar o banco de dados:');
    console.error(error instanceof Error ? error.message : error);
    console.error('\n💡 Dicas:');
    console.error('   1. Verifique se o DATABASE_URL está correto');
    console.error('   2. Confirme que o banco PostgreSQL está acessível');
    console.error('   3. Verifique se há problemas de rede/firewall');
    console.error('   4. Confira se as credenciais estão corretas\n');
    process.exit(1);
  }
}

setupProductionDatabase();
