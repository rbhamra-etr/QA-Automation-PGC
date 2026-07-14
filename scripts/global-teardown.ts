import { execFileSync } from 'node:child_process';
import path from 'node:path';

export default async function globalTeardown(): Promise<void> {
  const scriptPath = path.resolve(process.cwd(), 'scripts/reporting/generate-rich-cucumber-report.ts');

  try {
    execFileSync(process.execPath, ['-r', 'ts-node/register', scriptPath], {
      stdio: 'inherit',
      env: process.env,
    });
  } catch (error) {
    console.error('Failed to generate rich cucumber report:', error);
  }
}
