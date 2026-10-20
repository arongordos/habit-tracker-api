import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', quiet: true });

export default defineConfig({
  test: {
    globals: true,
    globalSetup: './tests/setup/globalSetup.ts',
  },
});
