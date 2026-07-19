import { verifyPassword } from './src/lib/auth.ts';
import { db } from './src/lib/db.ts';

async function run() {
  const admin = await db.superAdmin.findFirst({ where: { username: 'admin' } });
  if (!admin) {
    console.log('No admin found');
    return;
  }
  console.log('Admin found:', admin.username);
  console.log('Password hash:', admin.password);
  
  const valid = await verifyPassword('changeme123', admin.password);
  console.log('Password is valid for changeme123?', valid);
}
run();
