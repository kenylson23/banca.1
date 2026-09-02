import '../load-env';
import { db, initializeConnection } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function createSuperAdmin() {
  try {
    // The database proxy initializes lazily; CLI scripts must await it before
    // accessing query methods.
    await initializeConnection();

    console.log('\n🔐 Criação de Super Administrador do NaBancada\n');
    console.log('Este script irá criar um usuário com privilégios de super administrador.');
    console.log('O super administrador pode gerenciar todos os restaurantes da plataforma.\n');

    // Check if superadmin already exists
    const existingSuperAdmins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'superadmin'));

    if (existingSuperAdmins.length > 0) {
      console.log('⚠️  Já existe um super administrador cadastrado:');
      existingSuperAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin.id})`);
      });
      console.log('');
      
      const overwrite = await question('Deseja criar outro super administrador? (s/n): ');
      if (overwrite.toLowerCase() !== 's') {
        console.log('\n❌ Operação cancelada.');
        rl.close();
        return;
      }
    }

    const email = await question('Email do super administrador: ');
    
    if (!email || !email.includes('@')) {
      console.log('\n❌ Email inválido.');
      rl.close();
      return;
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      console.log('\n❌ Este email já está cadastrado no sistema.');
      rl.close();
      return;
    }

    const password = await question('Senha (mínimo 6 caracteres): ');
    
    if (!password || password.length < 6) {
      console.log('\n❌ A senha deve ter pelo menos 6 caracteres.');
      rl.close();
      return;
    }

    const firstName = await question('Nome (opcional): ');
    const lastName = await question('Sobrenome (opcional): ');

    console.log('\n🔄 Criando super administrador...');

    const hashedPassword = await bcrypt.hash(password, 10);

    const [superAdmin] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        role: 'superadmin',
        restaurantId: null,
      })
      .returning();

    console.log('\n✅ Super administrador criado com sucesso!');
    console.log('\n📋 Informações:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Nome: ${superAdmin.firstName || ''} ${superAdmin.lastName || ''}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log('\n🔗 Acesse o painel em: http://localhost:5000');
    console.log('');

    rl.close();
  } catch (error) {
    console.error('\n❌ Erro ao criar super administrador:', error);
    rl.close();
    process.exit(1);
  }
}

createSuperAdmin();
