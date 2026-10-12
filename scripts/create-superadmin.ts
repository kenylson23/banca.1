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
  let stage = 'validating setup';
  const setupEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  const setupPassword = process.env.SUPERADMIN_SETUP_PASSWORD;
  const hasSetupInput = Boolean(setupEmail || setupPassword);

  try {
    if (hasSetupInput && (!setupEmail || !setupPassword)) {
      throw new Error('SUPERADMIN_EMAIL e SUPERADMIN_SETUP_PASSWORD devem ser definidos em conjunto.');
    }

    // The database proxy initializes lazily; CLI scripts must await it before
    // accessing query methods.
    stage = 'initializing database connection';
    await initializeConnection();

    console.log('\n🔐 Criação de Super Administrador do NaBancada\n');
    console.log('Este script irá criar um usuário com privilégios de super administrador.');
    console.log('O super administrador pode gerenciar todos os restaurantes da plataforma.\n');

    // Check if superadmin already exists
    stage = 'checking existing super administrators';
    const existingSuperAdmins = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.role, 'superadmin'));

    if (!hasSetupInput && existingSuperAdmins.length > 0) {
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

    const email = setupEmail || await question('Email do super administrador: ');
    
    if (!email || !email.includes('@')) {
      console.log('\n❌ Email inválido.');
      rl.close();
      return;
    }

    // Check if email already exists
    stage = 'checking account email';
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      console.log('\n❌ Este email já está cadastrado no sistema.');
      rl.close();
      return;
    }

    const password = setupPassword || await question('Senha (mínimo 6 caracteres): ');
    
    if (!password || password.length < 6) {
      console.log('\n❌ A senha deve ter pelo menos 6 caracteres.');
      rl.close();
      return;
    }

    const firstName = hasSetupInput ? '' : await question('Nome (opcional): ');
    const lastName = hasSetupInput ? '' : await question('Sobrenome (opcional): ');

    console.log('\n🔄 Criando super administrador...');

    stage = 'hashing password';
    const hashedPassword = await bcrypt.hash(password, 10);

    stage = 'inserting account';
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
    console.error('\n❌ Erro ao criar super administrador.');
    if (hasSetupInput && (!setupEmail || !setupPassword)) {
      console.error('Para o modo seguro, defina SUPERADMIN_EMAIL e SUPERADMIN_SETUP_PASSWORD no mesmo processo.');
      console.error(`Chave de senha disponível no processo: ${Boolean(setupPassword) ? 'sim' : 'não'}.`);
    } else if (hasSetupInput) {
      const candidateCode = error && typeof error === 'object'
        ? (error as { code?: unknown }).code
        : undefined;
      const safeCode = typeof candidateCode === 'string' && /^[A-Z0-9_-]{1,32}$/i.test(candidateCode)
        ? candidateCode
        : 'indisponível';
      const safeName = error instanceof Error ? error.name : 'Erro desconhecido';
      console.error(`Diagnóstico seguro: ${safeName}; código ${safeCode}; etapa ${stage}.`);
      const safeFrames = error instanceof Error
        ? error.stack?.split('\n').slice(1, 4).map(frame => frame.trim()).join(' <- ')
        : '';
      if (safeFrames) {
        console.error(`Rastreamento técnico (sem mensagem): ${safeFrames}`);
      }
    } else {
      console.error(error);
    }
    rl.close();
    process.exit(1);
  }
}

createSuperAdmin();
