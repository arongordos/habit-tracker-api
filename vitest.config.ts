import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true, quiet: true });

export default defineConfig({
  test: {
    globals: true,
    globalSetup: './tests/setup/globalSetup.ts',
  },
});
