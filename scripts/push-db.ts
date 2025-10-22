import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function pushDatabase() {
  try {
    console.log('Aplicando schema ao banco de dados...');
    console.log('DATABASE_URL está definida:', !!process.env.DATABASE_URL);
    
    const { stdout, stderr } = await execAsync('npx drizzle-kit push', {
      env: process.env,
    });
    
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
    
    console.log('Schema aplicado com sucesso!');
  } catch (error: any) {
    console.error('Erro ao aplicar schema:', error.message);
    process.exit(1);
  }
}

pushDatabase();
