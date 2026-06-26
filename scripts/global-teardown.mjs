import { execFileSync } from 'node:child_process';
import path from 'node:path';

export default async function globalTeardown() {
  const scriptPath = path.resolve(process.cwd(), 'src/config/generate-rich-cucumber-report.mjs');

  try {
    execFileSync(process.execPath, [scriptPath], {
      stdio: 'inherit',
      env: process.env,
    });
  } catch (error) {
    console.error('Failed to generate rich cucumber report:', error);
  }
}
