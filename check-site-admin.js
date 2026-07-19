import { db } from './src/lib/db.ts';
async function run() {
  const admin = await db.siteAdmin.findFirst({ where: { username: 'admin' } });
  console.log('Site admin:', admin);
}
run();
