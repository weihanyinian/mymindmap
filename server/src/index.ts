import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';
import { seedAdminUser } from './services/seed.service';

async function main() {
  await connectDB();

  // Seed admin account and demo data
  await seedAdminUser();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
