import dotenv from 'dotenv';
import { z, ZodError } from 'zod';

process.env.APP_STAGE = process.env.APP_STAGE || 'dev';

const isDevelopment = process.env.APP_STAGE === 'dev';
const isTesting = process.env.APP_STAGE === 'test';

if (isDevelopment) {
  dotenv.config();
} else if (isTesting) {
  dotenv.config({
    path: '.env.test',
  });
}

const envSchema = z.object({
  APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().positive().default(3000),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, { error: 'Must be 32 characters long' }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, { error: 'Must be 32 characters long' }),
});

export type Env = z.infer<typeof envSchema>;
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (e) {
  if (e instanceof ZodError) {
    console.error(JSON.stringify(z.flattenError(e).fieldErrors, null, 2));

    e.issues.forEach((issue) => {
      const path = issue.path.join('.');
      console.error(`${path}: ${issue.message}`);
    });

    process.exit(1);
  }

  throw e;
}

export const isProduction = () => env.APP_STAGE === 'production';
export const isDev = () => env.APP_STAGE === 'dev';
export const isTest = () => env.APP_STAGE === 'test';

export { env };
