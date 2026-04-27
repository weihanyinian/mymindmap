import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';

async function main() {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
