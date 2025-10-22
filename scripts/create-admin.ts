import '../load-env';
import { storage } from '../server/storage';
import { hashPassword } from '../server/auth';

async function createAdminUser() {
  try {
    console.log('Verificando usuários existentes...');
    
    const existingUser = await storage.getUserByEmail('admin@nabancada.com');
    
    if (existingUser) {
      console.log('✅ Usuário admin já existe!');
      console.log('Email: admin@nabancada.com');
      console.log('Senha: admin123');
      return;
    }

    console.log('Criando usuário admin...');
    
    const hashedPassword = await hashPassword('admin123');
    
    await storage.createUser({
      email: 'admin@nabancada.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'admin',
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('');
    console.log('=================================');
    console.log('Credenciais de acesso:');
    console.log('Email: admin@nabancada.com');
    console.log('Senha: admin123');
    console.log('=================================');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    process.exit(1);
  }
}

createAdminUser();
